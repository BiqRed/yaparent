'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import {
  UserCircleIcon,
  HeartIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid';
import type { UserType } from '@/types';

interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Booking {
  id: string;
  clientId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  location: string;
  birthDate: string;
  userType: 'parent' | 'nanny';
  photoUrl?: string;
  avatar?: string;
  bio?: string;
  kids?: Array<{ name: string; age: number; gender: 'boy' | 'girl' }>;
  interests?: string[];
  hourlyRate?: string;
  experience?: string;
  education?: string;
  ageRange?: string;
  specializations?: string[];
  certifications?: string[];
  languages?: string[];
  availableHours?: string[];
  reviews?: Review[];
  bookings?: Booking[];
  friends?: string[];
  rating?: number;
  karma?: number;
  latitude?: number;
  longitude?: number;
}

// Calculate age from birthDate (helper function)
const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function ProfilePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('parent');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (!currentUserEmail) return;

      const response = await fetch(`/api/chats?currentUserEmail=${encodeURIComponent(currentUserEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const total = data.chats?.reduce((sum: number, chat: any) => sum + (chat.unread || 0), 0) || 0;
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadUserData = async () => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('currentUserEmail');
      const storedType = localStorage.getItem('userType') as UserType;
      
      if (!email || !storedType) {
        router.push('/');
        return;
      }
      
      try {
        // Fetch user data from API
        const response = await fetch(`/api/users/current?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          console.error('Failed to fetch user data');
          router.push('/');
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);
        setUserType(data.user.userType);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/');
      }
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserEmail');
      localStorage.removeItem('userType');
      router.push('/login');
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const userAge = calculateAge(currentUser.birthDate);
  const displayName = currentUser.name;
  const displayLocation = currentUser.location;
  const displayPhoto = currentUser.photoUrl || currentUser.avatar || (userType === 'parent' ? '👨‍👩‍👧‍👦' : '👩‍🏫');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Info */}
      <div className="px-4 pt-6">
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={`w-24 h-24 ${userType === 'parent' ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-gradient-to-br from-green-400 to-teal-400'} rounded-full flex items-center justify-center text-5xl overflow-hidden`}>
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayPhoto
                )}
              </div>
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF3B30] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
              </Link>
              {userType === 'nanny' && (
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}{userAge > 0 ? `, ${userAge}` : ''}</h1>
                  <p className="text-gray-600 text-sm">{displayLocation}</p>
                  <p className="text-gray-500 text-xs mt-1">{currentUser.email}</p>
                </div>
                {userType === 'nanny' && currentUser.hourlyRate && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₽{currentUser.hourlyRate}</div>
                    <div className="text-xs text-gray-500">руб/час</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{currentUser.rating || 0}</span>
                </div>
                {userType === 'parent' ? (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-purple-600">
                      <HeartIcon className="w-4 h-4" />
                      <span className="font-semibold">{currentUser.karma || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="text-sm text-gray-600">
                      {currentUser.reviews?.length || 0} отзывов
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {currentUser.bio && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-700 leading-relaxed">
                {currentUser.bio}
              </p>
            </div>
          )}

          {/* Kids (only for parents) */}
          {userType === 'parent' && currentUser.kids && currentUser.kids.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Дети:</p>
              <div className="flex gap-2 flex-wrap">
                {currentUser.kids.map((kid, idx) => (
                  <div key={idx} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-semibold">
                    {kid.gender === 'girl' ? '👧' : '👦'} {kid.name}, {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests (only for parents) */}
          {userType === 'parent' && currentUser.interests && currentUser.interests.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Интересы:</p>
              <div className="flex gap-2 flex-wrap">
                {currentUser.interests.map((interest, idx) => (
                  <div key={idx} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-full text-sm font-semibold">
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Info (only for nannies) */}
          {userType === 'nanny' && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {/* Experience and Age Range */}
              <div className="grid grid-cols-2 gap-3">
                {currentUser.experience && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="font-semibold block text-xs text-gray-500">Опыт работы</span>
                      <span className="text-gray-900">{currentUser.experience} лет</span>
                    </div>
                  </div>
                )}
                {currentUser.ageRange && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserCircleIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="font-semibold block text-xs text-gray-500">Возраст детей</span>
                      <span className="text-gray-900">{currentUser.ageRange}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Education */}
              {currentUser.education && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <AcademicCapIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-xs text-gray-500 mb-1">Образование</span>
                    <span className="text-gray-900">{currentUser.education}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Specializations (only for nannies) */}
          {userType === 'nanny' && currentUser.specializations && currentUser.specializations.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Специализация:</p>
              <div className="flex gap-2 flex-wrap">
                {currentUser.specializations.map((spec, idx) => (
                  <div key={idx} className="bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications (only for nannies) */}
          {userType === 'nanny' && currentUser.certifications && currentUser.certifications.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">
                <ShieldCheckIcon className="w-4 h-4 inline-block mr-1 text-green-600" />
                Сертификаты и курсы:
              </p>
              <ul className="space-y-1">
                {currentUser.certifications.map((cert, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages (only for nannies) */}
          {userType === 'nanny' && currentUser.languages && currentUser.languages.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Языки:</p>
              <div className="flex gap-2 flex-wrap">
                {currentUser.languages.map((lang, idx) => (
                  <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold">
                    🌐 {lang}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Hours (only for nannies) */}
          {userType === 'nanny' && currentUser.availableHours && currentUser.availableHours.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">График работы:</p>
              <div className="space-y-2">
                {currentUser.availableHours.map((hours, idx) => (
                  <div key={idx} className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {hours}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {userType === 'parent' ? (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-2xl p-4 text-center">
              <UsersIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{currentUser.friends?.length || 0}</p>
              <p className="text-xs text-gray-600">Друзей</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <HeartIcon className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{currentUser.karma || 0}</p>
              <p className="text-xs text-gray-600">Карма</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <CalendarIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-600">Мероприятий</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-2xl p-4 text-center">
              <ClockIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{currentUser.bookings?.filter(b => b.status === 'completed').length || 0}</p>
              <p className="text-xs text-gray-600">Завершено</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <CalendarIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{currentUser.bookings?.filter(b => b.status === 'active').length || 0}</p>
              <p className="text-xs text-gray-600">Активных</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <StarIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{currentUser.reviews?.length || 0}</p>
              <p className="text-xs text-gray-600">Отзывов</p>
            </div>
          </div>
        )}

        {/* Reviews Section (only for nannies) */}
        {userType === 'nanny' && currentUser.reviews && currentUser.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mt-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              Отзывы ({currentUser.reviews.length})
            </h3>
            <div className="space-y-4">
              {currentUser.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.fromUserName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`w-4 h-4 ${idx < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="space-y-3 mt-6">
          <Link href="/profile/edit" className="block bg-white rounded-2xl p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Редактировать профиль</span>
              <span className="text-gray-400">›</span>
            </div>
          </Link>

          <div className="block bg-white rounded-2xl p-4 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Моя активность</span>
              <LockClosedIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <Link href="/notifications" className="block bg-white rounded-2xl p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Уведомления</span>
              {unreadCount > 0 && (
                <span className="bg-[#FF3B30] text-white text-xs px-2 py-1 rounded-full font-bold">{unreadCount}</span>
              )}
              <span className="text-gray-400">›</span>
            </div>
          </Link>

          <div className="block bg-white rounded-2xl p-4 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Настройки</span>
              <LockClosedIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="block bg-white rounded-2xl p-4 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Приватность и безопасность</span>
              <LockClosedIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="block bg-white rounded-2xl p-4 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-600" />
              <span className="flex-1 font-semibold text-gray-900">Помощь и поддержка</span>
              <LockClosedIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-white rounded-2xl p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
              <span className="flex-1 font-semibold text-red-600 text-left">Выйти</span>
            </div>
          </button>
        </div>

        {/* Version Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Ya Родители v1.0.0 • {userType === 'parent' ? 'Родитель' : 'Няня'}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
