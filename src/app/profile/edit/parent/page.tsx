'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserIcon,
  MapPinIcon,
  InformationCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';
import type { Kid } from '@/types';

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

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  birthDate: string;
  userType: 'parent' | 'nanny';
  photoUrl?: string;
  // Parent-specific fields
  bio?: string;
  kids?: Kid[];
  interests?: string[];
  // Statistics
  reviews?: Review[];
  bookings?: Booking[];
  friends?: string[];
  rating?: number;
}

// Calculate age from birthDate
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

export default function EditParentProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    bio: '',
    phone: '',
    email: '',
  });

  const [kids, setKids] = useState<Kid[]>([]);

  const [interests, setInterests] = useState<string[]>([]);

  const [newInterest, setNewInterest] = useState('');

  // Load user data from API
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('currentUserEmail');
        
        if (!email) {
          router.push('/login');
          return;
        }
        
        try {
          const response = await fetch(`/api/users/current?email=${encodeURIComponent(email)}`);
          
          if (!response.ok) {
            console.error('Failed to fetch user data');
            router.push('/login');
            return;
          }

          const data = await response.json();
          const user: RegisteredUser = data.user;
          
          // Check if user is a parent
          if (user.userType !== 'parent') {
            router.push('/profile/edit/nanny');
            return;
          }
          
          const userAge = calculateAge(user.birthDate);
          
          setFormData({
            name: user.name || '',
            age: userAge > 0 ? String(userAge) : '',
            location: user.location || '',
            phone: user.phone || '',
            email: user.email || '',
            bio: user.bio || '',
          });
          
          // Load photo if exists
          if (user.photoUrl) {
            setPhotoUrl(user.photoUrl);
            setPhotoPreview(user.photoUrl);
          }
          
          // Load kids if exists
          if (user.kids && user.kids.length > 0) {
            setKids(user.kids);
          }
          
          // Load interests if exists
          if (user.interests && user.interests.length > 0) {
            setInterests(user.interests);
          }
          
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading user data:', error);
          router.push('/login');
        }
      }
    };
    
    loadUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const addKid = () => {
    setKids([...kids, { name: '', age: 0, gender: 'boy' }]);
  };

  const removeKid = (index: number) => {
    setKids(kids.filter((_, i) => i !== index));
  };

  const updateKid = (index: number, field: keyof Kid, value: string | number) => {
    const updatedKids = [...kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    setKids(updatedKids);
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const email = localStorage.getItem('currentUserEmail');
      if (!email) {
        router.push('/login');
        return;
      }

      // Update user data via API
      const response = await fetch(`/api/users/current?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          photoUrl: photoUrl,
          bio: formData.bio,
          kids: kids,
          interests: interests,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsLoading(false);
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsLoading(false);
      alert('Ошибка при сохранении профиля');
    }
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <BackButton href="/profile" />
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Профиль родителя</span>
          </div>
          <h1 className="text-2xl font-bold">Редактировать профиль</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Основная информация</h2>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Фото профиля
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 shadow-lg">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      👨‍👩‍👧‍👦
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="flex-1 cursor-pointer bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-100 hover:border-purple-400 transition-all"
                >
                  <div className="px-4 py-3 text-center">
                    <span className="text-gray-600 font-medium">
                      {photoPreview ? '📷 Изменить фото' : '📷 Загрузить фото'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG до 5MB</p>
                  </div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                Возраст
              </label>
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age ? `${formData.age} лет` : 'Не указан'}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Возраст вычисляется из даты рождения, указанной при регистрации
              </p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Местоположение
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                О себе
              </label>
              <div className="relative">
                <InformationCircleIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Kids Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Мои дети</h2>
              <button
                type="button"
                onClick={addKid}
                className="flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Добавить
              </button>
            </div>

            {kids.map((kid, index) => (
              <div key={index} className="relative bg-gray-50 rounded-xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => removeKid(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={kid.name}
                      onChange={(e) => updateKid(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Имя ребенка"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Возраст
                    </label>
                    <input
                      type="number"
                      value={kid.age}
                      onChange={(e) => updateKid(index, 'age', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Возраст"
                      min="0"
                      max="18"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Пол
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateKid(index, 'gender', 'boy')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                        kid.gender === 'boy'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      👦 Мальчик
                    </button>
                    <button
                      type="button"
                      onClick={() => updateKid(index, 'gender', 'girl')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                        kid.gender === 'girl'
                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-400'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      👧 Девочка
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {kids.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-3">Добавьте информацию о ваших детях</p>
                <button
                  type="button"
                  onClick={addKid}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  + Добавить ребенка
                </button>
              </div>
            )}
          </div>

          {/* Interests Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Интересы</h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Добавить интерес..."
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors"
              >
                Добавить
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-semibold group hover:bg-purple-100 transition-colors"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {interests.length === 0 && (
              <p className="text-center py-4 text-gray-500">
                Добавьте свои интересы, чтобы найти единомышленников
              </p>
            )}
          </div>

          {/* Contact Info Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Контакты</h2>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-safe">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Сохранение...
                </span>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

