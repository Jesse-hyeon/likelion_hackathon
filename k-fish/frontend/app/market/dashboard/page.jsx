'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Upload, Camera, AlertCircle, CheckCircle, Loader2, 
  Package, Clock, Award, Users, TrendingUp, ArrowRight
} from 'lucide-react';
import { assessQuality, getGradeColor, ProductImage, QualityAssessment } from '@/lib/aiQualityAssessment';
import { api } from '@/lib/api';

export default function MarketDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  
  const [step, setStep] = useState(1); // 1, 2, 3, 4
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  
  const [productData, setProductData] = useState({
    species,
    quantity,
    weight,
    catchLocation,
    fishermanName,
    expectedPrice
  });

  const handleImageUpload = (e>) => {
    const files = e.target.files;
    if (files) {
      const newImages= [];
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        newImages.push({ file, url });
      });
      setImages(prev => [...prev, ...newImages].slice(0, 6));
      
      if (newImages.length >= 3) {
        setStep(3); // AI 평가 단계로
      }
    }
  };

  const handleAssessQuality = async () => {
    if (images.length < 3) {
      alert('최소 3장의 사진이 필요합니다.');
      return;
    }

    setAssessmentLoading(true);
    try {
      const assessment = await assessQuality(images, productData.species);
      setQualityAssessment(assessment);
      setStep(4); // 경매 등록 단계로
    } catch (error) {
      console.error('Quality assessment failed:', error);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleRegisterAuction = async () => {
    if (!qualityAssessment) return;

    setLoading(true);
    try {
      // 상품 등록
      const product = await api.post('/products', {
        species,
        quantity),
        weight),
        startPrice),
        catchDateTime).toISOString(),
        catchLocation, lng},
        fishermanId,
        photos=> img.url),
        qualityAssessment,
        qualityStatus
      });
      
      // 경매 등록
      await api.post('/auctions', {
        productId,
        startPrice),
        location,
        duration,
        status
      });
      
      alert('✅ 경매가 성공적으로 등록되었습니다!');
      
      // 구매자 모드로 전환 안내
      setTimeout(() => {
        if (confirm('구매자 모드에서 입찰을 확인하시겠습니까?')) {
          router.push('/buyer/dashboard');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (images.length <= 3) {
      setStep(2);
      setQualityAssessment(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">포항 죽도 위판장</h1>
              <p className="text-gray-600">수산물 입고 및 경매 등록 시스템</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{currentUser?.name}</p>
              <p className="text-lg font-semibold text-blue-600">{currentUser?.companyName}</p>
            </div>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            {[
              { num, title, icon},
              { num, title, icon},
              { num, title, icon},
              { num, title, icon}
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step >= s.num ? 'bg-blue-500 text-white' 
                  } ${step === s.num ? 'ring-4 ring-blue-200 animate-pulse' }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    step >= s.num ? 'text-blue-600' 
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">📦 수산물 입고 정보</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">품목</label>
                    <input
                      value={productData.species}
                      onChange={(e) => setProductData(prev => ({...prev, species}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">수량 (마리)</label>
                    <input
                      value={productData.quantity}
                      onChange={(e) => setProductData(prev => ({...prev, quantity}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">중량 (kg)</label>
                    <input
                      value={productData.weight}
                      onChange={(e) => setProductData(prev => ({...prev, weight}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">어민</label>
                    <input
                      value={productData.fishermanName}
                      onChange={(e) => setProductData(prev => ({...prev, fishermanName}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">산지</label>
                    <input
                      value={productData.catchLocation}
                      onChange={(e) => setProductData(prev => ({...prev, catchLocation}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">희망 시작가 (원)</label>
                    <input
                      value={productData.expectedPrice}
                      onChange={(e) => setProductData(prev => ({...prev, expectedPrice}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  다음 단계
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step >= 2 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">📷 상품 사진 촬영</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 6 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">사진 추가</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {images.length >= 3 && step === 2 && (
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    다음 단계
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {step >= 3 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold mb-6">🤖 AI 품질 평가</h2>
                
                {!qualityAssessment && !assessmentLoading && (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">업로드된 사진을 AI가 분석하여 품질을 평가합니다</p>
                    <button
                      onClick={handleAssessQuality}
                      className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 mx-auto"
                    >
                      <Camera className="w-5 h-5" />
                      AI 품질 평가 시작
                    </button>
                  </div>
                )}
                
                {assessmentLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">AI 분석 중...</h3>
                    <p className="text-gray-600">신선도, 색상, 크기, 손상도를 종합 평가하고 있습니다</p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {qualityAssessment && (
                  <div>
                    <div className="text-center mb-6">
                      <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${getGradeColor(qualityAssessment.overallGrade)} text-white mb-2`}>
                        {qualityAssessment.overallGrade} 등급
                      </div>
                      <p className="text-sm text-gray-600">신뢰도)}%</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>신선도</span>
                          <span>{qualityAssessment.freshness.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>색상/광택</span>
                          <span>{qualityAssessment.colorShine.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>크기/형태</span>
                          <span>{qualityAssessment.sizeShape.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>손상도</span>
                          <span>{qualityAssessment.damage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width}%` }} />
                        </div>
                      </div>
                    </div>
                    
                    {step === 4 && (
                      <button
                        onClick={handleRegisterAuction}
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            경매 등록 중...
                          </>
                        ) 
                          <>
                            <CheckCircle className="w-5 h-5" />
                            경매 등록 완료
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold mb-4">📊 오늘의 현황</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">입고 건수</span>
                  <span className="font-semibold">23건</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">경매 진행</span>
                  <span className="font-semibold text-green-600">15건</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 거래액</span>
                  <span className="font-semibold">₩15,240,000</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-800 mb-3">💡 시연 안내</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>• 실제 위판장 업무 흐름</p>
                <p>• AI가 2-3초만에 품질 평가</p>
                <p>• 등급별 자동 경매 등록</p>
                <p>• 실시간 구매자 입찰 연동</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}