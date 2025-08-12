'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { 
  Fish, Package, TrendingUp, DollarSign, CheckCircle, Clock, 
  MapPin, AlertCircle, Eye, Plus, FileText, Home, User, LogOut,
  Camera, Upload, Weight, Hash, Award, Gavel, Users, Timer,
  XCircle, Star, Download, Filter, Search, Calendar, BarChart3,
  LineChart, PieChart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productAPI, auctionAPI } from '@/lib/api';
import *sx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Cell } from 'recharts';

export default function FishermanDashboard() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const products = useStore((state) => state.products);
  const auctions = useStore((state) => state.auctions);
  const setProducts = useStore((state) => state.setProducts);
  const setAuctions = useStore((state) => state.setAuctions);
  
  const [activeTab, setActiveTab] = useState('main');
  const [settlementData, setSettlementData] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [filteredSettlements, setFilteredSettlements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartViewType, setChartViewType] = useState('monthly'); // 'daily', 'monthly', 'species'
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [speciesData, setSpeciesData] = useState<any[]>([]);

  // 수산물 등록 폼 데이터
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, auctionsData] = await Promise.all([
        productAPI.getAll(),
        auctionAPI.getAll(),
      ]);
      setProducts(productsData);
      setAuctions(auctionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const myProducts = products.filter(p => p.fishermanId === currentUser?.id);
  const myAuctions = auctions.filter(a => 
    myProducts.some(p => p.id === a.productId)
  );
  const liveAuctions = myAuctions.filter(a => a.status === 'live');
  const endedAuctions = myAuctions.filter(a => a.status === 'ended' && a.highestBidder);
  const totalRevenue = endedAuctions.reduce((sum, a) => sum + a.currentPrice, 0);
  
  // 정산 현황 생성 (실제 데이터)
  useEffect(() => {
    const mockSettlements = [
      {
        id,
        productName,
        species,
        quantity,
        weight,
        unit,
        catchDate) - 4 * 24 * 60 * 60 * 1000).toISOString(),
        catchLocation,
        registerDate) - 4 * 24 * 60 * 60 * 1000).toISOString(),
        auctionDate) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        originalPrice,
        finalPrice,
        buyerInfo,
        buyerContact,
        auctionEndDate) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        settlementStatus,
        pickupStatus,
        pickupDate) - 2 * 24 * 60 * 60 * 1000).toISOString(),
        settlementDate) - 1 * 24 * 60 * 60 * 1000).toISOString(),
        commissionRate,
        commission, // 185000 * 0.05
        finalSettlement, // 185000 - 9250
        bidCount,
        qualityGrade,
        notes,
        paymentMethod,
        bankAccount,
        transactionId
      },
      {
        id,
        productName,
        species,
        quantity,
        weight,
        unit,
        catchDate) - 6 * 24 * 60 * 60 * 1000).toISOString(),
        catchLocation,
        registerDate) - 6 * 24 * 60 * 60 * 1000).toISOString(),
        auctionDate) - 5 * 24 * 60 * 60 * 1000).toISOString(),
        originalPrice,
        finalPrice,
        buyerInfo,
        buyerContact,
        auctionEndDate) - 5 * 24 * 60 * 60 * 1000).toISOString(),
        settlementStatus,
        pickupStatus,
        pickupDate) - 4 * 24 * 60 * 60 * 1000).toISOString(),
        settlementDate) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        commissionRate,
        commission,
        finalSettlement,
        bidCount,
        qualityGrade,
        notes,
        paymentMethod,
        bankAccount,
        transactionId
      },
      {
        id,
        productName,
        species,
        quantity,
        weight,
        unit,
        catchDate) - 2 * 24 * 60 * 60 * 1000).toISOString(),
        catchLocation,
        registerDate) - 2 * 24 * 60 * 60 * 1000).toISOString(),
        auctionDate) - 1 * 24 * 60 * 60 * 1000).toISOString(),
        originalPrice,
        finalPrice,
        buyerInfo,
        buyerContact,
        auctionEndDate) - 1 * 24 * 60 * 60 * 1000).toISOString(),
        settlementStatus,
        pickupStatus,
        pickupDate,
        settlementDate,
        commissionRate,
        commission,
        finalSettlement,
        bidCount,
        qualityGrade,
        notes,
        estimatedSettlement) + 2 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod,
        bankAccount,
        transactionId
      },
      {
        id,
        productName,
        species,
        quantity,
        weight,
        unit,
        catchDate) - 1 * 24 * 60 * 60 * 1000).toISOString(),
        catchLocation,
        registerDate) - 12 * 60 * 60 * 1000).toISOString(),
        auctionDate) - 6 * 60 * 60 * 1000).toISOString(),
        originalPrice,
        finalPrice,
        buyerInfo,
        buyerContact,
        auctionEndDate) - 6 * 60 * 60 * 1000).toISOString(),
        settlementStatus,
        pickupStatus,
        pickupDate) - 4 * 60 * 60 * 1000).toISOString(),
        settlementDate,
        commissionRate,
        commission,
        finalSettlement,
        bidCount,
        qualityGrade,
        notes,
        processingNote,
        paymentMethod,
        bankAccount,
        transactionId
      },
      {
        id,
        productName,
        species,
        quantity,
        weight,
        unit,
        catchDate) - 8 * 24 * 60 * 60 * 1000).toISOString(),
        catchLocation,
        registerDate) - 8 * 24 * 60 * 60 * 1000).toISOString(),
        auctionDate) - 7 * 24 * 60 * 60 * 1000).toISOString(),
        originalPrice,
        finalPrice,
        buyerInfo,
        buyerContact,
        auctionEndDate) - 7 * 24 * 60 * 60 * 1000).toISOString(),
        settlementStatus,
        pickupStatus,
        pickupDate) - 6 * 24 * 60 * 60 * 1000).toISOString(),
        settlementDate) - 5 * 24 * 60 * 60 * 1000).toISOString(),
        commissionRate,
        commission,
        finalSettlement,
        bidCount,
        qualityGrade,
        notes,
        paymentMethod,
        bankAccount,
        transactionId
      }
    ];
    setSettlementData(mockSettlements);
    setFilteredSettlements(mockSettlements);
    
    // 차트 데이터 생성
    generateChartData(mockSettlements);
  }, []);

  // 차트 데이터 생성 함수
  const generateChartData = (settlements) => {
    // 월별 데이터 생성
    const monthlyStats = settlements.reduce((acc, settlement) => {
      const date = new Date(settlement.auctionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month,
          monthName, { year, month}),
          revenue,
          sales,
          profit,
          avgPrice,
          items
        };
      }
      
      acc[monthKey].revenue += settlement.finalSettlement;
      acc[monthKey].sales += 1;
      acc[monthKey].profit += (settlement.finalSettlement - settlement.originalPrice);
      acc[monthKey].items.push(settlement);
      
      return acc;
    }, {});
    
    // 평균 가격 계산
    Object.values(monthlyStats).forEach((month) => {
      month.avgPrice = Math.round(month.revenue / month.sales);
    });
    
    setMonthlyData(Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month)));
    
    // 일별 데이터 생성 (최근 30일)
    const dailyStats = settlements.reduce((acc, settlement) => {
      const date = new Date(settlement.auctionDate);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!acc[dayKey]) {
        acc[dayKey] = {
          date,
          dateFormatted, { month, day}),
          revenue,
          sales,
          profit,
          items
        };
      }
      
      acc[dayKey].revenue += settlement.finalSettlement;
      acc[dayKey].sales += 1;
      acc[dayKey].profit += (settlement.finalSettlement - settlement.originalPrice);
      acc[dayKey].items.push(settlement);
      
      return acc;
    }, {});
    
    setDailyData(Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)));
    
    // 수산물 종류별 통계
    const speciesStats = settlements.reduce((acc, settlement) => {
      const species = settlement.species;
      
      if (!acc[species]) {
        acc[species] = {
          name,
          value,
          count,
          avgProfit,
          totalProfit
        };
      }
      
      acc[species].value += settlement.finalSettlement;
      acc[species].count += 1;
      acc[species].totalProfit += (settlement.finalSettlement - settlement.originalPrice);
      acc[species].avgProfit = Math.round(acc[species].totalProfit / acc[species].count);
      
      return acc;
    }, {});
    
    setSpeciesData(Object.values(speciesStats));
  };

  // 필터링 로직
  useEffect(() => {
    let filtered = settlementData;
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyerInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.catchLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.settlementStatus === statusFilter);
    }
    
    // 날짜 필터링
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const settlementDate = new Date(item.auctionDate);
        const diffDays = Math.floor((now.getTime() - settlementDate.getTime()) / (1000 * 3600 * 24));
        
        switch (dateFilter) {
          case 'week'= 7;
          case 'month'= 30;
          case 'quarter'= 90;
          default
        }
      });
    }
    
    setFilteredSettlements(filtered);
  }, [settlementData, searchTerm, statusFilter, dateFilter]);

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    const excelData = filteredSettlements.map((settlement, index) => ({
      '번호',
      '수산물명',
      '수량',
      '단위',
      '중량(kg)',
      '어획일').toLocaleDateString('ko-KR'),
      '어획지역',
      '등록일').toLocaleDateString('ko-KR'),
      '경매일').toLocaleDateString('ko-KR'),
      '희망가'),
      '낙찰가'),
      '구매업체',
      '구매업체 연락처',
      '품질등급',
      '입찰횟수',
      '위판장수수료')}원 (${(settlement.commissionRate * 100)}%)`,
      '최종정산금'),
      '수령일').toLocaleDateString('ko-KR') ,
      '정산일').toLocaleDateString('ko-KR') ,
      '정산상태'=== 'completed' ? '정산완료' 
                settlement.settlementStatus === 'processing' ? '처리중' ,
      '결제방법',
      '입금계좌',
      '거래번호',
      '메모',
      '수익률') / settlement.originalPrice) * 100).toFixed(1)}%`,
      'kg당수익') / settlement.weight).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '판매정산내역');
    
    // 컬럼 너비 자동 조정
    const colWidths = [];
    const headers = Object.keys(excelData[0] || {});
    headers.forEach((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...excelData.map(row => String(row[header] || '').length)
      );
      colWidths[i] = { wch, 50) };
    });
    worksheet['!cols'] = colWidths;

    const fileName = `FishBid_판매정산내역_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  // 내 등록 상품 현황 생성
  useEffect(() => {
    const registrations = [
      {
        id,
        species,
        quantity,
        weight,
        expectedPrice,
        status,
        submittedAt) - 2 * 60 * 60 * 1000).toISOString(),
        notes
      },
      {
        id, 
        species,
        quantity,
        weight,
        expectedPrice,
        status,
        submittedAt) - 24 * 60 * 60 * 1000).toISOString(),
        approvedAt) - 12 * 60 * 60 * 1000).toISOString(),
        notes,
        // AI 품질 평가 정보
        qualityAssessment
          overallGrade,
          freshness,
          colorShine,
          sizeShape,
          damage,
          confidence
        },
        // 경매 진행 상황
        auctionStatus,
        auctionStartTime) - 8 * 60 * 60 * 1000).toISOString(),
        auctionEndTime) - 6 * 60 * 60 * 1000).toISOString(),
        // 최종 거래 정보
        finalPrice,
        buyerInfo,
        bidCount
      },
      {
        id,
        species,
        quantity,
        weight,
        expectedPrice,
        status,
        submittedAt) - 3 * 24 * 60 * 60 * 1000).toISOString(),
        rejectedAt) - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason)',
        notes,
        // AI 품질 평가 정보 (반려된 경우)
        qualityAssessment
          overallGrade,
          freshness,
          colorShine,
          sizeShape,
          damage,
          confidence
        }
      },
      {
        id,
        species,
        quantity,
        weight,
        expectedPrice,
        status,
        submittedAt) - 6 * 60 * 60 * 1000).toISOString(),
        approvedAt) - 4 * 60 * 60 * 1000).toISOString(),
        notes,
        // AI 품질 평가 정보
        qualityAssessment
          overallGrade,
          freshness,
          colorShine,
          sizeShape,
          damage,
          confidence
        },
        // 현재 진행중인 경매
        auctionStatus,
        auctionStartTime) - 1 * 60 * 60 * 1000).toISOString(),
        auctionEndTime) + 29 * 60 * 1000).toISOString(),
        currentPrice,
        bidCount,
        leadingBidder
      }
    ];
    setMyRegistrations(registrations);
  }, [currentUser]);
  
  const pendingSettlements = settlementData.filter(s => s.settlementStatus === 'pending');
  const completedSettlements = settlementData.filter(s => s.settlementStatus === 'completed');
  const pendingRegistrations = myRegistrations.filter(r => r.status === 'pending_review');
  const approvedRegistrations = myRegistrations.filter(r => r.status === 'approved');

  // 수산물 등록 관련 함수들
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
      await productAPI.create({
        species,
        quantity),
        weight),
        startPrice),
        catchDateTime).toISOString(),
        catchLocation, lng},
        fishermanId,
        photos=> img.url),
        status,
        notes
      });
      
      alert('✅ 수산물 등록이 완료되었습니다!\n위판장에서 검토 후 경매가 진행됩니다.');
      
      // 폼 초기화
      setFormData({
        species,
        quantity,
        weight,
        catchLocation,
        catchDate).toISOString().split('T')[0],
        expectedPrice,
        notes
      });
      setImages([]);
      setActiveTab('status');
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/');
  };

  // 품질 등급별 색상 함수
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+'
      case 'A'
      case 'B+'
      case 'B'
      case 'C+'
      case 'C'
      case 'D'
      default
    }
  };

  const getAuctionStatusInfo = (registration) => {
    if (!registration.auctionStatus) return null;
    
    switch (registration.auctionStatus) {
      case 'live':
        const timeLeft = new Date(registration.auctionEndTime).getTime() - Date.now();
        const minutesLeft = Math.floor(timeLeft / (1000 * 60));
        return {
          status,
          label,
          color,
          icon,
          detail}분 남음 | 현재가)} | 입찰}회`
        };
      case 'ended':
        return {
          status,
          label,
          color,
          icon,
          detail)} | 구매자}`
        };
      case 'scheduled':
        return {
          status,
          label,
          color,
          icon,
          detail).toLocaleString('ko-KR')}`
        };
      default:
        return null;
    }
  };

  const navigationItems = [
    { id, label, icon},
    { id, label, icon},
    { id, label, icon},
    { id, label, icon}
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Fish className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">FishBid</h1>
                <p className="text-xs text-gray-500">어민 대시보드</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.companyName}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">로그아웃</span>
              </button>
            </div>
          </div>
          
          {/* 탭 메뉴 */}
          <div className="flex space-x-8 border-t pt-4 pb-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {/* 메인 대시보드 */}
        {activeTab === 'main' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">대시보드 개요</h2>
              <p className="text-gray-600">나의 수산물 등록 및 판매 현황을 확인하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="등록 신청"
                value={myRegistrations.length}
                icon={Fish}
                color="primary"
              />
              <StatCard
                title="검토 대기"
                value={pendingRegistrations.length}
                icon={Clock}
                color="warning"
              />
              <StatCard
                title="정산 대기"
                value={pendingSettlements.length}
                icon={Package}
                color="success"
              />
              <StatCard
                title="총 수익"
                value={`₩${totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="danger"
              />
            </div>

            {/* 빠른 작업 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  빠른 등록
                </h3>
                <p className="text-gray-600 text-sm mb-4">새로운 수산물을 빠르게 등록하세요</p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수산물 등록하기
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  등록 현황
                </h3>
                <p className="text-gray-600 text-sm mb-4">등록한 상품의 진행 상황을 확인하세요</p>
                <button
                  onClick={() => setActiveTab('status')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  현황 보기
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  판매 정산
                </h3>
                <p className="text-gray-600 text-sm mb-4">판매 완료된 상품의 정산을 확인하세요</p>
                <button
                  onClick={() => setActiveTab('settlement')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  정산 보기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수산물 등록 */}
        {activeTab === 'register' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">수산물 등록</h2>
              <p className="text-gray-600">새로운 수산물을 등록하고 경매에 출품하세요</p>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Fish className="w-5 h-5" />
                  수산물 정보 입력
                </h3>
                <p className="text-gray-600 text-sm mt-1">위판장 검토 후 경매에 등록됩니다</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* 사진 업로드 */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    상품 사진 ({images.length}/6)
                  </h4>
                  
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
                    onClick={() => setActiveTab('main')}
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
                        <Clock className="w-5 h-5 animate-spin" />
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
          </div>
        )}

        {/* 등록 현황 */}
        {activeTab === 'status' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">수산물 등록 현황</h2>
              <p className="text-gray-600">등록 신청한 상품의 검토 진행 상황을 확인하세요</p>
            </div>

            {/* 상태 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-800">검토중</h4>
                    <p className="text-sm text-yellow-600">위판장 검토 대기</p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {myRegistrations.filter(r => r.status === 'pending_review').length}
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">승인완료</h4>
                    <p className="text-sm text-green-600">경매 진행중/완료</p>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {myRegistrations.filter(r => r.status === 'approved').length}
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-red-800">승인거부</h4>
                    <p className="text-sm text-red-600">품질 기준 미달</p>
                  </div>
                  <div className="text-2xl font-bold text-red-800">
                    {myRegistrations.filter(r => r.status === 'rejected').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  등록 현황 목록
                </h3>
              </div>
              
              <div className="p-6">
                {myRegistrations.length > 0 ? (
                  <div className="space-y-6">
                    {myRegistrations.map((registration) => {
                      const auctionInfo = getAuctionStatusInfo(registration);
                      return (
                        <div key={registration.id} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          {/* 상품 기본 정보 카드 */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-1">{registration.species}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Fish className="w-4 h-4" />
                                    {registration.quantity}마리
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Weight className="w-4 h-4" />
                                    {registration.weight}kg
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  등록일).toLocaleDateString('ko-KR', {
                                    year, month, day
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900 mb-2">
                                  희망가)}
                                </div>
                                {registration.status === 'pending_review' ? (
                                  <span className="inline-flex items-center gap-1 bg-yellow-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                    <Clock className="w-4 h-4" />
                                    검토중
                                  </span>
                                ) === 'approved' ? (
                                  <span className="inline-flex items-center gap-1 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    승인완료
                                  </span>
                                ) === 'rejected' ? (
                                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                    <XCircle className="w-4 h-4" />
                                    승인거부
                                  </span>
                                ) }
                              </div>
                            </div>
                          </div>

                          {/* 세부 정보를 담는 그리드 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            
                            {/* 왼쪽 컬럼}
                            <div className="space-y-4">
                              
                              {/* 어민 메모 */}
                              {registration.notes && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    어민 메모
                                  </h5>
                                  <p className="text-sm text-gray-700 italic">"{registration.notes}"</p>
                                </div>
                              )}

                              {/* AI 품질 평가 결과 */}
                              {registration.qualityAssessment && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-bold text-blue-900 flex items-center gap-2">
                                      <Award className="w-5 h-5" />
                                      AI 품질 평가
                                    </h5>
                                    <div className="flex items-center gap-2">
                                      <div className={`px-4 py-2 rounded-full text-white font-bold text-lg ${getGradeColor(registration.qualityAssessment.overallGrade)}`}>
                                        {registration.qualityAssessment.overallGrade}
                                      </div>
                                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {registration.qualityAssessment.confidence.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { label, value},
                                      { label, value},
                                      { label, value},
                                      { label, value}
                                    ].map((item, index) => (
                                      <div key={index} className="bg-white rounded p-3">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-sm text-gray-700">{item.label}</span>
                                          <span className="font-bold text-blue-900">{item.value.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                                            style={{ width}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* 상태별 안내 메시지 */}
                              {registration.status === 'pending_review' && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                  <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
                                    <div>
                                      <p className="font-semibold text-yellow-800">검토 진행중</p>
                                      <p className="text-sm text-yellow-700 mt-1">
                                        위판장에서 AI 품질 평가를 진행하고 있습니다. 곧 결과를 확인할 수 있습니다.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {registration.status === 'rejected' && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                  <div className="flex items-start">
                                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                                    <div>
                                      <p className="font-semibold text-red-800">승인 거부</p>
                                      <p className="text-sm text-red-700 mt-1">
                                        <strong>사유:</strong> {registration.rejectionReason}
                                      </p>
                                      <p className="text-xs text-red-600 mt-2">
                                        거부일).toLocaleDateString('ko-KR')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 오른쪽 컬럼}
                            <div className="space-y-4">
                              
                              {/* 경매 진행 상황 */}
                              {registration.status === 'approved' && (
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                      <Gavel className="w-5 h-5" />
                                      경매 현황
                                    </h5>
                                    {auctionInfo && (
                                      <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-2 rounded-full ${auctionInfo.color}`}>
                                        <auctionInfo.icon className="w-4 h-4" />
                                        {auctionInfo.label}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {auctionInfo ? (
                                    <div className="space-y-3">
                                      <div className="bg-gray-50 rounded p-3">
                                        <p className="text-sm text-gray-700">{auctionInfo.detail}</p>
                                        
                                        {auctionInfo.status === 'live' && registration.leadingBidder && (
                                          <div className="mt-2 flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span className="text-gray-600">최고 입찰자:</span>
                                            <span className="font-semibold text-blue-600">{registration.leadingBidder}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* 실시간 경매 정보 (진행중일 때) */}
                                      {auctionInfo.status === 'live' && (
                                        <div className="bg-green-50 border border-green-200 rounded p-3">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm text-green-700">현재 최고가</p>
                                              <p className="text-xl font-bold text-green-900">
                                                ₩{registration.currentPrice?.toLocaleString()}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-sm text-green-700">입찰 횟수</p>
                                              <p className="text-lg font-bold text-green-900">{registration.bidCount}회</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* 경매 상세 정보 버튼 */}
                                      <button 
                                        onClick={() => window.open('/auction', '_blank')}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Eye className="w-4 h-4" />
                                        경매 현장 보기
                                      </button>
                                    </div>
                                  ) 
                                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                      <p className="text-sm text-purple-800">
                                        <strong>경매 준비중</strong><br/>
                                        승인 완료되어 곧 경매가 시작됩니다.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* 최종 거래 완료 정보 */}
                              {registration.finalPrice && auctionInfo?.status === 'ended' && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
                                  <h5 className="font-bold text-green-900 flex items-center gap-2 mb-4">
                                    <Star className="w-5 h-5" />
                                    🎉 거래 성공!
                                  </h5>
                                  
                                  <div className="space-y-4">
                                    {/* 낙찰 정보 */}
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-green-700 mb-1">최종 낙찰가</p>
                                          <p className="text-2xl font-bold text-green-900">
                                            ₩{registration.finalPrice.toLocaleString()}
                                          </p>
                                          <p className="text-xs text-green-600 mt-1">
                                            희망가 대비 {registration.finalPrice > registration.expectedPrice ? '+' }₩{(registration.finalPrice - registration.expectedPrice).toLocaleString()}
                                            <span className="ml-1">
                                              ({(((registration.finalPrice - registration.expectedPrice) / registration.expectedPrice) * 100).toFixed(1)}%)
                                            </span>
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-green-700 mb-1">구매업체</p>
                                          <p className="font-bold text-green-900">{registration.buyerInfo}</p>
                                          <p className="text-xs text-green-600 mt-1">
                                            총 {registration.bidCount}회 입찰 참여
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 수익 정보 */}
                                    <div className="bg-green-100 rounded p-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-green-800">예상 수익 (수수료 5% 차감)</span>
                                        <span className="font-bold text-green-900">
                                          ₩{Math.floor(registration.finalPrice * 0.95).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* 정산 안내 */}
                                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                      <p className="text-sm text-blue-800">
                                        <strong>정산 안내:</strong> 구매자가 상품을 수령하면 자동으로 정산이 진행됩니다.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 승인완료 대기 상태 */}
                              {registration.status === 'approved' && !auctionInfo && (
                                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                  <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
                                    <div>
                                      <p className="font-semibold text-green-800">승인 완료</p>
                                      <p className="text-sm text-green-700 mt-1">
                                        {registration.approvedAt && new Date(registration.approvedAt).toLocaleDateString('ko-KR')}에 승인되었습니다. 
                                        곧 경매가 시작됩니다.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) 
                  <div className="text-center py-12">
                    <Fish className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">등록한 상품이 없습니다</h4>
                    <p className="text-gray-600 mb-4">새로운 수산물을 등록하고 경매에 참여해보세요</p>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      새 수산물 등록하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 판매 정산 */}
        {activeTab === 'settlement' && (
          <div>
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">판매 정산 현황</h2>
                  <p className="text-gray-600">낙찰된 상품의 정산 처리 현황과 수익을 확인하세요</p>
                </div>
                <button
                  onClick={handleExcelDownload}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  엑셀 다운로드
                </button>
              </div>
            </div>

            {/* 정산 요약 대시보드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800">총 판매</h4>
                    <p className="text-sm text-blue-600">거래 완료</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {filteredSettlements.length}건
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">정산완료</h4>
                    <p className="text-sm text-green-600">입금 완료</p>
                  </div>
                  <div className="text-2xl font-bold text-green-800">
                    {filteredSettlements.filter(s => s.settlementStatus === 'completed').length}건
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-800">대기중</h4>
                    <p className="text-sm text-yellow-600">처리 대기</p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {filteredSettlements.filter(s => s.settlementStatus !== 'completed').length}건
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-800">총 수익</h4>
                    <p className="text-sm text-purple-600">수수료 차감</p>
                  </div>
                  <div className="text-lg font-bold text-purple-800">
                    ₩{filteredSettlements.reduce((sum, s) => sum + s.finalSettlement, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 수익 분석 차트 */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    수익 분석 차트
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartViewType('daily')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        chartViewType === 'daily'
                          ? 'bg-blue-600 text-white'
                          
                      }`}
                    >
                      일별
                    </button>
                    <button
                      onClick={() => setChartViewType('monthly')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        chartViewType === 'monthly'
                          ? 'bg-blue-600 text-white'
                          
                      }`}
                    >
                      월별
                    </button>
                    <button
                      onClick={() => setChartViewType('species')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        chartViewType === 'species'
                          ? 'bg-blue-600 text-white'
                          
                      }`}
                    >
                      수산물별
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {chartViewType === 'monthly' && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-center">월별 수익 현황</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthName" tick={{ fontSize}} />
                        <YAxis tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' ? `₩${value.toLocaleString()}` 
                            name === 'profit' ? `₩${value.toLocaleString()}` 
                            name === 'sales' ? `${value}건` ,
                            name === 'revenue' ? '총수익' 
                            name === 'profit' ? '순이익' 
                            name === 'sales' ? '판매건수' 
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3B82F6" name="총수익" />
                        <Bar dataKey="profit" fill="#10B981" name="순이익" />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* 월별 상세 통계 */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {monthlyData.map((month, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 mb-2">{month.monthName}</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">총수익:</span>
                              <span className="font-medium">₩{month.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">순이익:</span>
                              <span className="font-medium text-green-600">₩{month.profit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">판매건수:</span>
                              <span className="font-medium">{month.sales}건</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">평균 단가:</span>
                              <span className="font-medium">₩{month.avgPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {chartViewType === 'daily' && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-center">일별 수익 추이</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <ReLineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateFormatted" tick={{ fontSize}} />
                        <YAxis tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' ? `₩${value.toLocaleString()}` 
                            name === 'profit' ? `₩${value.toLocaleString()}` 
                            name === 'sales' ? `${value}건` ,
                            name === 'revenue' ? '총수익' 
                            name === 'profit' ? '순이익' 
                            name === 'sales' ? '판매건수' 
                          ]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="총수익" />
                        <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="순이익" />
                      </ReLineChart>
                    </ResponsiveContainer>
                    
                    {/* 일별 요약 통계 */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ₩{dailyData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">총 수익</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ₩{dailyData.reduce((sum, day) => sum + day.profit, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">총 순이익</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {dailyData.reduce((sum, day) => sum + day.sales, 0)}건
                        </div>
                        <div className="text-sm text-purple-700">총 판매</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          ₩{dailyData.length > 0 ? Math.round(dailyData.reduce((sum, day) => sum + day.revenue, 0) / dailyData.length).toLocaleString() }
                        </div>
                        <div className="text-sm text-orange-700">일평균 수익</div>
                      </div>
                    </div>
                  </div>
                )}

                {chartViewType === 'species' && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-center">수산물별 수익 분포</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={speciesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {speciesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`₩${value.toLocaleString()}`, '수익']} />
                        </RePieChart>
                      </ResponsiveContainer>
                      
                      <div className="space-y-4">
                        <h5 className="font-semibold text-gray-900">수산물별 상세 통계</h5>
                        {speciesData.map((species, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-medium text-gray-900">{species.name}</h6>
                              <div className="w-4 h-4 rounded" style={{ backgroundColor, '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }}></div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">총수익:</span>
                                <span className="font-medium">₩{species.value.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">판매횟수:</span>
                                <span className="font-medium">{species.count}회</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">평균수익:</span>
                                <span className="font-medium text-green-600">₩{species.avgProfit.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 필터링 및 검색 */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  필터 및 검색
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 검색 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="수산물명, 구매업체, 지역..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* 정산상태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">정산상태</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">전체</option>
                      <option value="completed">정산완료</option>
                      <option value="processing">처리중</option>
                      <option value="pickup_waiting">수령대기</option>
                    </select>
                  </div>
                  
                  {/* 기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">전체</option>
                      <option value="week">최근 1주일</option>
                      <option value="month">최근 1개월</option>
                      <option value="quarter">최근 3개월</option>
                    </select>
                  </div>
                  
                  {/* 초기화 버튼 */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDateFilter('all');
                      }}
                      className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      필터 초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 표 형태 정산 내역 */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    정산 내역 목록 ({filteredSettlements.length}건)
                  </h3>
                  <div className="text-sm text-gray-600">
                    총 수익="font-bold text-blue-600">₩{filteredSettlements.reduce((sum, s) => sum + s.finalSettlement, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {filteredSettlements.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수산물 정보</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜 정보</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격 정보</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매업체</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산 현황</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSettlements.map((settlement) => (
                        <tr key={settlement.id} className="hover:bg-gray-50">
                          {/* 수산물 정보 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{settlement.species}</div>
                                <div className="text-sm text-gray-500">
                                  {settlement.quantity}{settlement.unit} | {settlement.weight}kg
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  {settlement.qualityGrade}등급
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* 날짜 정보 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center gap-1 mb-1">
                                <Fish className="w-3 h-3 text-blue-500" />
                                <span className="text-xs text-gray-500">어획:</span>
                                <span>{new Date(settlement.catchDate).toLocaleDateString('ko-KR')}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-1">
                                <Gavel className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-500">경매:</span>
                                <span>{new Date(settlement.auctionDate).toLocaleDateString('ko-KR')}</span>
                              </div>
                              {settlement.settlementDate && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-purple-500" />
                                  <span className="text-xs text-gray-500">정산:</span>
                                  <span>{new Date(settlement.settlementDate).toLocaleDateString('ko-KR')}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* 가격 정보 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="text-xs text-gray-500 mb-1">희망가</div>
                              <div className="text-sm text-gray-600 mb-2">₩{settlement.originalPrice.toLocaleString()}</div>
                              
                              <div className="text-xs text-blue-500 mb-1">낙찰가</div>
                              <div className="font-medium text-blue-600 mb-2">₩{settlement.finalPrice.toLocaleString()}</div>
                              
                              <div className="text-xs text-green-600 mb-1">정산금</div>
                              <div className="font-bold text-green-700">₩{settlement.finalSettlement.toLocaleString()}</div>
                              <div className="text-xs text-red-500">수수료)}</div>
                            </div>
                          </td>
                          
                          {/* 구매업체 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{settlement.buyerInfo}</div>
                            <div className="text-xs text-gray-500">{settlement.buyerContact}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {settlement.bidCount}회 입찰
                            </div>
                          </td>
                          
                          {/* 정산 현황 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-start gap-2">
                              {settlement.settlementStatus === 'completed' ? (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  정산완료
                                </span>
                              ) === 'processing' ? (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <Clock className="w-3 h-3 animate-pulse" />
                                  처리중
                                </span>
                              ) 
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <AlertCircle className="w-3 h-3" />
                                  수령대기
                                </span>
                              )}
                              
                              <div className="text-xs text-gray-500">
                                {settlement.transactionId && (
                                  <div>거래번호}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* 수익률 */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-semibold text-purple-600">
                                +{(((settlement.finalSettlement - settlement.originalPrice) / settlement.originalPrice) * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                +₩{(settlement.finalSettlement - settlement.originalPrice).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                kg당) / settlement.weight).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          
                          {/* 상세 */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  alert(`상세 정보\n\n어획지역}\n메모}\n결제방법}\n입금계좌}`);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                상세보기
                              </button>
                              
                              {settlement.notes && (
                                <div className="text-xs text-gray-400 max-w-20 truncate" title={settlement.notes}>
                                  💬 {settlement.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) 
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">필터링된 결과가 없습니다</h4>
                    <p className="text-gray-600 mb-4">다른 검색 조건을 시도해보세요</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDateFilter('all');
                      }}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      필터 초기화
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 정산 안내 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                정산 프로세스 안내
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-semibold text-blue-900">경매 낙찰</div>
                    <div className="text-blue-700">구매자 결정 및 낙찰가 확정</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-semibold text-blue-900">상품 수령</div>
                    <div className="text-blue-700">구매자가 위판장에서 상품 수령</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-semibold text-blue-900">자동 정산</div>
                    <div className="text-blue-700">24시간 내 등록 계좌로 입금</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 엑셀 다운로드 안내 */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-green-600" />
                <div>
                  <h5 className="font-semibold text-green-900">엑셀 다운로드 안내</h5>
                  <p className="text-sm text-green-700 mt-1">
                    우측 상단의 '엑셀 다운로드' 버튼을 클릭하면 현재 필터링된 정산 내역을 엑셀 파일로 다운로드할 수 있습니다. 
                    세무 신고나 회계 처리에 활용하세요.
                  </p>
                  <div className="text-xs text-green-600 mt-2">
                    • 포함 정보, 수량, 중량, 어획일, 경매일, 가격 정보, 구매업체, 수익률 등 25개 항목
                    • 파일명
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
