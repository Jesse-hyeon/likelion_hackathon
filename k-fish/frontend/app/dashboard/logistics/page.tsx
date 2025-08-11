'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/StatCard';
import { Truck, Package, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { deliveryAPI } from '@/lib/api';

export default function LogisticsDashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const deliveries = useStore((state) => state.deliveries);
  const setDeliveries = useStore((state) => state.setDeliveries);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const deliveriesData = await deliveryAPI.getAll();
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const inTransit = deliveries.filter(d => d.status === 'in_transit');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">물류 대시보드</h1>
          <p className="text-gray-600">안녕하세요, {currentUser?.name}님</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="활성 배송"
            value={activeDeliveries.length}
            icon={Truck}
            color="primary"
          />
          <StatCard
            title="운송중"
            value={inTransit.length}
            icon={Package}
            color="warning"
          />
          <StatCard
            title="대기중"
            value={deliveries.filter(d => d.status === 'preparing').length}
            icon={Clock}
            color="success"
          />
          <StatCard
            title="완료됨"
            value={completedDeliveries.length}
            icon={CheckCircle}
            color="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">빠른 작업</h2>
            <div className="space-y-3">
              <Link
                href="/tracking"
                className="block w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                실시간 배송 추적
              </Link>
              <button className="w-full bg-warning text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                상자 회수 일정
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">진행중인 배송</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activeDeliveries.slice(0, 5).map((delivery) => (
                <div key={delivery.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {delivery.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        온도: {delivery.temperature.toFixed(1)}°C
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      delivery.status === 'in_transit' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status === 'in_transit' ? '운송중' : '준비중'}
                    </span>
                  </div>
                </div>
              ))}
              {activeDeliveries.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  진행중인 배송이 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}