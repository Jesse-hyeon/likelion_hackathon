'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { 
  ShoppingCart, TrendingUp, Clock, CheckCircle, 
  AlertCircle, Gavel, MapPin, Calendar, Home,
  Package, History, FileText, TrendingDown, Download
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productAPI, auctionAPI } from '@/lib/api';
import { initialProducts, initialAuctions } from '@/lib/initialData';
import * as XLSX from 'xlsx';

export default function BuyerDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const auctions = useStore((state) => state.auctions);
  const products = useStore((state) => state.products);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  const [myPickups, setMyPickups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('auction');  // 기본 탭을 경매로 변경
  const [pickupFilter, setPickupFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getAll(),
      ]);
      
      // 공통 초기 데이터 사용
      setProducts([...productsData, ...initialProducts]);
      setAuctions([...auctionsData, ...initialAuctions]);
    } catch (error) {
      console.error('Failed to load data:', error);
      // API 실패 시에도 초기 데이터 사용
      setProducts(initialProducts);
      setAuctions(initialAuctions);
    }
  };

  const myWins = auctions.filter(
    a => a.status === 'ended' && a.highestBidder === currentUser?.id
  );
  const liveAuctions = auctions.filter(a => a.status === 'live');
  const totalSpent = myWins.reduce((sum, a) => sum + a.currentPrice, 0);
  
  // 내 수령 현황 생성 (예시 데이터 포함)
  useEffect(() => {
    // 실제 낙찰 데이터
    const pickupData = myWins.map(auction => {
      const product = products.find(p => p.id === auction.productId);
      return {
        id: auction.id,
        auctionId: auction.id,
        productName: product?.species || '상품명 없음',
        quantity: product?.quantity || 0,
        weight: product?.weight || 0,
        finalPrice: auction.currentPrice,
        auctionEndDate: auction.endTime,
        pickupStatus: Math.random() > 0.4 ? 'picked_up' : 'pending',
        pickupLocation: '포항 죽도시장 위판장',
        pickupDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        verificationCode: `PH${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
      };
    });
    
    // 예시 데이터 추가
    const mockPickupData = [
      {
        id: 'mock1',
        auctionId: 'auction1',
        productName: '포항 대게',
        quantity: 30,
        weight: 18,
        finalPrice: 250000,
        auctionEndDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pickupStatus: 'pending',
        pickupLocation: '포항 죽도시장 위판장',
        pickupDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        verificationCode: 'PH45678'
      },
      {
        id: 'mock2',
        auctionId: 'auction2',
        productName: '동해 고등어',
        quantity: 100,
        weight: 35,
        finalPrice: 85000,
        auctionEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        pickupStatus: 'picked_up',
        pickupLocation: '포항 죽도시장 위판장',
        pickupDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        verificationCode: 'PH23456'
      },
      {
        id: 'mock3',
        auctionId: 'auction3',
        productName: '포항 과메기용 꽁치',
        quantity: 200,
        weight: 40,
        finalPrice: 120000,
        auctionEndDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        pickupStatus: 'pending',
        pickupLocation: '포항 죽도시장 위판장',
        pickupDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        verificationCode: 'PH67890'
      },
      {
        id: 'mock4',
        auctionId: 'auction4',
        productName: '동해 오징어',
        quantity: 80,
        weight: 30,
        finalPrice: 95000,
        auctionEndDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        pickupStatus: 'picked_up',
        pickupLocation: '포항 죽도시장 위판장',
        pickupDeadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        verificationCode: 'PH12345'
      }
    ];
    
    setMyPickups([...pickupData, ...mockPickupData]);
  }, [myWins, products]);
  
  const pendingPickups = myPickups.filter(p => p.pickupStatus === 'pending');
  const completedPickups = myPickups.filter(p => p.pickupStatus === 'picked_up');

  // 날짜 필터링 함수
  const filterByDate = (pickups: any[]) => {
    const now = new Date();
    const filtered = pickups.filter(pickup => {
      const auctionDate = new Date(pickup.auctionEndDate);
      
      switch(dateFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return auctionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return auctionDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return auctionDate >= quarterAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredPickups = filterByDate(myPickups);

  const exportToExcel = () => {
    // 엑셀 데이터 준비 - 필터링된 데이터 사용
    const excelData = filteredPickups.map(pickup => ({
      '인증코드': pickup.verificationCode,
      '상품명': pickup.productName,
      '수량(마리)': pickup.quantity,
      '중량(kg)': pickup.weight,
      '낙찰가격': pickup.finalPrice,
      '낙찰일시': new Date(pickup.auctionEndDate).toLocaleDateString('ko-KR'),
      '수령상태': pickup.pickupStatus === 'picked_up' ? '수령완료' : '수령대기',
      '수령장소': pickup.pickupLocation,
      '수령기한': new Date(pickup.pickupDeadline).toLocaleDateString('ko-KR')
    }));

    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 열 너비 설정
    const colWidths = [
      { wch: 12 }, // 인증코드
      { wch: 20 }, // 상품명
      { wch: 10 }, // 수량
      { wch: 10 }, // 중량
      { wch: 15 }, // 낙찰가격
      { wch: 15 }, // 낙찰일시
      { wch: 12 }, // 수령상태
      { wch: 25 }, // 수령장소
      { wch: 15 }  // 수령기한
    ];
    ws['!cols'] = colWidths;

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '구매내역');

    // 파일명에 현재 날짜 추가
    const fileName = `구매내역_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // 파일 다운로드
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">구매업체 대시보드</h1>
          <p className="text-gray-600">{currentUser?.name} | {currentUser?.companyName}</p>
        </div>

        {/* 네비게이션 바 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
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
              수령 현황
              {pendingPickups.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {pendingPickups.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5 inline mr-2" />
              구매 내역
            </button>
          </div>
        </div>

        {/* 실시간 경매 탭 (메인) */}
        {activeTab === 'auction' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                실시간 경매
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                현재 진행중인 경매: <span className="font-semibold text-blue-600">{liveAuctions.length}건</span>
              </p>
            </div>
            <div className="p-6">
              {liveAuctions.length > 0 ? (
                <div className="space-y-4">
                  {liveAuctions.slice(0, 5).map((auction) => {
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
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">현재가</p>
                            <p className="text-xl font-bold text-blue-600">
                              ₩{auction.currentPrice?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => window.location.href = '/auction'}
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                  >
                    실시간 경매장으로 이동 →
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">진행중인 경매가 없습니다</p>
                  <button
                    onClick={() => window.location.href = '/auction'}
                    className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    경매장 바로가기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 수령 현황 탭 */}
        {activeTab === 'pickup' && (
          <div>
            {/* 수령 현황 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">수령 대기</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {pendingPickups.length}건
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">수령 완료</p>
                    <p className="text-2xl font-bold text-green-800">
                      {completedPickups.length}건
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">총 구매액</p>
                    <p className="text-xl font-bold text-blue-800">
                      ₩{myPickups.reduce((sum, p) => sum + p.finalPrice, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    낙찰 상품 수령 현황
                  </h2>
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
                      수령대기
                    </button>
                    <button
                      onClick={() => setPickupFilter('completed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pickupFilter === 'completed' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      수령완료
                    </button>
                  </div>
                </div>
              </div>
          
              <div className="p-6">
                {/* 수령 대기 섹션 */}
                {(pickupFilter === 'all' || pickupFilter === 'pending') && pendingPickups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      수령 대기 상품
                    </h3>
                    <div className="space-y-4">
                      {pendingPickups.map((pickup) => (
                        <div key={pickup.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-blue-600 font-bold text-base bg-white px-2 py-1 rounded">
                                  {pickup.verificationCode}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  수령대기
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-lg">{pickup.productName}</h3>
                              <p className="text-sm text-gray-600">{pickup.quantity}마리 | {pickup.weight}kg</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">낙찰가</div>
                              <div className="text-xl font-bold text-gray-900">₩{pickup.finalPrice.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-3 bg-white rounded p-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{pickup.pickupLocation}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">수령기한: {new Date(pickup.pickupDeadline).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm text-blue-800 font-medium mb-1">
                              📍 수령 안내
                            </p>
                            <p className="text-sm text-blue-700">
                              위판장 1층 수령대에서 인증코드와 신분증을 제시해주세요.
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              운영시간: 오전 6시 ~ 오후 6시 (일요일 휴무)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 수령 완료 섹션 */}
                {(pickupFilter === 'all' || pickupFilter === 'completed') && completedPickups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      수령 완료 상품
                    </h3>
                    <div className="space-y-4">
                      {completedPickups.map((pickup) => (
                        <div key={pickup.id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-gray-600 text-sm">
                                  {pickup.verificationCode}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  수령완료
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-700">{pickup.productName}</h3>
                              <p className="text-sm text-gray-500">{pickup.quantity}마리 | {pickup.weight}kg</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">낙찰가</div>
                              <div className="text-lg font-bold text-gray-700">₩{pickup.finalPrice.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <span>수령일: </span>
                            <span className="font-medium">
                              {pickup.pickupDate ? new Date(pickup.pickupDate).toLocaleDateString('ko-KR') : '정보 없음'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 데이터 없음 표시 */}
                {((pickupFilter === 'pending' && pendingPickups.length === 0) ||
                  (pickupFilter === 'completed' && completedPickups.length === 0) ||
                  (pickupFilter === 'all' && myPickups.length === 0)) && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {pickupFilter === 'pending' ? '수령 대기중인 상품이 없습니다' :
                       pickupFilter === 'completed' ? '수령 완료된 상품이 없습니다' :
                       '낙찰받은 상품이 없습니다'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 구매 내역 탭 */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    구매 내역
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    조회된 건수: <span className="font-semibold">{filteredPickups.length}건</span> | 
                    총 구매액: <span className="font-semibold text-blue-600">
                      ₩{filteredPickups.reduce((sum, p) => sum + p.finalPrice, 0).toLocaleString()}
                    </span>
                  </p>
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  엑셀 다운로드
                </button>
              </div>
              
              {/* 기간 필터 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  최근 1주
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  최근 1개월
                </button>
                <button
                  onClick={() => setDateFilter('quarter')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === 'quarter' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  최근 3개월
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredPickups.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-700">상품명</th>
                        <th className="text-center py-3 px-2 font-medium text-gray-700">수량</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-700">낙찰가</th>
                        <th className="text-center py-3 px-2 font-medium text-gray-700">낙찰일</th>
                        <th className="text-center py-3 px-2 font-medium text-gray-700">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 필터링된 데이터 표시 */}
                      {filteredPickups.map((pickup) => {
                        const auction = auctions.find(a => a.id === pickup.auctionId);
                        return (
                          <tr key={pickup.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="font-medium text-gray-900">{pickup.productName}</div>
                              <div className="text-xs text-gray-500">{pickup.weight}kg | 인증: {pickup.verificationCode}</div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {pickup.quantity}마리
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-gray-900">
                              ₩{pickup.finalPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-center text-sm text-gray-600">
                              {new Date(pickup.auctionEndDate).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {pickup?.pickupStatus === 'picked_up' ? (
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {dateFilter !== 'all' ? '선택한 기간에 구매 내역이 없습니다' : '낙찰받은 상품이 없습니다'}
                  </p>
                  <button
                    onClick={() => window.location.href = '/auction'}
                    className="inline-block mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    경매 참여하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}