"""
가짜 정상 데이터로 진짜 성능 테스트
"""

import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report
import random

def create_pseudo_normal_data():
    """가짜 정상 데이터 생성"""
    print("Creating pseudo-normal data...")
    
    pseudo_normals = []
    methods = []
    
    # 방법 1: 질병 이미지를 극단적으로 변형
    image_dir = Path("input/01.원천데이터/01.RGB Data")
    sample_images = list(image_dir.glob("*.JPG"))[:5]
    
    for img_path in sample_images:
        img = Image.open(img_path).convert('RGB')
        img_small = img.resize((64, 64))
        
        # 극단적 블러링 (질병 특징 제거)
        from PIL import ImageFilter
        blurred = img_small.filter(ImageFilter.GaussianBlur(radius=10))
        pseudo_normals.append(np.array(blurred))
        methods.append("Heavy Blur")
        
        # 색상 반전 (완전히 다른 패턴)
        inverted = Image.eval(img_small, lambda x: 255 - x)
        pseudo_normals.append(np.array(inverted))
        methods.append("Color Invert")
        
        # 노이즈 추가 (패턴 교란)
        noisy = np.array(img_small)
        noise = np.random.normal(0, 50, noisy.shape)
        noisy = np.clip(noisy + noise, 0, 255).astype(np.uint8)
        pseudo_normals.append(noisy)
        methods.append("Heavy Noise")
    
    # 방법 2: 단색 이미지 (명확한 비질병)
    for color in [(100, 150, 200), (200, 100, 100), (100, 200, 100)]:
        solid = np.full((64, 64, 3), color, dtype=np.uint8)
        pseudo_normals.append(solid)
        methods.append("Solid Color")
    
    print(f"Created {len(pseudo_normals)} pseudo-normal samples")
    return pseudo_normals, methods

def extract_simple_features(image):
    """간단한 특징 추출"""
    if isinstance(image, str):
        img = Image.open(image).convert('RGB')
        img = img.resize((64, 64))
        image = np.array(img)
    
    features = []
    
    # 색상 히스토그램
    for channel in range(3):
        hist, _ = np.histogram(image[:,:,channel], bins=16, range=(0, 256))
        features.extend(hist / (hist.sum() + 1e-10))
    
    # 통계
    features.append(image.mean())
    features.append(image.std() + 1e-10)
    
    return np.array(features)

def test_real_performance():
    """진짜 성능 테스트"""
    print("="*60)
    print("Real Performance Test with Pseudo-Normal Data")
    print("="*60)
    
    # 1. 질병 데이터 로드
    print("\n1. Loading disease data...")
    disease_dir = Path("input/01.원천데이터/01.RGB Data")
    disease_images = list(disease_dir.glob("*.JPG"))[:50]
    
    disease_features = []
    for img_path in disease_images:
        features = extract_simple_features(str(img_path))
        disease_features.append(features)
    disease_features = np.array(disease_features)
    
    # 2. 가짜 정상 데이터 생성
    print("\n2. Creating pseudo-normal data...")
    pseudo_normals, methods = create_pseudo_normal_data()
    
    normal_features = []
    for img in pseudo_normals:
        features = extract_simple_features(img)
        normal_features.append(features)
    normal_features = np.array(normal_features)
    
    # 3. One-Class SVM 학습 (질병 데이터로만)
    print("\n3. Training One-Class SVM on disease data...")
    scaler = StandardScaler()
    disease_scaled = scaler.fit_transform(disease_features)
    
    model = OneClassSVM(kernel='rbf', gamma='auto', nu=0.1)
    model.fit(disease_scaled)
    
    # 4. 테스트 (질병 + 가짜 정상)
    print("\n4. Testing on disease and pseudo-normal data...")
    
    # 질병 테스트
    disease_pred = model.predict(disease_scaled)
    disease_scores = model.decision_function(disease_scaled)
    
    # 정상 테스트
    normal_scaled = scaler.transform(normal_features)
    normal_pred = model.predict(normal_scaled)
    normal_scores = model.decision_function(normal_scaled)
    
    # 5. 성능 평가
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)
    
    # 질병 데이터 결과
    disease_correct = (disease_pred == 1).sum()  # 1 = 질병으로 정확히 판단
    disease_accuracy = disease_correct / len(disease_pred) * 100
    
    print(f"\n[Disease Data] (Should be detected as disease)")
    print(f"  Correctly identified as disease: {disease_correct}/{len(disease_pred)} ({disease_accuracy:.1f}%)")
    print(f"  Incorrectly identified as normal: {len(disease_pred) - disease_correct}")
    print(f"  Average confidence score: {disease_scores.mean():.4f}")
    
    # 정상 데이터 결과
    normal_correct = (normal_pred == -1).sum()  # -1 = 정상으로 정확히 판단
    normal_accuracy = normal_correct / len(normal_pred) * 100
    
    print(f"\n[Pseudo-Normal Data] (Should be detected as normal)")
    print(f"  Correctly identified as normal: {normal_correct}/{len(normal_pred)} ({normal_accuracy:.1f}%)")
    print(f"  Incorrectly identified as disease: {len(normal_pred) - normal_correct}")
    print(f"  Average confidence score: {normal_scores.mean():.4f}")
    
    # 전체 정확도
    total_correct = disease_correct + normal_correct
    total_samples = len(disease_pred) + len(normal_pred)
    overall_accuracy = total_correct / total_samples * 100
    
    print(f"\n[Overall Performance]")
    print(f"  Total accuracy: {overall_accuracy:.1f}%")
    print(f"  Sensitivity (detecting disease): {disease_accuracy:.1f}%")
    print(f"  Specificity (detecting normal): {normal_accuracy:.1f}%")
    
    # 6. 시각화
    plt.figure(figsize=(15, 5))
    
    # 점수 분포
    plt.subplot(1, 3, 1)
    plt.hist(disease_scores, bins=20, alpha=0.5, label='Disease', color='red')
    plt.hist(normal_scores, bins=20, alpha=0.5, label='Pseudo-Normal', color='blue')
    plt.axvline(0, color='black', linestyle='--', label='Decision Boundary')
    plt.xlabel('Decision Score')
    plt.ylabel('Frequency')
    plt.title('Score Distribution')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # 혼동 행렬
    plt.subplot(1, 3, 2)
    y_true = [1]*len(disease_pred) + [0]*len(normal_pred)
    y_pred = [1 if p == 1 else 0 for p in disease_pred] + [1 if p == 1 else 0 for p in normal_pred]
    
    cm = confusion_matrix(y_true, y_pred)
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    plt.colorbar()
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.xticks([0, 1], ['Normal', 'Disease'])
    plt.yticks([0, 1], ['Normal', 'Disease'])
    
    for i in range(2):
        for j in range(2):
            plt.text(j, i, str(cm[i, j]), ha='center', va='center', color='white' if cm[i, j] > cm.max()/2 else 'black')
    
    # 성능 요약
    plt.subplot(1, 3, 3)
    plt.axis('off')
    
    summary_text = f"""
    Real Performance Summary
    ========================
    
    Overall Accuracy: {overall_accuracy:.1f}%
    
    Disease Detection: {disease_accuracy:.1f}%
    (Sensitivity)
    
    Normal Detection: {normal_accuracy:.1f}%
    (Specificity)
    
    Interpretation:
    - Can detect disease: {'Yes' if disease_accuracy > 70 else 'Partially'}
    - Can detect normal: {'Yes' if normal_accuracy > 70 else 'Partially'}
    - Ready for use: {'Yes' if overall_accuracy > 80 else 'Need improvement'}
    
    Note: Using pseudo-normal data
    Real normal data would give
    different results!
    """
    
    plt.text(0.1, 0.5, summary_text, fontsize=10, family='monospace', verticalalignment='center')
    
    plt.tight_layout()
    plt.savefig('results/real_performance_test.png', dpi=100, bbox_inches='tight')
    plt.show()
    
    print("\n" + "="*60)
    print("INTERPRETATION")
    print("="*60)
    print("""
This is closer to REAL performance because:
1. We tested with "normal-like" data (not disease)
2. We measured both sensitivity and specificity
3. We can see the decision boundary effectiveness

However, remember:
- Pseudo-normal ≠ Real normal fish
- Real performance might be different
- Need actual normal fish for validation
""")

if __name__ == "__main__":
    test_real_performance()