'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { socketService } from '@/lib/socket';
import { productAPI, auctionAPI } from '@/lib/api';
import { initialProducts, initialAuctions } from '@/lib/initialData';
import { AuctionCard } from '@/components/AuctionCard';
import { Gavel, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuctionPage() {
  const currentUser = useStore((state) => state.currentUser);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  const updateAuction = useStore((state) => state.updateAuction);

  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [recentBids, setRecentBids] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    connectSocket();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getLive(),
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
      setRecentBids(prev => [data.bid, ...prev].slice(0, 5));
    });

    socketService.onAuctionStarted((auction) => {
      updateAuction(auction);
    });

    socketService.onAuctionEnded((auction) => {
      updateAuction(auction);
    });
  };

  const handleBid = async (auctionId: string) => {
    if (!bidAmount || !currentUser) return;

    try {
      await auctionAPI.placeBid(
        auctionId,
        currentUser.id,
        parseFloat(bidAmount)
      );
      setBidAmount('');
    } catch (error: any) {
      alert(error.response?.data?.error || '입찰 실패');
    }
  };

  const handleStartAuction = async (auctionId: string) => {
    try {
      await auctionAPI.start(auctionId);
    } catch (error) {
      console.error('Failed to start auction:', error);
    }
  };

  const handleEndAuction = async (auctionId: string) => {
    try {
      await auctionAPI.end(auctionId);
    } catch (error) {
      console.error('Failed to end auction:', error);
    }
  };

  const liveAuctions = auctions.filter(a => a.status === 'live');
  const pendingAuctions = auctions.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">실시간 경매</h1>
            <p className="text-gray-600">
              {currentUser?.name} ({currentUser?.userType === 'fisherman' ? '어민' : currentUser?.userType === 'admin' ? '관리자' : '구매자'})
            </p>
          </div>
          <Link
            href={`/dashboard/${currentUser?.userType}`}
            className="text-primary hover:text-blue-700"
          >
            대시보드로 돌아가기
          </Link>
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'} mr-2 animate-pulse`} />
                {isConnected ? '연결됨' : '연결 끊김'}
              </div>
              <div className="flex items-center text-gray-600">
                <Users size={20} className="mr-1" />
                <span>실시간 경매 {liveAuctions.length}건</span>
              </div>
            </div>
            {currentUser?.userType === 'admin' && pendingAuctions.length > 0 && (
              <button
                onClick={() => handleStartAuction(pendingAuctions[0].id)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                경매 시작
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">진행중인 경매</h2>
            <div className="space-y-4">
              {liveAuctions.map((auction) => {
                const product = products.find(p => p.id === auction.productId);
                if (!product) return null;

                return (
                  <div key={auction.id} className="relative">
                    <AuctionCard
                      auction={auction}
                      product={product}
                      onBid={() => setSelectedAuction(auction.id)}
                    />
                    
                    {selectedAuction === auction.id && currentUser?.userType === 'buyer' && (
                      <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`최소 ₩${(auction.currentPrice + 1000).toLocaleString()}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleBid(auction.id)}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                          >
                            입찰
                          </button>
                          <button
                            onClick={() => setSelectedAuction(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}

                    {currentUser?.userType === 'admin' && (
                      <button
                        onClick={() => handleEndAuction(auction.id)}
                        className="mt-2 w-full bg-danger text-white py-2 rounded-lg hover:bg-red-600"
                      >
                        경매 종료
                      </button>
                    )}
                  </div>
                );
              })}

              {liveAuctions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">진행중인 경매가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">최근 입찰</h2>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentBids.map((bid, index) => (
                  <div key={index} className="border-b pb-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          ₩{bid.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(bid.timestamp).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                  </div>
                ))}
                {recentBids.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    아직 입찰이 없습니다
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-3">경매 통계</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 경매</span>
                  <span className="font-medium">{auctions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">진행중</span>
                  <span className="font-medium text-green-600">{liveAuctions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">대기중</span>
                  <span className="font-medium text-yellow-600">{pendingAuctions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}