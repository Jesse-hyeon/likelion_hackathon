"""
광어 질병 탐지 - 간단한 버전
scikit-learn의 One-Class SVM을 사용한 이상 탐지
"""

import json
import numpy as np
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')


class SimpleFishDiseaseDetector:
    """간단한 광어 질병 탐지기"""
    
    def __init__(self):
        self.image_dir = Path("input/01.원천데이터/01.RGB Data")
        self.label_dir = Path("input/02.라벨링데이터/01.RGB Data")
        self.model = None
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=50)  # 50차원으로 축소
        
    def extract_features(self, image_path):
        """이미지에서 특징 추출"""
        # 이미지 로드 및 리사이즈
        img = Image.open(image_path).convert('RGB')
        img = img.resize((64, 64))  # 작은 크기로 리사이즈
        
        # numpy 배열로 변환
        img_array = np.array(img)
        
        # 특징 추출 (간단한 방법들)
        features = []
        
        # 1. 색상 히스토그램
        for channel in range(3):  # RGB 각 채널
            hist, _ = np.histogram(img_array[:,:,channel], bins=16, range=(0, 256))
            features.extend(hist / hist.sum())  # 정규화
        
        # 2. 평균과 표준편차
        features.append(img_array.mean())
        features.append(img_array.std())
        
        # 3. 엣지 검출 (간단한 그래디언트)
        gray = np.dot(img_array[...,:3], [0.2989, 0.5870, 0.1140])
        dx = np.diff(gray, axis=1).mean()
        dy = np.diff(gray, axis=0).mean()
        features.extend([dx, dy])
        
        return np.array(features)
    
    def load_data(self):
        """데이터 로드 및 특징 추출"""
        print("데이터 로딩 중...")
        
        features = []
        labels = []
        file_names = []
        
        # 이미지 파일 목록
        image_files = sorted(list(self.image_dir.glob("*.JPG")))[:100]  # 최대 100개
        
        for img_path in image_files:
            # 특징 추출
            feat = self.extract_features(img_path)
            features.append(feat)
            
            # 라벨 정보 (질병 ID)
            json_path = self.label_dir / f"{img_path.stem}.json"
            if json_path.exists():
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    diseases = []
                    if 'annotations' in data:
                        for ann in data['annotations']:
                            if 'disease' in ann:
                                diseases.extend(ann['disease'])
                    labels.append(list(set(diseases)))
            else:
                labels.append([])
            
            file_names.append(img_path.stem)
        
        print(f"총 {len(features)}개 이미지 로드 완료")
        
        return np.array(features), labels, file_names
    
    def train(self, features):
        """One-Class SVM 학습"""
        print("\n모델 학습 중...")
        
        # 특징 정규화
        features_scaled = self.scaler.fit_transform(features)
        
        # PCA로 차원 축소
        features_pca = self.pca.fit_transform(features_scaled)
        
        # One-Class SVM 학습
        self.model = OneClassSVM(
            kernel='rbf',
            gamma='auto',
            nu=0.1  # 이상치 비율 (10%)
        )
        self.model.fit(features_pca)
        
        print("학습 완료!")
        
        return features_pca
    
    def predict(self, features):
        """예측"""
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        features_pca = self.pca.transform(features_scaled)
        
        # 예측 (-1: 이상치/정상, 1: 정상/질병)
        prediction = self.model.predict(features_pca)
        score = self.model.decision_function(features_pca)
        
        return prediction[0], score[0]
    
    def evaluate(self, features, labels):
        """모델 평가"""
        print("\n모델 평가 중...")
        
        features_scaled = self.scaler.transform(features)
        features_pca = self.pca.transform(features_scaled)
        
        predictions = self.model.predict(features_pca)
        scores = self.model.decision_function(features_pca)
        
        # 통계
        n_inliers = (predictions == 1).sum()
        n_outliers = (predictions == -1).sum()
        
        print(f"질병 패턴 (Inlier): {n_inliers}개")
        print(f"이상 패턴 (Outlier): {n_outliers}개")
        print(f"이상 탐지 비율: {n_outliers/len(predictions)*100:.1f}%")
        
        return predictions, scores
    
    def visualize_results(self, features_pca, predictions, scores):
        """결과 시각화"""
        # PCA 2D 시각화
        plt.figure(figsize=(15, 5))
        
        # 1. PCA 산점도
        plt.subplot(1, 3, 1)
        colors = ['blue' if p == 1 else 'red' for p in predictions]
        plt.scatter(features_pca[:, 0], features_pca[:, 1], c=colors, alpha=0.6)
        plt.xlabel('First Principal Component')
        plt.ylabel('Second Principal Component')
        plt.title('PCA 시각화 (파란색: 질병, 빨간색: 이상)')
        plt.grid(True, alpha=0.3)
        
        # 2. 결정 점수 분포
        plt.subplot(1, 3, 2)
        plt.hist(scores, bins=30, alpha=0.7, color='green', edgecolor='black')
        plt.axvline(0, color='red', linestyle='--', label='결정 경계')
        plt.xlabel('Decision Score')
        plt.ylabel('Frequency')
        plt.title('결정 점수 분포')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # 3. 예측 결과 파이 차트
        plt.subplot(1, 3, 3)
        labels = ['질병 패턴', '이상 패턴']
        sizes = [(predictions == 1).sum(), (predictions == -1).sum()]
        colors = ['lightblue', 'lightcoral']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.title('예측 결과 분포')
        
        plt.tight_layout()
        plt.savefig('results/one_class_svm_results.png', dpi=100, bbox_inches='tight')
        plt.show()


def main():
    """메인 실행"""
    print("="*60)
    print("광어 질병 탐지 - One-Class SVM")
    print("="*60)
    
    # 결과 디렉토리 생성
    Path("results").mkdir(exist_ok=True)
    
    # 탐지기 생성
    detector = SimpleFishDiseaseDetector()
    
    # 데이터 로드
    features, labels, file_names = detector.load_data()
    
    # 데이터 분할 (80% 학습, 20% 테스트)
    train_features, test_features, train_labels, test_labels, train_files, test_files = \
        train_test_split(features, labels, file_names, test_size=0.2, random_state=42)
    
    print(f"\n데이터 분할: 학습 {len(train_features)}개, 테스트 {len(test_features)}개")
    
    # 모델 학습
    features_pca = detector.train(train_features)
    
    # 평가
    predictions, scores = detector.evaluate(train_features, train_labels)
    
    # 시각화
    detector.visualize_results(features_pca, predictions, scores)
    
    # 테스트 데이터로 예측
    print("\n" + "="*60)
    print("테스트 데이터 예측 결과 (샘플)")
    print("="*60)
    
    for i in range(min(5, len(test_features))):
        pred, score = detector.predict(test_features[i])
        status = "질병 의심" if pred == 1 else "정상 가능성"
        
        print(f"\n파일: {test_files[i]}")
        print(f"  실제 질병: {test_labels[i] if test_labels[i] else '정보 없음'}")
        print(f"  예측: {status}")
        print(f"  결정 점수: {score:.4f}")
        print(f"  신뢰도: {abs(score):.4f}")
    
    print("\n" + "="*60)
    print("분석 완료!")
    print("="*60)
    print("\n해석 방법:")
    print("- 질병 패턴 (Inlier): 학습한 질병 패턴과 유사")
    print("- 이상 패턴 (Outlier): 학습한 질병 패턴과 다름 → 정상 가능성")
    print("- 결정 점수 > 0: 질병 의심")
    print("- 결정 점수 < 0: 정상 가능성")


if __name__ == "__main__":
    main()