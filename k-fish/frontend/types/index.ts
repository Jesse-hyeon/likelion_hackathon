export type UserType = 'fisherman' | 'buyer' | 'logistics' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  companyName: string;
}

export interface QualityAssessment {
  freshness: number;
  colorShine: number;
  sizeShape: number;
  damage: number;
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  confidence: number;
  details: {
    freshnessDetails: string;
    colorDetails: string;
    sizeDetails: string;
    damageDetails: string;
  };
}

export interface Product {
  id: string;
  rfidTag: string;
  boxNumber: string;
  species: string;
  weight: number;
  quantity: number;
  catchDateTime: string;
  catchLocation: {
    lat: number;
    lng: number;
  };
  fishermanId: string;
  photos: string[];
  createdAt: string;
  status: 'registered' | 'in_auction' | 'sold' | 'delivered';
  qualityAssessment?: QualityAssessment;
  qualityStatus?: 'not_assessed' | 'pending_verification' | 'approved' | 'rejected';
  qualityVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    comments: string;
    status: 'approved' | 'rejected';
  };
  startPrice?: number;
  auctionTime?: number;
}

export interface Auction {
  id: string;
  productId: string;
  startPrice: number;
  currentPrice: number;
  status: 'pending' | 'live' | 'ended';
  location: string;
  startTime: string;
  endTime: string | null;
  highestBidder: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: string;
}

export interface Delivery {
  id: string;
  productId: string;
  auctionId: string;
  status: 'preparing' | 'in_transit' | 'delivering' | 'delivered';
  currentLocation: {
    lat: number;
    lng: number;
  };
  temperature: number;
  estimatedArrival: string;
  timeline: {
    status: string;
    timestamp: string;
  }[];
}