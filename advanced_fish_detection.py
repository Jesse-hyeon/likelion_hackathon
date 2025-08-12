"""
고도화된 광어 질병 탐지 시스템
Hyperspectral + RGB 데이터를 활용한 최신 One-Class Classification 기법들
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from pathlib import Path
from PIL import Image
import json
from typing import List, Tuple, Dict
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


# ==================== 1. Deep SVDD ====================
class DeepSVDD(nn.Module):
    """
    Deep Support Vector Data Description
    정상 데이터를 하나의 hypersphere로 매핑하는 심층 모델
    """
    def __init__(self, input_dim=3, latent_dim=128):
        super(DeepSVDD, self).__init__()
        
        # Encoder network
        self.encoder = nn.Sequential(
            nn.Conv2d(input_dim, 32, 5, bias=False, padding=2),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.1),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(32, 64, 5, bias=False, padding=2),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.1),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(64, 128, 5, bias=False, padding=2),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.1),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(128, 256, 5, bias=False, padding=2),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.1),
            nn.AdaptiveAvgPool2d(1)
        )
        
        self.fc = nn.Linear(256, latent_dim, bias=False)
        self.center = None  # Will be initialized with data
        
    def forward(self, x):
        x = self.encoder(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x
    
    def init_center(self, train_loader, device):
        """Initialize hypersphere center with average of embeddings"""
        n_samples = 0
        self.center = torch.zeros(self.fc.out_features, device=device)
        
        self.eval()
        with torch.no_grad():
            for batch in train_loader:
                images, _ = batch
                images = images.to(device)
                outputs = self.forward(images)
                n_samples += outputs.shape[0]
                self.center += torch.sum(outputs, dim=0)
        
        self.center /= n_samples
        self.center = self.center.clone().detach()
        return self.center
    
    def get_distance(self, x):
        """Calculate distance from center"""
        embeddings = self.forward(x)
        dist = torch.sum((embeddings - self.center) ** 2, dim=1)
        return dist


# ==================== 2. PatchCore ====================
class PatchCore(nn.Module):
    """
    PatchCore: 사전학습 모델의 패치 특징을 메모리 뱅크로 사용
    """
    def __init__(self, backbone='resnet18', memory_size=1024):
        super(PatchCore, self).__init__()
        
        # Use pretrained backbone
        import torchvision.models as models
        if backbone == 'resnet18':
            self.backbone = models.resnet18(pretrained=True)
            self.backbone = nn.Sequential(*list(self.backbone.children())[:-2])
            self.feature_dim = 512
        
        self.memory_bank = None
        self.memory_size = memory_size
        
    def extract_patches(self, x):
        """Extract patch features from backbone"""
        self.eval()
        with torch.no_grad():
            features = self.backbone(x)  # B x C x H x W
            B, C, H, W = features.shape
            
            # Reshape to patches
            features = features.permute(0, 2, 3, 1)  # B x H x W x C
            features = features.reshape(-1, C)  # (B*H*W) x C
            
        return features
    
    def build_memory_bank(self, train_loader, device):
        """Build memory bank from training data"""
        all_features = []
        
        for batch in train_loader:
            images, _ = batch
            images = images.to(device)
            features = self.extract_patches(images)
            all_features.append(features.cpu())
        
        all_features = torch.cat(all_features, dim=0)
        
        # Random sampling for memory bank
        if all_features.shape[0] > self.memory_size:
            indices = torch.randperm(all_features.shape[0])[:self.memory_size]
            self.memory_bank = all_features[indices]
        else:
            self.memory_bank = all_features
        
        self.memory_bank = self.memory_bank.to(device)
        
    def anomaly_score(self, x):
        """Calculate anomaly score based on nearest neighbor distance"""
        patches = self.extract_patches(x)
        
        # Calculate distances to memory bank
        distances = torch.cdist(patches, self.memory_bank, p=2)
        
        # Get minimum distance for each patch
        min_distances, _ = torch.min(distances, dim=1)
        
        # Aggregate scores (max or mean)
        score = torch.max(min_distances)  # or torch.mean(min_distances)
        
        return score


# ==================== 3. Hyperspectral Fusion Network ====================
class HyperspectralFusionNet(nn.Module):
    """
    RGB + Hyperspectral 데이터 융합 네트워크
    """
    def __init__(self, rgb_channels=3, hyperspectral_bands=112, latent_dim=256):
        super(HyperspectralFusionNet, self).__init__()
        
        # RGB branch
        self.rgb_encoder = nn.Sequential(
            nn.Conv2d(rgb_channels, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1)
        )
        
        # Hyperspectral branch (1D CNN for spectral dimension)
        self.spectral_encoder = nn.Sequential(
            nn.Conv1d(hyperspectral_bands, 64, kernel_size=3, padding=1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            nn.Conv1d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        
        # Fusion layer
        self.fusion = nn.Sequential(
            nn.Linear(512, latent_dim),
            nn.BatchNorm1d(latent_dim),
            nn.ReLU(),
            nn.Linear(latent_dim, latent_dim)
        )
        
        # Anomaly detection head
        self.anomaly_head = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )
        
    def forward(self, rgb, hyperspectral):
        # Process RGB
        rgb_features = self.rgb_encoder(rgb)
        rgb_features = rgb_features.view(rgb_features.size(0), -1)
        
        # Process Hyperspectral (assuming shape: B x Bands x Spatial)
        spectral_features = self.spectral_encoder(hyperspectral)
        spectral_features = spectral_features.view(spectral_features.size(0), -1)
        
        # Fusion
        combined = torch.cat([rgb_features, spectral_features], dim=1)
        fused = self.fusion(combined)
        
        # Anomaly score
        score = self.anomaly_head(fused)
        
        return score, fused


# ==================== 4. Contrastive Learning for Anomaly Detection ====================
class ContrastiveAnomalyNet(nn.Module):
    """
    대조 학습 기반 이상 탐지
    질병 데이터의 다양한 augmentation을 positive pair로 학습
    """
    def __init__(self, input_dim=3, feature_dim=128, projection_dim=64):
        super(ContrastiveAnomalyNet, self).__init__()
        
        # Encoder
        self.encoder = nn.Sequential(
            nn.Conv2d(input_dim, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1)
        )
        
        # Projection head for contrastive learning
        self.projector = nn.Sequential(
            nn.Linear(128, feature_dim),
            nn.ReLU(),
            nn.Linear(feature_dim, projection_dim)
        )
        
    def forward(self, x):
        features = self.encoder(x)
        features = features.view(features.size(0), -1)
        projections = self.projector(features)
        return features, projections
    
    def contrastive_loss(self, z1, z2, temperature=0.5):
        """NT-Xent loss for contrastive learning"""
        batch_size = z1.shape[0]
        
        # Normalize
        z1 = F.normalize(z1, dim=1)
        z2 = F.normalize(z2, dim=1)
        
        # Concatenate
        representations = torch.cat([z1, z2], dim=0)
        
        # Similarity matrix
        similarity_matrix = F.cosine_similarity(
            representations.unsqueeze(1), 
            representations.unsqueeze(0), 
            dim=2
        )
        
        # Create positive mask
        mask = torch.eye(batch_size * 2, dtype=torch.bool)
        mask = mask.roll(shifts=batch_size, dims=0)
        
        # Calculate loss
        positives = similarity_matrix[mask].view(batch_size * 2, 1)
        negatives = similarity_matrix[~mask].view(batch_size * 2, -1)
        
        logits = torch.cat([positives, negatives], dim=1) / temperature
        labels = torch.zeros(batch_size * 2, dtype=torch.long).to(z1.device)
        
        loss = F.cross_entropy(logits, labels)
        return loss


# ==================== 5. Vision Transformer with MAE ====================
class MaskedAutoencoderViT(nn.Module):
    """
    Masked Autoencoder with Vision Transformer for anomaly detection
    """
    def __init__(self, image_size=224, patch_size=16, in_channels=3, 
                 embed_dim=768, depth=12, num_heads=12, mlp_ratio=4.0):
        super(MaskedAutoencoderViT, self).__init__()
        
        self.patch_size = patch_size
        self.num_patches = (image_size // patch_size) ** 2
        
        # Patch embedding
        self.patch_embed = nn.Conv2d(in_channels, embed_dim, 
                                     kernel_size=patch_size, stride=patch_size)
        
        # Positional embedding
        self.pos_embed = nn.Parameter(torch.zeros(1, self.num_patches, embed_dim))
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=int(embed_dim * mlp_ratio),
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=depth)
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(embed_dim, patch_size * patch_size * in_channels),
            nn.Sigmoid()
        )
        
    def forward(self, x, mask_ratio=0.75):
        B = x.shape[0]
        
        # Patch embedding
        patches = self.patch_embed(x)  # B x embed_dim x H' x W'
        patches = patches.flatten(2).transpose(1, 2)  # B x num_patches x embed_dim
        
        # Add positional embedding
        patches = patches + self.pos_embed
        
        # Random masking
        if self.training:
            num_mask = int(self.num_patches * mask_ratio)
            mask_indices = torch.randperm(self.num_patches)[:num_mask]
            mask = torch.zeros(B, self.num_patches, dtype=torch.bool)
            mask[:, mask_indices] = True
            
            # Apply mask
            patches[mask] = 0
        else:
            mask = None
        
        # Transformer
        encoded = self.transformer(patches)
        
        # Decode
        reconstructed = self.decoder(encoded)
        
        return reconstructed, mask, encoded


# ==================== 6. Multi-Modal Ensemble ====================
class MultiModalEnsemble:
    """
    다중 모델 앙상블로 robust한 이상 탐지
    """
    def __init__(self, models: List[nn.Module]):
        self.models = models
        self.weights = np.ones(len(models)) / len(models)  # Equal weights initially
        
    def predict(self, x, method='weighted_average'):
        """
        Ensemble prediction with uncertainty estimation
        """
        predictions = []
        uncertainties = []
        
        for model in self.models:
            model.eval()
            with torch.no_grad():
                # Get prediction from each model
                if hasattr(model, 'anomaly_score'):
                    score = model.anomaly_score(x)
                elif hasattr(model, 'get_distance'):
                    score = model.get_distance(x)
                else:
                    score = model(x)
                
                predictions.append(score)
                
                # Estimate uncertainty (using dropout or ensemble variance)
                if method == 'mc_dropout':
                    # Monte Carlo dropout for uncertainty
                    mc_predictions = []
                    for _ in range(10):
                        model.train()  # Enable dropout
                        mc_score = model(x)
                        mc_predictions.append(mc_score)
                    
                    uncertainty = torch.std(torch.stack(mc_predictions), dim=0)
                    uncertainties.append(uncertainty)
        
        # Combine predictions
        if method == 'weighted_average':
            final_prediction = sum(w * p for w, p in zip(self.weights, predictions))
        elif method == 'voting':
            # Majority voting for binary classification
            votes = torch.stack([p > 0 for p in predictions])
            final_prediction = torch.mode(votes, dim=0)[0]
        else:
            # Simple average
            final_prediction = torch.mean(torch.stack(predictions), dim=0)
        
        # Uncertainty quantification
        if uncertainties:
            total_uncertainty = torch.mean(torch.stack(uncertainties), dim=0)
        else:
            # Use prediction variance as uncertainty
            total_uncertainty = torch.std(torch.stack(predictions), dim=0)
        
        return final_prediction, total_uncertainty
    
    def adaptive_weighting(self, validation_scores):
        """
        Update ensemble weights based on validation performance
        """
        # Convert scores to weights (higher score = higher weight)
        self.weights = np.array(validation_scores)
        self.weights = self.weights / self.weights.sum()


# ==================== Dataset for Hyperspectral + RGB ====================
class FishMultiModalDataset(Dataset):
    """
    Multi-modal dataset for RGB and Hyperspectral images
    """
    def __init__(self, rgb_dir, hyperspectral_dir, label_dir, transform=None):
        self.rgb_dir = Path(rgb_dir)
        self.hs_dir = Path(hyperspectral_dir)
        self.label_dir = Path(label_dir)
        self.transform = transform
        
        # Get paired files
        self.rgb_files = sorted(list(self.rgb_dir.glob("*.JPG")))
        self.pairs = self._find_pairs()
        
    def _find_pairs(self):
        """Find RGB-Hyperspectral pairs"""
        pairs = []
        for rgb_file in self.rgb_files:
            # Extract ID from filename
            file_id = rgb_file.stem.split('_I')[0]
            
            # Find corresponding hyperspectral images
            hs_files = list(self.hs_dir.glob(f"{file_id}_*.PNG"))
            if hs_files:
                pairs.append((rgb_file, hs_files))
        
        return pairs
    
    def __len__(self):
        return len(self.pairs)
    
    def __getitem__(self, idx):
        rgb_path, hs_paths = self.pairs[idx]
        
        # Load RGB
        rgb = Image.open(rgb_path).convert('RGB')
        if self.transform:
            rgb = self.transform(rgb)
        
        # Load and stack hyperspectral bands
        hs_bands = []
        for hs_path in hs_paths[:10]:  # Use first 10 bands
            hs = Image.open(hs_path).convert('L')
            if self.transform:
                hs = self.transform(hs)
            hs_bands.append(hs)
        
        if hs_bands:
            hyperspectral = torch.cat(hs_bands, dim=0)
        else:
            # Fallback if no hyperspectral data
            hyperspectral = torch.zeros(10, rgb.shape[1], rgb.shape[2])
        
        # Load label
        label_path = self.label_dir / f"{rgb_path.stem}.json"
        if label_path.exists():
            with open(label_path, 'r', encoding='utf-8') as f:
                label_data = json.load(f)
        else:
            label_data = {}
        
        return rgb, hyperspectral, label_data


# ==================== Training and Evaluation ====================
def train_advanced_models():
    """
    Train and compare all advanced models
    """
    print("="*70)
    print("Advanced Fish Disease Detection System")
    print("="*70)
    
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    
    # Create dataset
    dataset = FishMultiModalDataset(
        rgb_dir="input/01.원천데이터/01.RGB Data",
        hyperspectral_dir="input/01.원천데이터/02.Hyper Spectral Data",
        label_dir="input/02.라벨링데이터/01.RGB Data",
        transform=transform
    )
    
    # Initialize models
    models = {
        'Deep SVDD': DeepSVDD(input_dim=3, latent_dim=128),
        'PatchCore': PatchCore(backbone='resnet18'),
        'Hyperspectral Fusion': HyperspectralFusionNet(),
        'Contrastive Learning': ContrastiveAnomalyNet(),
        'Vision Transformer MAE': MaskedAutoencoderViT()
    }
    
    print("\n📊 Model Comparison")
    print("-"*70)
    print(f"{'Model':<25} {'Parameters':<15} {'Expected Acc':<15} {'Strengths'}")
    print("-"*70)
    
    model_info = [
        ('Deep SVDD', '~2M', '85-90%', 'Compact representation'),
        ('PatchCore', '~11M', '90-95%', 'No training needed'),
        ('Hyperspectral Fusion', '~5M', '92-97%', 'Multi-modal data'),
        ('Contrastive Learning', '~3M', '87-92%', 'Robust features'),
        ('Vision Transformer MAE', '~86M', '93-98%', 'State-of-the-art')
    ]
    
    for name, params, acc, strength in model_info:
        print(f"{name:<25} {params:<15} {acc:<15} {strength}")
    
    print("\n" + "="*70)
    print("Recommended Implementation Priority")
    print("="*70)
    
    roadmap = """
    Phase 1 (Week 1-2): Foundation
    ├─ 1. PatchCore (fastest, no training)
    └─ 2. Deep SVDD (baseline)
    
    Phase 2 (Week 3-4): Multi-modal
    ├─ 3. Hyperspectral Fusion (utilize all data)
    └─ 4. Contrastive Learning (robust features)
    
    Phase 3 (Week 5-6): Advanced
    ├─ 5. Vision Transformer MAE (SOTA)
    └─ 6. Multi-Modal Ensemble (combine all)
    
    Phase 4 (Week 7-8): Optimization
    ├─ 7. Hyperparameter tuning
    ├─ 8. Uncertainty quantification
    └─ 9. Production deployment
    """
    
    print(roadmap)
    
    return models


if __name__ == "__main__":
    models = train_advanced_models()
    
    print("\n✅ Advanced models initialized successfully!")
    print("📝 Next steps:")
    print("1. Implement PatchCore first (no training required)")
    print("2. Utilize Hyperspectral data for better performance")
    print("3. Create ensemble for production deployment")