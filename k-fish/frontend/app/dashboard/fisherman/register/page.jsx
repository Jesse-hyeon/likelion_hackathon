'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Upload, Camera, Fish, MapPin, Weight, 
  Hash, DollarSign, CheckCircle,
  AlertCircle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function FishermanRegisterPage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    species,
    quantity,
    weight,
    catchLocation,
    catchDate).toISOString().split('T')[0],
    expectedPrice,
    notes
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
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length < 3) {
      alert('최소 3장의 사진이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      // 상품 등록 (검토 대기 상태로)
      await api.post('/products', {
        species,
        quantity),
        weight),
        startPrice),
        catchDateTime).toISOString(),
        catchLocation, lng},
        fishermanId,
        photos=> img.url),
        status, // 검토 대기 상태
        notes
      });
      
      alert('✅ 수산물 등록이 완료되었습니다!\n위판장에서 검토 후 경매가 진행됩니다.');
      router.push('/dashboard/fisherman');
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">수산물 등록</h1>
          <p className="text-gray-600">{currentUser?.name} | {currentUser?.companyName}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Fish className="w-5 h-5" />
              수산물 정보 입력
            </h2>
            <p className="text-gray-600 text-sm mt-1">위판장 검토 후 경매에 등록됩니다</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* 사진 업로드 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                상품 사진 ({images.length}/6)
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
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
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>사진 촬영 팁:</strong> 상품의 전체 모습, 색상, 크기를 잘 보여주는 사진을 최소 3장 업로드해주세요.
                </p>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Fish className="w-4 h-4 inline mr-1" />
                  수산물 종류 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({...prev, species}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예, 동해 고등어"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  수량 (마리) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({...prev, quantity}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  총 중량 (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({...prev, weight}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  어획 지역
                </label>
                <input
                  type="text"
                  value={formData.catchLocation}
                  onChange={(e) => setFormData(prev => ({...prev, catchLocation}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  어획일
                </label>
                <input
                  type="date"
                  value={formData.catchDate}
                  onChange={(e) => setFormData(prev => ({...prev, catchDate}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  희망 시작가 (원)
                </label>
                <input
                  type="number"
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData(prev => ({...prev, expectedPrice}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="150000"
                />
              </div>
            </div>

            {/* 추가 메모 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 정보
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({...prev, notes}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="품질, 보관 상태, 특이사항 등을 자유롭게 작성해주세요"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={loading || images.length < 3}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    등록 중...
                  </>
                ) 
                  <>
                    <CheckCircle className="w-5 h-5" />
                    등록 신청
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">등록 프로세스 안내</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 등록 신청 후 위판장에서 상품을 검토합니다</li>
                <li>• AI 품질 평가를 통해 등급이 결정됩니다</li>
                <li>• 승인되면 자동으로 경매에 등록됩니다</li>
                <li>• 등록 현황은 대시보드에서 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}