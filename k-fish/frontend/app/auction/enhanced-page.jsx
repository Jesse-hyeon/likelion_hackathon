'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { socketService } from '@/lib/socket';
import { productAPI, auctionAPI } from '@/lib/api';
import { 
  Gavel, Users, TrendingUp, AlertCircle, Filter, Clock, 
  Award, DollarSign, Package, Timer, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { getGradeColor, getGradeTextColor } from '@/lib/aiQualityAssessment';

export default function EnhancedAuctionPage() {
  const currentUser = useStore((state) => state.currentUser);
  const currentMode = useStore((state) => state.currentMode);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  const updateAuction = useStore((state) => state.updateAuction);

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [recentBids, setRecentBids] = useState([]);
  const [gradeFilter, setGradeFilter] = useState('all');
  const [auctionsWithProducts, setAuctionsWithProducts] = useState([]);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    loadData();
    connectSocket();

    const countdownInterval = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const combined = auctions.map(auction => ({
      ...auction,
      product: products.find(p => p.id === auction.productId)
    }));
    setAuctionsWithProducts(combined);
  }, [auctions, products]);

  const updateCountdowns = () => {
    setCountdowns(prev => {
      const newCountdowns = {};
      auctionsWithProducts.forEach(auction => {
        if (auction.status === 'live' && auction.startTime) {
          const elapsed = Date.now() - new Date(auction.startTime).getTime();
          const duration = auction.product?.auctionTime ? auction.product.auctionTime * 60 * 1000 : 30 * 60 * 1000;
          const remaining = Math.max(0, duration - elapsed);
          newCountdowns[auction.id] = remaining;
          
          if (remaining === 0) {
            auctionAPI.end(auction.id).catch(console.error);
          }
        }
      });
      return newCountdowns;
    });
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  };

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getLive(),
      ]);
      setProducts(productsData);
      setAuctions(auctionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const connectSocket = () => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketService.onBidPlaced((data) => {
      updateAuction(data.auction);
      setRecentBids(prev => [data.bid, ...prev].slice(0, 10));
    });

    socketService.onAuctionStarted((auction) => {
      updateAuction(auction);
    });

    socketService.onAuctionEnded((auction) => {
      updateAuction(auction);
    });
  };

  const handleBid = async (auctionId) => {
    if (!bidAmount || !currentUser) return;

    try {
      await auctionAPI.placeBid(
        auctionId,
        currentUser.id,
        parseFloat(bidAmount)
      );
      setBidAmount('');
      setSelectedAuction(null);
    } catch (error) {
      alert(error.response?.data?.error || '입찰 실패');
    }
  };

  const filteredAuctions = auctionsWithProducts.filter(auction => {
    if (auction.status !== 'live') return false;
    if (gradeFilter === 'all') return true;
    return auction.product?.qualityAssessment?.overallGrade === gradeFilter;
  });

  const grades = ['all', 'A+', 'A', 'B+', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">실시간 경매장</h1>
            <p className="text-gray-600">
              {currentMode === 'buyer' ? '구매자' : '관람'} 모드
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'} mr-2 animate-pulse`} />
              {isConnected ? '실시간 연결' : '연결 끊김'}
            </div>
            <Link
              href={`/dashboard/${currentMode}`}
              className="text-blue-600 hover:text-blue-700"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">품질 등급 필터:</span>
              <div className="flex gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setGradeFilter(grade)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      gradeFilter === grade
                        ? grade === 'all' 
                          ? 'bg-gray-800 text-white'
                          : `${getGradeColor(grade)} text-white`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {grade === 'all' ? '전체' : grade}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>진행중: {filteredAuctions.length}건</span>
              <span>총 입찰: {recentBids.length}건</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAuctions.map((auction) => {
                const timeRemaining = countdowns[auction.id] || 0;
                const isClosingSoon = timeRemaining > 0 && timeRemaining < 5 * 60 * 1000;
                const priceIncrease = auction.startPrice 
                  ? ((auction.currentPrice - auction.startPrice) / auction.startPrice * 100).toFixed(1)
                  : '0';

                return (
                  <div 
                    key={auction.id} 
                    className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                      isClosingSoon ? 'ring-2 ring-red-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={auction.product?.photos?.[0] || '/api/placeholder/400/300'}
                        alt={auction.product?.species}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {auction.product?.qualityAssessment && (
                        <div className={`absolute top-2 right-2 ${getGradeColor(auction.product.qualityAssessment.overallGrade)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                          {auction.product.qualityAssessment.overallGrade}
                        </div>
                      )}
                      {isClosingSoon && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                          마감임박
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{auction.product?.species || '상품명 없음'}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">현재가</span>
                          <span className="font-bold text-lg">₩{auction.currentPrice.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">시작가</span>
                          <span>₩{auction.startPrice.toLocaleString()}</span>
                        </div>

                        {parseFloat(priceIncrease) > 0 && (
                          <div className="flex items-center justify-end text-green-600 text-sm">
                            <ChevronUp className="w-4 h-4" />
                            <span>{priceIncrease}% 상승</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">남은 시간</span>
                          <span className={`font-medium ${isClosingSoon ? 'text-red-600' : ''}`}>
                            <Clock className="inline w-4 h-4 mr-1" />
                            {formatTime(timeRemaining)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">위치</span>
                          <span>{auction.location}</span>
                        </div>

                        {auction.product?.quantity && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">수량</span>
                            <span>{auction.product.quantity}마리</span>
                          </div>
                        )}
                      </div>

                      {currentMode === 'buyer' && (
                        <div className="space-y-2">
                          {selectedAuction === auction.id ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder={`최소 ₩${(auction.currentPrice + 1000).toLocaleString()}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBid(auction.id)}
                                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                >
                                  입찰하기
                                </button>
                                <button
                                  onClick={() => setSelectedAuction(null)}
                                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedAuction(auction.id)}
                              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                            >
                              입찰 참여
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAuctions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">
                  {gradeFilter === 'all' 
                    ? '진행중인 경매가 없습니다'
                    : `${gradeFilter} 등급 경매가 없습니다`}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                실시간 입찰 현황
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentBids.map((bid, index) => (
                  <div 
                    key={index} 
                    className="border-l-4 border-green-500 pl-3 py-2 animate-fade-in"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-600">
                          ₩{bid.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.timestamp).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                      <DollarSign className="text-green-500" size={16} />
                    </div>
                  </div>
                ))}
                {recentBids.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    입찰 대기중...
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-800 mb-3">경매 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">진행중</span>
                  <span className="font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {filteredAuctions.length}건
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">마감임박</span>
                  <span className="font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                    {filteredAuctions.filter(a => {
                      const time = countdowns[a.id];
                      return time > 0 && time < 5 * 60 * 1000;
                    }).length}건
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">오늘 입찰</span>
                  <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                    {recentBids.length}건
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">입찰 안내</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 최소 입찰 단위: ₩1,000</li>
                <li>• AI 품질 등급 확인 후 입찰</li>
                <li>• 마감 5분전 알림 표시</li>
                <li>• 낙찰 시 자동 배송 시작</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}