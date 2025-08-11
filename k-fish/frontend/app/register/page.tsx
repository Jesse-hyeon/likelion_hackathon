'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { productAPI, auctionAPI } from '@/lib/api';
import { MapPin, Package, Camera, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterProduct() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const addProduct = useStore((state) => state.addProduct);
  
  const [formData, setFormData] = useState({
    species: '',
    weight: '',
    quantity: '',
    catchDateTime: new Date().toISOString().slice(0, 16),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    startPrice: '',
    auctionLocation: '부산',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRFID, setShowRFID] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setShowRFID(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const productData = {
        species: formData.species,
        weight: parseFloat(formData.weight),
        quantity: parseInt(formData.quantity),
        catchDateTime: formData.catchDateTime,
        catchLocation: formData.catchLocation,
        fishermanId: currentUser?.id || '1',
        photos: ['/api/placeholder/400/300'],
      };

      const product = await productAPI.create(productData);
      addProduct(product);

      const auctionData = {
        productId: product.id,
        startPrice: parseFloat(formData.startPrice),
        location: formData.auctionLocation,
      };

      await auctionAPI.create(auctionData);

      setTimeout(() => {
        router.push('/dashboard/fisherman');
      }, 2000);
    } catch (error) {
      console.error('Failed to register product:', error);
      setShowRFID(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          catchLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/fisherman"
            className="inline-flex items-center text-primary hover:text-blue-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            대시보드로 돌아가기
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              수산물 등록
            </h1>

            {showRFID && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg animate-pulse">
                <div className="flex items-center justify-center">
                  <Package className="text-green-600 mr-3" size={24} />
                  <div>
                    <p className="font-semibold text-green-800">RFID 태그 생성됨</p>
                    <p className="text-sm text-green-600">RFID-{Date.now()}</p>
                    <p className="text-sm text-green-600">BOX-{Math.floor(Math.random() * 10000)}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  어종 *
                </label>
                <select
                  required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">선택하세요</option>
                  <option value="고등어">고등어</option>
                  <option value="갈치">갈치</option>
                  <option value="오징어">오징어</option>
                  <option value="광어">광어</option>
                  <option value="우럭">우럭</option>
                  <option value="참치">참치</option>
                  <option value="연어">연어</option>
                  <option value="새우">새우</option>
                  <option value="전복">전복</option>
                  <option value="해삼">해삼</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    중량 (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수량 (마리) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  어획 일시 *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.catchDateTime}
                  onChange={(e) => setFormData({ ...formData, catchDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  어획 위치
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`위도: ${formData.catchLocation.lat.toFixed(4)}, 경도: ${formData.catchLocation.lng.toFixed(4)}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleLocationCapture}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <MapPin size={20} className="mr-1" />
                    GPS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사진 업로드
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    클릭하여 사진 업로드
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG (최대 10MB)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">경매 정보</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작가 (원) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.startPrice}
                      onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      경매 위치 *
                    </label>
                    <select
                      required
                      value={formData.auctionLocation}
                      onChange={(e) => setFormData({ ...formData, auctionLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="부산">부산</option>
                      <option value="인천">인천</option>
                      <option value="목포">목포</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" />
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </button>
                <Link
                  href="/dashboard/fisherman"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
                >
                  취소
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}