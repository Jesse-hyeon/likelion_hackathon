'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Fish, Users, Building2, ArrowRight, Zap, 
  BarChart3, Shield, CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setCurrentMode = useStore((state) => state.setCurrentMode);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userModes = [
    {
      type: 'admin',
      title: '위판장 관리자',
      subtitle: '포항 죽도시장',
      description: '수산물 입고부터 경매 진행까지 전체 위판장 업무를 관리합니다',
      icon: Building2
    },
    {
      type: 'buyer',
      title: '구매업체',
      subtitle: '도매/소매업체',
      description: '품질 인증된 수산물을 실시간 경매로 구매합니다',
      icon: Users
    },
    {
      type: 'fisherman',
      title: '어민/생산자',
      subtitle: '포항 지역 어민',
      description: '출하한 수산물의 경매 현황과 정산을 확인합니다',
      icon: Fish
    }
  ];

  const loginCredentials = {
    admin: { email: 'admin@pohang-market.kr', name: '김위판', id: 'admin1', companyName: '포항죽도위판장' },
    buyer: { email: 'purchase@emart.co.kr', name: '이마트 수산부', id: 'buyer1', companyName: '이마트 본사' },
    fisherman: { email: 'captain@fishing.kr', name: '박선장', id: 'fisher1', companyName: '대게잡이 1호' }
  };

  const handleLogin = (mode) => {
    setIsLoading(true);
    const credentials = loginCredentials[mode];
    
    setTimeout(() => {
      setCurrentUser({
        id: credentials.id,
        email: credentials.email,
        name: credentials.name,
        userType: mode,
        companyName: credentials.companyName
      });
      setCurrentMode(mode);
      
      if (mode === 'admin') {
        router.push('/dashboard/admin');
      } else if (mode === 'buyer') {
        router.push('/dashboard/buyer');
      } else if (mode === 'fisherman') {
        router.push('/dashboard/fisherman');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Fish className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">FishBid</div>
                <div className="text-sm text-gray-500">포항 수산물 전자경매</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* 히어로 섹션 */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI 기반 스마트<br />
              수산물 경매 플랫폼
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              포항 죽도시장의 디지털 혁신으로 더 투명하고 효율적인 수산물 거래를 제공합니다
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              현재 실시간 운영중
            </div>
          </div>
        </section>

        {/* 사용자 선택 */}
        <section className="pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">서비스 이용하기</h2>
            <p className="text-gray-600">해당하는 사용자 유형을 선택해주세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {userModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.type;
              
              return (
                <div
                  key={mode.type}
                  className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedMode(mode.type)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    isSelected ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-4">{mode.subtitle}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">{mode.description}</p>
                  
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogin(mode.type);
                      }}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          접속중...
                        </div>
                      ) : (
                        <>
                          시작하기
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="py-20 border-t border-gray-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">주요 기능</h2>
            <p className="text-gray-600">전통 위판장의 디지털 혁신을 이끕니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI 품질 인증</h3>
              <p className="text-gray-600 leading-relaxed">
                사진 기반 자동 품질 분석으로 객관적이고 일관된 등급 평가를 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">실시간 전자경매</h3>
              <p className="text-gray-600 leading-relaxed">
                투명한 가격 형성과 효율적인 경매 프로세스로 모든 참여자의 만족도를 높입니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">통합 정산 시스템</h3>
              <p className="text-gray-600 leading-relaxed">
                자동 정산 처리와 실시간 거래 현황으로 투명하고 신뢰할 수 있는 거래환경을 제공합니다
              </p>
            </div>
          </div>
        </section>

        {/* 통계 */}
        <section className="py-20 border-t border-gray-100">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15,000+</div>
              <div className="text-gray-600">월 거래량 (톤)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98.5%</div>
              <div className="text-gray-600">AI 정확도</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">250+</div>
              <div className="text-gray-600">참여 업체</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">실시간 운영</div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Fish className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">FishBid</div>
                <div className="text-sm text-gray-500">포항 수산물 전자경매</div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-600 mb-1">
                경상북도 포항시 남구 죽도시장길 17
              </div>
              <div className="text-sm text-gray-600 mb-2">
                전화: 054-242-8000 | 팩스: 054-242-8001
              </div>
              <div className="text-xs text-gray-500">
                © 2024 포항죽도위판장. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}