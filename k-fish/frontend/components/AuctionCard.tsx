import React from 'react';
import { Auction, Product } from '@/types';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface AuctionCardProps {
  auction: Auction;
  product: Product;
  onBid?: () => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, product, onBid }) => {
  const currentUser = useStore((state) => state.currentUser);
  const isLive = auction.status === 'live';
  const canBid = currentUser?.userType === 'buyer'; // 구매자만 입찰 가능
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isLive ? 'border-2 border-primary' : ''}`}>
      {isLive && (
        <div className="bg-danger text-white px-3 py-1 text-sm font-semibold animate-pulse">
          실시간 경매 진행중
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.species}</h3>
            <p className="text-sm text-gray-600">
              {product.weight}kg · {product.quantity}마리
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {auction.status === 'live' ? '진행중' : auction.status === 'ended' ? '종료' : '대기중'}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            {auction.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-1" />
            {new Date(auction.startTime).toLocaleString('ko-KR')}
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">현재가</span>
            <span className="text-xl font-bold text-primary">
              ₩{auction.currentPrice.toLocaleString()}
            </span>
          </div>
          
          {isLive && onBid && canBid && (
            <button
              onClick={onBid}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <TrendingUp size={20} className="mr-2" />
              입찰하기
            </button>
          )}
          
          {isLive && currentUser?.userType === 'admin' && (
            <div className="text-center text-sm text-gray-600 py-2">
              관리자는 입찰할 수 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
};