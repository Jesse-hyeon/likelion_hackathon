'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { 
  ShoppingCart, TrendingUp, Package, Clock, Award, 
  Filter, ArrowUpRight, ArrowDownRight, Activity, 
  DollarSign, Fish, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { productAPI, auctionAPI } from '@/lib/api';
import { getGradeColor, getGradeTextColor } from '@/lib/aiQualityAssessment';

export default function EnhancedBuyerDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const currentMode = useStore((state) => state.currentMode);
  const setCurrentMode = useStore((state) => state.setCurrentMode);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  
  const [bids, setBids] = useState([]);
  const [auctionsWithProducts, setAuctionsWithProducts] = useState([]);
  const [gradeStats, setGradeStats] = useState({});

  useEffect(() => {
    setCurrentMode('buyer');
    loadData();
  }, []);

  useEffect(() => {
    const combined = auctions.map(auction => ({
      ...auction,
      product: products.find(p => p.id === auction.productId)
    }));
    setAuctionsWithProducts(combined);
    
    calculateGradeStats(combined);
  }, [auctions, products]);

  const calculateGradeStats = (auctionsData) => {
    const stats = {};
    const myWins = auctionsData.filter(
      a => a.status === 'ended' && a.highestBidder === currentUser?.id
    );
    
    myWins.forEach(auction => {
      const grade = auction.product?.qualityAssessment?.overallGrade;
      if (grade) {
        stats[grade] = (stats[grade] || 0) + 1;
      }
    });
    
    setGradeStats(stats);
  };

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getAll(),
      ]);
      setProducts(productsData);
      setAuctions(auctionsData);
      
      const mockBids = [
        {
          id: '1',
          auctionId: auctionsData[0]?.id || '',
          bidderId: currentUser?.id || '',
          amount: 55000,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          auctionId: auctionsData[1]?.id || '',
          bidderId: currentUser?.id || '',
          amount: 72000,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      setBids(mockBids);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const myWins = auctionsWithProducts.filter(
    a => a.status === 'ended' && a.highestBidder === currentUser?.id
  );
  const liveAuctions = auctionsWithProducts.filter(a => a.status === 'live');
  const totalSpent = myWins.reduce((sum, a) => sum + a.currentPrice, 0);
  const averagePrice = myWins.length > 0 ? totalSpent / myWins.length : 0;
  const myActiveBids = liveAuctions.filter(a => 
    bids.some(b => b.auctionId === a.id && b.bidderId === currentUser?.id)
  );

  const recentActivity = [
    ...myWins.map(a => ({ type: 'win', auction: a, timestamp: a.endTime })),
    ...bids.map(b => ({ type: 'bid', bid: b, timestamp: b.timestamp }))
  ].sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">구매자 대시보드</h1>
            <p className="text-gray-600">
              {currentUser?.name} ({currentUser?.companyName})
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/auction/enhanced-page"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Fish className="w-5 h-5" />
              경매장 가기
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="낙찰 건수"
            value={myWins.length}
            icon={ShoppingCart}
            color="primary"
          />
          <StatCard
            title="진행중 입찰"
            value={myActiveBids.length}
            icon={Activity}
            color="success"
          />
          <StatCard
            title="총 구매액"
            value={`₩${totalSpent.toLocaleString()}`}
            icon={DollarSign}
            color="warning"
          />
          <StatCard
            title="평균 낙찰가"
            value={`₩${Math.round(averagePrice).toLocaleString()}`}
            icon={TrendingUp}
            color="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">최근 활동</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    {activity.type === 'win' ? (
                      <>
                        <div className="bg-green-100 p-2 rounded-full">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {'auction' in activity && activity.auction.product?.species} 낙찰
                          </p>
                          <p className="text-sm text-gray-600">
                            ₩{'auction' in activity && activity.auction.currentPrice.toLocaleString()}
                            {'auction' in activity && activity.auction.product?.qualityAssessment && (
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${getGradeTextColor(activity.auction.product.qualityAssessment.overallGrade)}`}>
                                {activity.auction.product.qualityAssessment.overallGrade}
                              </span>
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-100 p-2 rounded-full">
                          <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">입찰 참여</p>
                          <p className="text-sm text-gray-600">
                            ₩{'bid' in activity && activity.bid.amount.toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {activity.timestamp && new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">아직 활동 내역이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">품질 등급별 구매</h3>
              <div className="space-y-2">
                {['A+', 'A', 'B+', 'B', 'C', 'D'].map(grade => {
                  const count = gradeStats[grade] || 0;
                  const percentage = myWins.length > 0 ? (count / myWins.length * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(grade)} text-white`}>
                          {grade}
                        </span>
                        <span className="text-sm text-gray-600">{count}건</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getGradeColor(grade)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">빠른 작업</h3>
              <div className="space-y-2">
                <Link
                  href="/auction/enhanced-page"
                  className="block w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-center"
                >
                  실시간 경매 참여
                </Link>
                <Link
                  href="/tracking"
                  className="block w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 text-center"
                >
                  배송 추적
                </Link>
                <button className="block w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 text-center">
                  구매 내역 보기
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">진행중인 경매</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {liveAuctions.slice(0, 5).map((auction) => (
                <div key={auction.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {auction.product?.species || '상품명 없음'}
                        {auction.product?.qualityAssessment && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${getGradeTextColor(auction.product.qualityAssessment.overallGrade)}`}>
                            {auction.product.qualityAssessment.overallGrade}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        현재가: ₩{auction.currentPrice.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href="/auction/enhanced-page"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      참여하기 →
                    </Link>
                  </div>
                </div>
              ))}
              {liveAuctions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  진행중인 경매가 없습니다
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">배송 현황</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">고등어 50마리</p>
                    <p className="text-sm text-gray-600">예상 도착: 오늘 15:00</p>
                  </div>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  배송중
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">갈치 30마리</p>
                    <p className="text-sm text-gray-600">도착 완료</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  완료
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}