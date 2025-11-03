'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import {
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  StarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/solid';

interface Nanny {
  id: number;
  name: string;
  email: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  experience: number;
  photo: string;
  specialization: string[];
  available: boolean;
}

interface GroupBooking {
  id: number;
  families: number;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: 'open' | 'confirmed' | 'full';
}

const nannies: Nanny[] = [
  {
    id: 1,
    name: 'Светлана Петрова',
    email: 'svetlana.petrova@nanny.com',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 500,
    experience: 8,
    photo: '👩‍🏫',
    specialization: ['Раннее развитие', 'Творчество', 'Игры'],
    available: true
  },
  {
    id: 2,
    name: 'Екатерина Иванова',
    email: 'ekaterina.ivanova@nanny.com',
    rating: 4.8,
    reviews: 94,
    hourlyRate: 450,
    experience: 5,
    photo: '👩‍⚕️',
    specialization: ['Медицинское образование', 'Уход за младенцами'],
    available: true
  },
  {
    id: 3,
    name: 'Мария Сидорова',
    email: 'maria.sidorova@nanny.com',
    rating: 5.0,
    reviews: 86,
    hourlyRate: 600,
    experience: 12,
    photo: '👩‍🎓',
    specialization: ['Английский язык', 'Подготовка к школе'],
    available: false
  }
];

const groupBookings: GroupBooking[] = [
  {
    id: 1,
    families: 3,
    date: '2 ноября',
    time: '15:00',
    duration: 3,
    location: 'ЦПКиО им. Горького',
    status: 'open'
  },
  {
    id: 2,
    families: 4,
    date: '3 ноября',
    time: '11:00',
    duration: 2,
    location: 'Музей Дарвина',
    status: 'confirmed'
  }
];

export default function NannyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('group');
  const [selectedNanny, setSelectedNanny] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-2xl font-bold text-gray-900">Групповая няня</h1>
        <p className="text-sm text-gray-600">Совместное бронирование с другими семьями</p>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('group')}
            className={`py-3 px-1 border-b-2 font-semibold transition-colors ${
              activeTab === 'group'
                ? 'border-[#FF3B30] text-[#FF3B30]'
                : 'border-transparent text-gray-500'
            }`}
          >
            Групповые встречи
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-3 px-1 border-b-2 font-semibold transition-colors ${
              activeTab === 'individual'
                ? 'border-[#FF3B30] text-[#FF3B30]'
                : 'border-transparent text-gray-500'
            }`}
          >
            Все няни
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4">
        {activeTab === 'group' && (
          <>
            {/* Group Bookings */}
            {groupBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold text-gray-900">
                        {booking.families} семьи уже в группе
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{booking.date}, {booking.time} ({booking.duration}ч)</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="text-sm">{booking.location}</span>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Стоимость на семью</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(500 * booking.duration / booking.families)} ₽
                    </p>
                    <p className="text-xs text-gray-500">
                      вместо {500 * booking.duration} ₽
                    </p>
                  </div>

                  <button className="bg-[#FF3B30] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#FF2D1F] active:scale-95 transition-all">
                    {booking.status === 'confirmed' ? 'Присоединиться' : 'Забронировать'}
                  </button>
                </div>
              </div>
            ))}

            {/* Create New Group Button */}
            <button className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors">
              <PlusIcon className="w-8 h-8" />
              <span className="font-semibold">Создать новую группу</span>
            </button>

            {/* Info Card */}
            <div className="bg-purple-50 rounded-2xl p-4 space-y-2">
              <h3 className="font-semibold text-purple-900">💡 Как это работает?</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Создайте встречу или присоединитесь к существующей</li>
                <li>• Стоимость делится на всех участников</li>
                <li>• Автопоиск замены при отмене</li>
                <li>• Оплата через приложение</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'individual' && (
          <>
            {/* Nanny Cards */}
            {nannies.map((nanny) => (
              <div
                key={nanny.id}
                className={`bg-white rounded-2xl shadow-sm p-4 space-y-3 transition-all ${
                  selectedNanny === nanny.id ? 'ring-2 ring-[#FF3B30]' : ''
                } ${!nanny.available ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <Link href={`/profile/${encodeURIComponent(nanny.email)}`}>
                    <div className="text-5xl cursor-pointer hover:opacity-80 transition-opacity">{nanny.photo}</div>
                  </Link>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/profile/${encodeURIComponent(nanny.email)}`}>
                          <h3 className="font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors">{nanny.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-600">
                          Опыт: {nanny.experience} лет
                        </p>
                      </div>

                      {nanny.available ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Доступна
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Занята
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{nanny.rating}</span>
                      <span className="text-sm text-gray-500">({nanny.reviews} отзывов)</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {nanny.specialization.map((spec, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-xl font-bold text-gray-900">
                      {nanny.hourlyRate} ₽/час
                    </span>
                  </div>

                  <button
                    disabled={!nanny.available}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                      nanny.available
                        ? 'bg-[#FF3B30] text-white hover:bg-[#FF2D1F] active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Забронировать
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

