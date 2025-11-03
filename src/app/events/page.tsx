'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TicketIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  distance: number;
  price: number | 'free';
  ageRange: string;
  image: string;
  attendees: number;
  maxAttendees?: number;
  hasNanny: boolean;
  autoGroup: boolean;
  liked: boolean;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Детский спектакль "Золушка"',
    category: 'Театр',
    date: '2 ноября',
    time: '11:00',
    location: 'Театр Кукол',
    distance: 1.2,
    price: 500,
    ageRange: '3-7 лет',
    image: '🎭',
    attendees: 8,
    maxAttendees: 15,
    hasNanny: true,
    autoGroup: true,
    liked: false
  },
  {
    id: 2,
    title: 'Мастер-класс по рисованию',
    category: 'Творчество',
    date: '3 ноября',
    time: '14:00',
    location: 'Арт-студия "Краски"',
    distance: 0.5,
    price: 700,
    ageRange: '4-10 лет',
    image: '🎨',
    attendees: 5,
    maxAttendees: 10,
    hasNanny: false,
    autoGroup: true,
    liked: true
  },
  {
    id: 3,
    title: 'Праздник в Парке Горького',
    category: 'Праздник',
    date: '4 ноября',
    time: '12:00',
    location: 'ЦПКиО им. Горького',
    distance: 2.0,
    price: 'free',
    ageRange: '0-12 лет',
    image: '🎪',
    attendees: 24,
    hasNanny: true,
    autoGroup: true,
    liked: false
  },
  {
    id: 4,
    title: 'Научное шоу "Эксперименты"',
    category: 'Наука',
    date: '5 ноября',
    time: '15:00',
    location: 'Музей Экспериментариум',
    distance: 3.5,
    price: 900,
    ageRange: '6-12 лет',
    image: '🔬',
    attendees: 12,
    maxAttendees: 20,
    hasNanny: false,
    autoGroup: false,
    liked: false
  },
  {
    id: 5,
    title: 'Детская дискотека',
    category: 'Развлечения',
    date: '6 ноября',
    time: '16:00',
    location: 'Детский клуб "Веселье"',
    distance: 0.8,
    price: 600,
    ageRange: '3-8 лет',
    image: '🎵',
    attendees: 15,
    maxAttendees: 25,
    hasNanny: true,
    autoGroup: true,
    liked: true
  },
  {
    id: 6,
    title: 'Зоопарк: день животных',
    category: 'Природа',
    date: '7 ноября',
    time: '10:00',
    location: 'Московский зоопарк',
    distance: 4.2,
    price: 800,
    ageRange: '2-12 лет',
    image: '🦁',
    attendees: 18,
    hasNanny: true,
    autoGroup: true,
    liked: false
  }
];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [eventList, setEventList] = useState(events);

  const categories = ['all', 'Театр', 'Творчество', 'Праздник', 'Наука', 'Развлечения', 'Природа'];

  const filteredEvents = selectedCategory === 'all'
    ? eventList
    : eventList.filter(e => e.category === selectedCategory);

  const toggleLike = (eventId: number) => {
    setEventList(eventList.map(e =>
      e.id === eventId ? { ...e, liked: !e.liked } : e
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-2xl font-bold text-gray-900">Умная афиша</h1>
        <p className="text-sm text-gray-600">Персональные события для ваших детей</p>
      </header>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[#FF3B30] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-semibold">Подобрано специально для вас</p>
            <p className="text-sm text-white/90">На основе интересов и возраста детей</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <main className="flex-1 p-4 space-y-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Event Image/Icon */}
            <div className="relative h-32 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
              <div className="text-6xl">{event.image}</div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggleLike(event.id)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  {event.liked ? (
                    <HeartIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartOutlineIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <ShareIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                {event.category}
              </div>
            </div>

            {/* Event Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.ageRange}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{event.date}, {event.time}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{event.location} • {event.distance} км</span>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{event.attendees}/{event.maxAttendees} участников</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex gap-2 flex-wrap">
                {event.autoGroup && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                    🤝 Автогруппа
                  </span>
                )}
                {event.hasNanny && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                    👶 Есть няня
                  </span>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  {event.price === 'free' ? (
                    <span className="text-2xl font-bold text-green-600">Бесплатно</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{event.price} ₽</span>
                      <span className="text-sm text-gray-500"> /чел</span>
                    </div>
                  )}
                </div>

                <button className="bg-[#FF3B30] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#FF2D1F] active:scale-95 transition-all">
                  Записаться
                </button>
              </div>

              {/* Auto Group Info */}
              {event.autoGroup && event.attendees >= 3 && (
                <div className="bg-purple-50 rounded-xl p-3 text-sm">
                  <p className="text-purple-900 font-semibold">
                    ✨ Найдено {event.attendees} попутчиков рядом
                  </p>
                  <p className="text-purple-700 text-xs mt-1">
                    Можно забронировать няню совместно
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-[#FF3B30] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <SparklesIcon className="w-7 h-7" />
      </button>

      <BottomNav />
    </div>
  );
}

