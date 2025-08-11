'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { 
  Shield, Users, Package, AlertTriangle, CheckCircle, 
  XCircle, Clock, TrendingUp, Eye, Settings, Award,
  BarChart3, Activity, DollarSign
} from 'lucide-react';
import { productAPI, auctionAPI, api } from '@/lib/api';
import { Product, Auction, User } from '@/types';
import { getGradeColor, getGradeTextColor } from '@/lib/aiQualityAssessment';

export default function AdminDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentMode = useStore((state) => state.setCurrentMode);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  const updateProduct = useStore((state) => state.updateProduct);
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [verificationComment, setVerificationComment] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    activeUsers: 0,
    pendingVerifications: 0
  });

  useEffect(() => {
    setCurrentMode('admin');
    loadData();
  }, []);

  useEffect(() => {
    calculateSystemStats();
  }, [products, auctions]);

  const calculateSystemStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedAuctions = auctions.filter(a => a.status === 'ended' && a.highestBidder);
    const totalRevenue = completedAuctions.reduce((sum, a) => sum + a.currentPrice, 0);
    
    const todayAuctions = completedAuctions.filter(a => 
      a.endTime && new Date(a.endTime) >= today
    );
    const todayRevenue = todayAuctions.reduce((sum, a) => sum + a.currentPrice, 0);
    
    const pendingVerifications = products.filter(p => 
      p.qualityStatus === 'pending_verification'
    ).length;
    
    setSystemStats({
      totalRevenue,
      todayRevenue,
      activeUsers: users.length,
      pendingVerifications
    });
  };

  const loadData = async () => {
    try {
      const [productsData, auctionsData, usersData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getAll(),
        api.get('/users')
      ]);
      setProducts(productsData);
      setAuctions(auctionsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleQualityVerification = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await api.post(`/products/${productId}/verify-quality`, {
        status,
        verifiedBy: currentUser?.id,
        comments: verificationComment
      });
      
      updateProduct(response);
      setSelectedProduct(null);
      setVerificationComment('');
      alert(`품질 평가가 ${status === 'approved' ? '승인' : '반려'}되었습니다.`);
    } catch (error) {
      console.error('Verification failed:', error);
      alert('품질 검증 처리 중 오류가 발생했습니다.');
    }
  };

  const pendingProducts = products.filter(p => p.qualityStatus === 'pending_verification');
  const liveAuctions = auctions.filter(a => a.status === 'live');
  const recentProducts = products.slice(0, 10);
  
  const gradeDistribution = products.reduce((acc, product) => {
    if (product.qualityAssessment) {
      const grade = product.qualityAssessment.overallGrade;
      acc[grade] = (acc[grade] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">운영자 대시보드</h1>
            <p className="text-gray-600">시스템 관리 및 품질 검증</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">관리자 모드</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="총 거래액"
            value={`₩${systemStats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="primary"
          />
          <StatCard
            title="오늘 거래액"
            value={`₩${systemStats.todayRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="검증 대기"
            value={systemStats.pendingVerifications}
            icon={AlertTriangle}
            color="warning"
          />
          <StatCard
            title="활성 사용자"
            value={systemStats.activeUsers}
            icon={Users}
            color="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              품질 검증 대기
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-800">{product.species}</h3>
                        {product.qualityAssessment && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(product.qualityAssessment.overallGrade)} text-white`}>
                            {product.qualityAssessment.overallGrade}
                          </span>
                        )}
                      </div>
                      
                      {product.qualityAssessment && (
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>신선도: {product.qualityAssessment.freshness.toFixed(1)}%</div>
                          <div>색상/광택: {product.qualityAssessment.colorShine.toFixed(1)}%</div>
                          <div>크기/형태: {product.qualityAssessment.sizeShape.toFixed(1)}%</div>
                          <div>손상도: {product.qualityAssessment.damage.toFixed(1)}%</div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 items-center text-xs text-gray-500">
                        <span>등록: {new Date(product.createdAt).toLocaleString('ko-KR')}</span>
                        <span>수량: {product.quantity}마리</span>
                        <span>시작가: ₩{product.startPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        검토
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingProducts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                  <p className="text-gray-500">검증 대기중인 상품이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">품질 등급 분포</h3>
              <div className="space-y-2">
                {['A+', 'A', 'B+', 'B', 'C', 'D'].map(grade => {
                  const count = gradeDistribution[grade] || 0;
                  const total = Object.values(gradeDistribution).reduce((sum, n) => sum + n, 0);
                  const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(grade as any)} text-white`}>
                          {grade}
                        </span>
                        <span className="text-sm">{count}건</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getGradeColor(grade as any)}`}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">시스템 현황</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">진행중 경매</span>
                  <span className="font-medium text-green-600">{liveAuctions.length}건</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">등록 상품</span>
                  <span className="font-medium">{products.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">어민</span>
                  <span className="font-medium">{users.filter(u => u.userType === 'fisherman').length}명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">구매자</span>
                  <span className="font-medium">{users.filter(u => u.userType === 'buyer').length}명</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">빠른 작업</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  경매 관리
                </button>
                <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                  사용자 관리
                </button>
                <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
                  시스템 설정
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">실시간 경매 현황</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {liveAuctions.map((auction) => {
                const product = products.find(p => p.id === auction.productId);
                return (
                  <div key={auction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{product?.species || '상품명 없음'}</p>
                      <p className="text-sm text-gray-600">
                        현재가: ₩{auction.currentPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">진행중</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">최근 등록 상품</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{product.species}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  {product.qualityAssessment && (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(product.qualityAssessment.overallGrade)} text-white`}>
                      {product.qualityAssessment.overallGrade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">품질 검증</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{selectedProduct.species}</h3>
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src={selectedProduct.photos?.[0] || '/api/placeholder/400/300'} 
                  alt="Product"
                  className="w-full h-48 object-cover rounded"
                />
                <div>
                  {selectedProduct.qualityAssessment && (
                    <>
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">AI 평가 등급:</span>
                        <span className={`ml-2 px-3 py-1 rounded text-lg font-bold ${getGradeColor(selectedProduct.qualityAssessment.overallGrade)} text-white`}>
                          {selectedProduct.qualityAssessment.overallGrade}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>신선도: {selectedProduct.qualityAssessment.freshness.toFixed(1)}%</div>
                        <div>색상/광택: {selectedProduct.qualityAssessment.colorShine.toFixed(1)}%</div>
                        <div>크기/형태: {selectedProduct.qualityAssessment.sizeShape.toFixed(1)}%</div>
                        <div>손상도: {selectedProduct.qualityAssessment.damage.toFixed(1)}%</div>
                        <div className="pt-2 border-t">
                          신뢰도: {selectedProduct.qualityAssessment.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검증 의견
              </label>
              <textarea
                value={verificationComment}
                onChange={(e) => setVerificationComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="검증 의견을 입력하세요..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleQualityVerification(selectedProduct.id, 'approved')}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="inline w-5 h-5 mr-2" />
                승인
              </button>
              <button
                onClick={() => handleQualityVerification(selectedProduct.id, 'rejected')}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                <XCircle className="inline w-5 h-5 mr-2" />
                반려
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setVerificationComment('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}