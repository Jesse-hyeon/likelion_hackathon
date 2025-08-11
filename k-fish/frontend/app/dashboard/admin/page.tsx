'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { 
  Users, Fish, Gavel, CheckCircle, XCircle, Clock, 
  Package, AlertTriangle, TrendingUp, BarChart3,
  Eye, Award, Camera, Loader2, Home, FileText, LogOut, Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productAPI, auctionAPI, api } from '@/lib/api';
import { assessQuality, getGradeColor } from '@/lib/aiQualityAssessment';
import { initialProducts, initialAuctions } from '@/lib/initialData';

export default function AdminDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  
  const [activeTab, setActiveTab] = useState('main');
  const [pickupRecords, setPickupRecords] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const [selectedPickupRecord, setSelectedPickupRecord] = useState<string | null>(null);
  const [pickupNotes, setPickupNotes] = useState<{[key: string]: string}>({});
  const [pickupFilter, setPickupFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getAll()
      ]);
      
      // 공통 초기 데이터 사용
      setProducts([...productsData, ...initialProducts]);
      setAuctions([...auctionsData, ...initialAuctions]);
      
      // 낙찰된 상품들의 수령 현황 생성
      const wonAuctions = auctionsData.filter(a => a.status === 'ended' && a.highestBidder);
      const mockPickupData = wonAuctions.map(auction => {
        const status = Math.random() > 0.3 ? 'completed' : 'pending';
        return {
          id: auction.id,
          auctionId: auction.id,
          productId: auction.productId,
          buyerId: auction.highestBidder,
          buyerName: `구매자 ${auction.highestBidder?.slice(-4)}`,
          buyerPhone: `010-****-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          finalPrice: auction.currentPrice,
          pickupStatus: status,
          pickupDate: status === 'completed' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null,
          scheduledPickupDate: new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
          auctionEndTime: auction.endTime,
          notes: status === 'completed' ? '수령 완료' : '',
          verificationCode: `PH${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
        };
      });
      setPickupRecords(mockPickupData);
      
      // 검토 대기 상품들 생성 (시연용)
      const mockPendingProducts = [
        {
          id: 'pending1',
          species: '포항 대게',
          quantity: 50,
          weight: 25.5,
          fishermanName: '박선장',
          catchLocation: '포항 앞바다',
          catchDate: new Date().toISOString(),
          expectedPrice: 150000,
          photos: [
            'https://images.unsplash.com/photo-1565733293285-77aa342b22dd?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          notes: '오늘 새벽에 잡은 싱싱한 대게입니다. 크기가 균등하고 상태가 매우 양호합니다.'
        },
        {
          id: 'pending2',
          species: '동해 고등어',
          quantity: 100,
          weight: 35.0,
          fishermanName: '김어민',
          catchLocation: '동해 연안',
          catchDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expectedPrice: 80000,
          photos: [
            'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1554998171-706e730d721d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1517115358639-5720382c99e9?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          notes: '신선도 최상급, 급속 냉동 처리 완료'
        },
        {
          id: 'pending3',
          species: '포항 과메기용 꽁치',
          quantity: 200,
          weight: 40.0,
          fishermanName: '이선장',
          catchLocation: '포항 구룡포',
          catchDate: new Date().toISOString(),
          expectedPrice: 120000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          notes: '과메기용 최상급 꽁치, 크기 선별 완료'
        },
        {
          id: 'pending4',
          species: '동해 오징어',
          quantity: 80,
          weight: 30.0,
          fishermanName: '최어부',
          catchLocation: '울릉도 근해',
          catchDate: new Date().toISOString(),
          expectedPrice: 95000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          notes: '투명도 최상, 신선도 A급'
        },
        {
          id: 'pending5',
          species: '포항 구룡포 문어',
          quantity: 30,
          weight: 45.0,
          fishermanName: '강선장',
          catchLocation: '구룡포 앞바다',
          catchDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expectedPrice: 180000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          notes: '대형 문어, 평균 1.5kg'
        },
        {
          id: 'pending6',
          species: '동해 가자미',
          quantity: 150,
          weight: 28.0,
          fishermanName: '정어민',
          catchLocation: '포항 죽도시장 인근',
          catchDate: new Date().toISOString(),
          expectedPrice: 75000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          notes: '회용 가자미, 선도 최상급'
        },
        {
          id: 'pending7',
          species: '영덕 대게',
          quantity: 40,
          weight: 32.0,
          fishermanName: '윤선장',
          catchLocation: '영덕 앞바다',
          catchDate: new Date().toISOString(),
          expectedPrice: 200000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          notes: '특대 사이즈, 평균 800g'
        },
        {
          id: 'pending8',
          species: '포항 전어',
          quantity: 300,
          weight: 25.0,
          fishermanName: '송어부',
          catchLocation: '포항 영일만',
          catchDate: new Date().toISOString(),
          expectedPrice: 65000,
          photos: [
            'https://images.unsplash.com/photo-1541235222796-cf1b99c73c75?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?w=400&h=300&fit=crop'
          ],
          status: 'pending_review',
          submittedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          notes: '가을 전어, 기름기 풍부'
        }
      ];
      setPendingProducts(mockPendingProducts);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const liveAuctions = auctions.filter(a => a.status === 'live');
  const pendingAuctions = auctions.filter(a => a.status === 'pending');
  const endedAuctions = auctions.filter(a => a.status === 'ended' && a.highestBidder);
  const totalRevenue = endedAuctions.reduce((sum, a) => sum + a.currentPrice, 0);
  const pendingPickups = pickupRecords.filter(p => p.pickupStatus === 'pending');
  const completedPickups = pickupRecords.filter(p => p.pickupStatus === 'completed');
  
  const handleUpdatePickupStatus = async (recordId: string, status: 'pending' | 'completed') => {
    // 실제로는 API 호출
    const note = pickupNotes[recordId] || '';
    setPickupRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            pickupStatus: status, 
            pickupDate: status === 'completed' ? new Date().toISOString() : null,
            notes: note || record.notes
          }
        : record
    ));
    
    if (status === 'completed') {
      alert('✅ 수령 처리가 완료되었습니다.');
    }
    setSelectedPickupRecord(null);
    setPickupNotes(prev => ({ ...prev, [recordId]: '' }));
  };

  const getFilteredPickupRecords = () => {
    if (pickupFilter === 'all') return pickupRecords;
    if (pickupFilter === 'pending') return pickupRecords.filter(r => r.pickupStatus === 'pending');
    return pickupRecords.filter(r => r.pickupStatus === 'completed');
  };

  const handleStartAuction = async (auctionId: string) => {
    try {
      // API 호출하여 경매 시작
      await api.put(`/auctions/${auctionId}`, { status: 'live' });
      
      // 상태 업데이트
      setAuctions(prev => prev.map(auction => 
        auction.id === auctionId 
          ? { ...auction, status: 'live', startTime: new Date().toISOString() }
          : auction
      ));
      
      alert('✅ 경매가 시작되었습니다!');
    } catch (error) {
      console.error('Failed to start auction:', error);
      alert('❌ 경매 시작에 실패했습니다.');
    }
  };

  const handleQualityAssessment = async (productId: string) => {
    setProcessingProductId(productId);
    try {
      const product = pendingProducts.find(p => p.id === productId);
      if (!product) return;

      // AI 품질 평가 시뮬레이션
      const assessment = await assessQuality(
        product.photos.map((url: string) => ({ url, file: null })), 
        product.species
      );

      // 상품 상태 업데이트
      setPendingProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, qualityAssessment: assessment, status: 'reviewed' }
          : p
      ));

    } catch (error) {
      console.error('Quality assessment failed:', error);
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const product = pendingProducts.find(p => p.id === productId);
      if (!product || !product.qualityAssessment) return;

      // 상품을 승인하고 경매에 등록 (pending 상태로 먼저 등록)
      const newAuction = {
        id: `auction_${Date.now()}`,
        productId,
        startPrice: product.expectedPrice,
        currentPrice: product.expectedPrice,
        location: '포항',
        status: 'pending',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        bids: [],
        highestBidder: null
      };
      
      setAuctions(prev => [...prev, newAuction]);

      // 대기 목록에서 제거
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      
      alert('✅ 상품이 승인되어 경매 대기 목록에 등록되었습니다!\n실시간 경매 탭에서 경매를 시작할 수 있습니다.');
      
    } catch (error) {
      console.error('Product approval failed:', error);
    }
  };

  const handleRejectProduct = async (productId: string, reason?: string) => {
    try {
      // 실제로는 API 호출하여 반려 처리
      setPendingProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, status: 'rejected', rejectionReason: reason }
          : p
      ));
      
      alert('❌ 상품이 반려되었습니다. 어민에게 알림이 전송됩니다.');
      
    } catch (error) {
      console.error('Product rejection failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">위판장 관리 시스템</h1>
          <p className="text-gray-600">{currentUser?.name} | {currentUser?.companyName}</p>
        </div>

        {/* 네비게이션 바 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'main'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5 inline mr-2" />
              메인페이지
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'review'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              검토처리
              {pendingProducts.filter(p => p.status === 'pending_review').length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {pendingProducts.filter(p => p.status === 'pending_review').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'auction'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Gavel className="w-5 h-5 inline mr-2" />
              실시간 경매
            </button>
            <button
              onClick={() => setActiveTab('pickup')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'pickup'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              수령 확인
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div>
          {activeTab === 'main' && (
            <div>
              {/* 상단 요약 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">검토요청</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {pendingProducts.filter(p => p.status === 'pending_review').length}건
                      </p>
                    </div>
                    <AlertTriangle className="w-12 h-12 text-yellow-500" />
                  </div>
                  <button
                    onClick={() => setActiveTab('review')}
                    className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline"
                  >
                    검토 처리하기 →
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">진행중 경매</p>
                      <p className="text-3xl font-bold text-gray-800">{liveAuctions.length}개</p>
                    </div>
                    <Gavel className="w-12 h-12 text-green-500" />
                  </div>
                  <button
                    onClick={() => setActiveTab('auction')}
                    className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline"
                  >
                    경매 현황 보기 →
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">수령 대기</p>
                      <p className="text-3xl font-bold text-gray-800">{pendingPickups.length}개</p>
                    </div>
                    <Package className="w-12 h-12 text-blue-500" />
                  </div>
                  <button
                    onClick={() => setActiveTab('pickup')}
                    className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline"
                  >
                    수령 관리하기 →
                  </button>
                </div>
              </div>

              {/* 실시간 경매 현황 */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    실시간 경매 현황
                  </h2>
                </div>
                <div className="p-6">
                  {liveAuctions.length > 0 ? (
                    <div className="space-y-4">
                      {liveAuctions.map((auction) => {
                        const product = products.find(p => p.id === auction.productId);
                        return (
                          <div key={auction.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {product?.species || '상품정보없음'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {product?.quantity || 0}마리 | {product?.weight || 0}kg
                                </p>
                                <div className="mt-2">
                                  <span className="text-sm text-gray-600">현재가: </span>
                                  <span className="text-lg font-bold text-blue-600">
                                    ₩{auction.currentPrice?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  진행중
                                </span>
                                <p className="text-sm text-gray-600 mt-2">
                                  입찰: {auction.bids?.length || 0}건
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <Link
                        href="/auction"
                        className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        전체 경매 현황 보기
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">진행중인 경매가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div>
              {/* 상품 등록 검토 */}
              <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              등록 상품 검토
            </h3>
          </div>
          
          <div className="p-6">
            {pendingProducts.filter(p => p.status !== 'rejected').length > 0 ? (
              <div className="space-y-6">
                {pendingProducts.filter(p => p.status !== 'rejected').map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.species}</h3>
                        <p className="text-sm text-gray-600">
                          {product.fishermanName} | {product.quantity}마리 | {product.weight}kg
                        </p>
                        <p className="text-sm text-gray-500">
                          등록: {new Date(product.submittedAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₩{product.expectedPrice.toLocaleString()}</div>
                        {product.status === 'pending_review' ? (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                            <Clock className="w-3 h-3" />
                            검토대기
                          </span>
                        ) : product.status === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                            <Eye className="w-3 h-3" />
                            검토완료
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    {/* 상품 사진 */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {product.photos.slice(0, 3).map((photo: string, index: number) => (
                        <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                          {photo.startsWith('http') ? (
                            <img 
                              src={photo} 
                              alt={`${product.species} 사진 ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200';
                                  fallback.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* 상품 정보 */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">어획지역: </span>
                        <span className="text-gray-900">{product.catchLocation}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">어획일: </span>
                        <span className="text-gray-900">{new Date(product.catchDate).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    
                    {product.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>어민 메모:</strong> {product.notes}
                        </p>
                      </div>
                    )}
                    
                    {/* AI 품질 평가 결과 */}
                    {product.qualityAssessment && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            AI 품질 평가 결과
                          </h4>
                          <div className={`px-3 py-1 rounded-full text-white font-bold ${getGradeColor(product.qualityAssessment.overallGrade)}`}>
                            {product.qualityAssessment.overallGrade} 등급
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>신선도:</span>
                              <span>{product.qualityAssessment.freshness.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>색상/광택:</span>
                              <span>{product.qualityAssessment.colorShine.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>크기/형태:</span>
                              <span>{product.qualityAssessment.sizeShape.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>손상도:</span>
                              <span>{product.qualityAssessment.damage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 액션 버튼 */}
                    <div className="flex gap-3">
                      {product.status === 'pending_review' && (
                        <button
                          onClick={() => handleQualityAssessment(product.id)}
                          disabled={processingProductId === product.id}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingProductId === product.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              AI 평가 중...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              AI 품질 평가
                            </>
                          )}
                        </button>
                      )}
                      
                      {product.status === 'reviewed' && product.qualityAssessment && (
                        <>
                          <button
                            onClick={() => handleApproveProduct(product.id)}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            승인 (경매등록)
                          </button>
                          <button
                            onClick={() => handleRejectProduct(product.id, '품질 기준 미달')}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            반려
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">검토 대기중인 상품이 없습니다</p>
              </div>
            )}
          </div>
              </div>
            </div>
          )}

          {activeTab === 'pickup' && (
            <div>
              {/* 수령 현황 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">수령 대기</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {pickupRecords.filter(r => r.pickupStatus === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">수령 완료</p>
                      <p className="text-2xl font-bold text-green-600">
                        {pickupRecords.filter(r => r.pickupStatus === 'completed').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">오늘 수령</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {pickupRecords.filter(r => 
                          r.pickupDate && new Date(r.pickupDate).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* 수령 현황 관리 */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      낙찰 상품 수령 관리
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPickupFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pickupFilter === 'all' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        전체
                      </button>
                      <button
                        onClick={() => setPickupFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pickupFilter === 'pending' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        미수령
                      </button>
                      <button
                        onClick={() => setPickupFilter('completed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pickupFilter === 'completed' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        완료
                      </button>
                    </div>
                  </div>
                </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">인증코드</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">상품정보</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">구매자</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">낙찰가</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">예정수령일</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">상태</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">실제수령일</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPickupRecords().map((record) => {
                    const product = products.find(p => p.id === record.productId);
                    return (
                      <>
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="font-mono font-bold text-blue-600">{record.verificationCode}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-gray-900">{product?.species || '상품정보없음'}</div>
                            <div className="text-xs text-gray-500">{product?.quantity || 0}마리 | {product?.weight || 0}kg</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-sm font-medium text-gray-900">{record.buyerName}</div>
                            <div className="text-xs text-gray-500">{record.buyerPhone}</div>
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-gray-900">
                            ₩{record.finalPrice?.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-center text-sm">
                            {record.scheduledPickupDate ? 
                              new Date(record.scheduledPickupDate).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'
                            }
                          </td>
                          <td className="py-3 px-2 text-center">
                            {record.pickupStatus === 'completed' ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                수령완료
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                수령대기
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center text-sm text-gray-600">
                            {record.pickupDate ? 
                              new Date(record.pickupDate).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'
                            }
                          </td>
                          <td className="py-3 px-2 text-center">
                            {record.pickupStatus !== 'completed' ? (
                              <button
                                onClick={() => setSelectedPickupRecord(record.id)}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                              >
                                처리
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">완료</span>
                            )}
                          </td>
                        </tr>
                        
                        {/* 수령 처리 폼 */}
                        {selectedPickupRecord === record.id && (
                          <tr>
                            <td colSpan={8} className="p-4 bg-blue-50">
                              <div className="max-w-2xl mx-auto">
                                <h4 className="font-semibold text-gray-800 mb-3">수령 처리</h4>
                                <div className="space-y-3">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700 mb-2">
                                      <strong>인증코드:</strong> {record.verificationCode}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <strong>구매자:</strong> {record.buyerName} ({record.buyerPhone})
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      메모 / 특이사항
                                    </label>
                                    <textarea
                                      value={pickupNotes[record.id] || ''}
                                      onChange={(e) => setPickupNotes(prev => ({ ...prev, [record.id]: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                      rows={2}
                                      placeholder="수령 관련 메모를 입력하세요"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdatePickupStatus(record.id, 'completed')}
                                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                      수령 완료 처리
                                    </button>
                                    <button
                                      onClick={() => setSelectedPickupRecord(null)}
                                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                  {getFilteredPickupRecords().length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        {pickupFilter === 'pending' ? '대기중인 수령 건이 없습니다' :
                         pickupFilter === 'completed' ? '완료된 수령 건이 없습니다' :
                         '낙찰된 상품이 없습니다'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
              </div>
            </div>
          )}

          {activeTab === 'auction' && (
            <div>
              {/* 진행중인 경매 현황 */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    실시간 경매 현황
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    현재 진행중인 경매: <span className="font-semibold text-blue-600">{liveAuctions.length}건</span>
                  </p>
                </div>
                
                <div className="p-6">
                  {liveAuctions.length > 0 ? (
                    <div className="space-y-4">
                      {liveAuctions.map((auction) => {
                        const product = products.find(p => p.id === auction.productId);
                        return (
                          <div key={auction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {product?.species || '상품정보없음'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {product?.quantity || 0}마리 | {product?.weight || 0}kg
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  진행중
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm text-gray-600">현재가: </span>
                                <span className="text-xl font-bold text-blue-600">
                                  ₩{auction.currentPrice?.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                입찰: {auction.bids?.length || 0}건
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">시작가: ₩{auction.startPrice?.toLocaleString()}</span>
                                <span className="text-gray-600">
                                  최고 입찰자: {auction.highestBidder ? `#${auction.highestBidder.slice(-4)}` : '없음'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <Link
                        href="/auction"
                        className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                      >
                        실시간 경매장에서 더 자세히 보기 →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">진행중인 경매가 없습니다</p>
                      <Link
                        href="/auction"
                        className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        경매장 바로가기
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 대기중인 경매 */}
              {pendingAuctions.length > 0 && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    대기중인 경매 ({pendingAuctions.length}건)
                  </h3>
                  <div className="space-y-3">
                    {pendingAuctions.slice(0, 5).map((auction) => {
                      const product = products.find(p => p.id === auction.productId);
                      return (
                        <div key={auction.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">{product?.species}</p>
                              <p className="text-sm text-gray-600">
                                {product?.quantity}마리 | 시작가: ₩{auction.startPrice?.toLocaleString()}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleStartAuction(auction.id)}
                              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                            >
                              경매 시작
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}