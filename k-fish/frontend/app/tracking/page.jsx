'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { socketService } from '@/lib/socket';
import { deliveryAPI } from '@/lib/api';
import { Truck, MapPin, Thermometer, Clock, Package, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TrackingPage() {
  const currentUser = useStore((state) => state.currentUser);
  const deliveries = useStore((state) => state.deliveries);
  const setDeliveries = useStore((state) => state.setDeliveries);
  const updateDelivery = useStore((state) => state.updateDelivery);

  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
    connectSocket();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadDeliveries = async () => {
    try {
      const data = await deliveryAPI.getAll();
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const connectSocket = () => {
    const socket = socketService.connect();

    socketService.onDeliveryUpdate((delivery) => {
      updateDelivery(delivery);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivering':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing':
        return Package;
      case 'in_transit':
        return Truck;
      case 'delivering':
        return MapPin;
      case 'delivered':
        return CheckCircle;
      default:
        return Package;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'preparing':
        return '준비중';
      case 'in_transit':
        return '운송중';
      case 'delivering':
        return '배송중';
      case 'delivered':
        return '배송완료';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">배송 추적</h1>
            <p className="text-gray-600">{currentUser?.name}님의 배송 현황</p>
          </div>
          <Link
            href={`/dashboard/${currentUser?.userType}`}
            className="text-primary hover:text-blue-700"
          >
            대시보드로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">배송 목록</h2>
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                    selectedDelivery === delivery.id ? 'ring-2 ring-primary' 
                  }`}
                  onClick={() => setSelectedDelivery(delivery.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        배송 ID, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        상품 ID, 8)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                      {getStatusLabel(delivery.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      위도)}
                      <br />
                      경도)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Thermometer size={16} className="mr-2" />
                      온도)}°C
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    예상 도착).toLocaleString('ko-KR')}
                  </div>

                  {selectedDelivery === delivery.id && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-gray-800 mb-3">배송 타임라인</h4>
                      <div className="space-y-3">
                        {delivery.timeline.map((event, index) => {
                          const Icon = getStatusIcon(event.status);
                          return (
                            <div key={index} className="flex items-start">
                              <div className={`p-2 rounded-full ${getStatusColor(event.status)} mr-3`}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {getStatusLabel(event.status)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(event.timestamp).toLocaleString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {deliveries.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <Truck className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">진행중인 배송이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">배송 통계</h2>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">전체 배송</span>
                  <span className="font-medium">{deliveries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">준비중</span>
                  <span className="font-medium text-yellow-600">
                    {deliveries.filter(d => d.status === 'preparing').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">운송중</span>
                  <span className="font-medium text-blue-600">
                    {deliveries.filter(d => d.status === 'in_transit').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">배송중</span>
                  <span className="font-medium text-purple-600">
                    {deliveries.filter(d => d.status === 'delivering').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">완료</span>
                  <span className="font-medium text-green-600">
                    {deliveries.filter(d => d.status === 'delivered').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">온도 관리</h3>
              <p className="text-sm text-blue-700">
                모든 배송은 -2°C ~ 0°C 사이의 최적 온도로 유지되고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}