'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Building2, ShoppingCart, Fish, ArrowRight, 
  Camera, Award, Gavel, TrendingUp, CheckCircle,
  Clock, Users, DollarSign
} from 'lucide-react';
import { UserType } from '@/types';

export default function DemoPage() {
  const router = useRouter();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setCurrentMode = useStore((state) => state.setCurrentMode);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoDemo, setIsAutoDemo] = useState(false);

  const demoFlow = [
    {
      step: 1,
      role: '위판장',
      title: '수산물 입고 및 등록',
      description: '어민이 가져온 수산물을 촬영하고 AI 품질 평가를 진행합니다',
      icon: Building2,
      color: 'bg-blue-500',
      actions: ['상품 촬영', 'AI 품질 평가', '경매 등록']
    },
    {
      step: 2, 
      role: '구매자',
      title: '실시간 경매 참여',
      description: '품질 등급을 확인하고 실시간 입찰에 참여합니다',
      icon: ShoppingCart,
      color: 'bg-green-500',
      actions: ['품질 등급 확인', '실시간 입찰', '낙찰 완료']
    },
    {
      step: 3,
      role: '어민',
      title: '판매 결과 확인',
      description: '경매 결과와 정산 내역을 확인합니다',
      icon: Fish,
      color: 'bg-orange-500',
      actions: ['판매 현황', '정산 내역', '배송 추적']
    }
  ];

  const userCredentials = {
    '위판장': { 
      email: 'market@fishbid.com', 
      name: '포항위판장', 
      id: 'market1', 
      companyName: '포항죽도위판장',
      userType: 'admin' as UserType
    },
    '구매자': { 
      email: 'buyer1@fishbid.com', 
      name: '이마트 수산부', 
      id: 'buyer1', 
      companyName: '이마트',
      userType: 'buyer' as UserType
    },
    '어민': { 
      email: 'fisherman1@fishbid.com', 
      name: '김어민', 
      id: 'fisher1', 
      companyName: '대게잡이배',
      userType: 'fisherman' as UserType
    }
  };

  const startDemo = (role: string, stepIndex: number) => {
    const credentials = userCredentials[role as keyof typeof userCredentials];
    
    setCurrentUser({
      id: credentials.id,
      email: credentials.email,
      name: credentials.name,
      userType: credentials.userType,
      companyName: credentials.companyName
    });
    
    setCurrentMode(credentials.userType);
    
    // 역할별 대시보드로 이동
    if (role === '위판장') {
      router.push('/market/dashboard');
    } else if (role === '구매자') {
      router.push('/buyer/dashboard');
    } else if (role === '어민') {
      router.push('/fisherman/dashboard');
    }
  };

  const startAutoDemo = () => {
    setIsAutoDemo(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isAutoDemo && currentStep < demoFlow.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoDemo, currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Fish className="w-16 h-16 text-blue-600" />
            <div>
              <h1 className="text-5xl font-bold text-gray-800">FishBid 포항</h1>
              <p className="text-xl text-blue-600 mt-2">AI 품질 평가 기반 스마트 수산물 경매</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 해커톤 시연 시나리오</h2>
            <p className="text-lg text-gray-600">
              포항 죽도시장의 실제 업무 흐름을 그대로 재현한 <strong>완전한 경매 사이클</strong>
            </p>
          </div>
        </div>

        {/* 시연 플로우 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-center mb-8">📋 시연 흐름도</h3>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {demoFlow.map((flow, index) => {
              const Icon = flow.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`${flow.color} text-white w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${
                    isAutoDemo && currentStep === index ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                  }`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <div className="text-center max-w-xs">
                    <h4 className="font-bold text-lg mb-2">{flow.step}. {flow.role}</h4>
                    <h5 className="font-semibold text-gray-800 mb-2">{flow.title}</h5>
                    <p className="text-sm text-gray-600 mb-4">{flow.description}</p>
                    
                    <div className="space-y-1">
                      {flow.actions.map((action, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 rounded-full px-3 py-1">
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {index < demoFlow.length - 1 && (
                    <ArrowRight className="w-8 h-8 text-gray-400 mt-8 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 시연 시작 옵션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 자동 시연 */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🎬 자동 시연 모드</h3>
            <p className="mb-6 text-purple-100">
              전체 흐름을 순서대로 자동 진행합니다<br/>
              <strong>심사위원 프레젠테이션용</strong>
            </p>
            <button
              onClick={startAutoDemo}
              className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              자동 시연 시작
            </button>
          </div>

          {/* 수동 체험 */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🎮 체험 모드</h3>
            <p className="mb-6 text-green-100">
              원하는 역할을 선택해서 직접 체험합니다<br/>
              <strong>상세 기능 확인용</strong>
            </p>
            <div className="text-sm text-green-100">
              아래 역할 카드에서 선택하세요 ↓
            </div>
          </div>
        </div>

        {/* 역할별 시작 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoFlow.map((flow, index) => {
            const Icon = flow.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-300"
                onClick={() => startDemo(flow.role, index)}
              >
                <div className={`${flow.color} text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-center mb-2">{flow.role} 모드</h3>
                <p className="text-sm text-gray-600 text-center mb-4">{flow.description}</p>
                
                <div className="space-y-2">
                  {flow.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      {action}
                    </div>
                  ))}
                </div>
                
                <button className={`w-full mt-4 ${flow.color} text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2`}>
                  시작하기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* 핵심 기능 강조 */}
        <div className="mt-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">⭐ 핵심 차별화 기능</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-bold">사진 촬영</h4>
              <p className="text-sm text-gray-600">3장 이상 업로드</p>
            </div>
            
            <div className="text-center">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold">AI 품질 평가</h4>
              <p className="text-sm text-gray-600">2-3초 자동 분석</p>
            </div>
            
            <div className="text-center">
              <Gavel className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-bold">실시간 경매</h4>
              <p className="text-sm text-gray-600">품질별 필터링</p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h4 className="font-bold">투명한 정산</h4>
              <p className="text-sm text-gray-600">즉시 결과 확인</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🚀 포항 죽도시장 디지털 전환 · MVP 해커톤 출품작</p>
        </div>
      </div>
    </div>
  );
}