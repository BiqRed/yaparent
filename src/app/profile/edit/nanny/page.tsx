'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserIcon,
  MapPinIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XMarkIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';

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
  // Nanny-specific fields
  bio?: string;
  hourlyRate?: string;
  experience?: string;
  education?: string;
  ageRange?: string;
  specializations?: string[];
  certifications?: string[];
  languages?: string[];
  availableHours?: string[];
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

export default function EditNannyProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    bio: 'Опытная няня с педагогическим образованием. Специализируюсь на раннем развитии детей. Люблю творческие занятия и активные игры.',
    phone: '',
    email: '',
    hourlyRate: '800',
    experience: '5',
    education: 'Московский педагогический университет, факультет дошкольного образования',
    ageRange: '0-6 лет',
  });

  const [specializations, setSpecializations] = useState<string[]>([
    'Раннее развитие',
    'Творчество',
    'Английский язык',
    'Подготовка к школе',
  ]);

  const [certifications, setCertifications] = useState<string[]>([
    'Курсы первой помощи',
    'Сертификат Монтессори-педагога',
  ]);

  const [languages, setLanguages] = useState<string[]>([
    'Русский (родной)',
    'Английский (свободно)',
  ]);

  const [availableHours, setAvailableHours] = useState<string[]>([
    'Будни 8:00-18:00',
    'Выходные по договоренности',
  ]);

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHours, setNewHours] = useState('');

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
          
          // Check if user is a nanny
          if (user.userType !== 'nanny') {
            router.push('/profile/edit/parent');
            return;
          }
          
          const userAge = calculateAge(user.birthDate);
          
          setFormData({
            name: user.name || '',
            age: userAge > 0 ? String(userAge) : '',
            location: user.location || '',
            phone: user.phone || '',
            email: user.email || '',
            bio: user.bio || 'Опытная няня с педагогическим образованием. Специализируюсь на раннем развитии детей. Люблю творческие занятия и активные игры.',
            hourlyRate: user.hourlyRate || '800',
            experience: user.experience || '5',
            education: user.education || 'Московский педагогический университет, факультет дошкольного образования',
            ageRange: user.ageRange || '0-6 лет',
          });
          
          // Load photo if exists
          if (user.photoUrl) {
            setPhotoUrl(user.photoUrl);
            setPhotoPreview(user.photoUrl);
          }
          
          // Load specializations if exists
          if (user.specializations && user.specializations.length > 0) {
            setSpecializations(user.specializations);
          }
          
          // Load certifications if exists
          if (user.certifications && user.certifications.length > 0) {
            setCertifications(user.certifications);
          }
          
          // Load languages if exists
          if (user.languages && user.languages.length > 0) {
            setLanguages(user.languages);
          }
          
          // Load available hours if exists
          if (user.availableHours && user.availableHours.length > 0) {
            setAvailableHours(user.availableHours);
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

  const addItem = (item: string, list: string[], setList: (list: string[]) => void, clearInput: () => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      clearInput();
    }
  };

  const removeItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter((i) => i !== item));
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
          hourlyRate: formData.hourlyRate,
          experience: formData.experience,
          education: formData.education,
          ageRange: formData.ageRange,
          specializations: specializations,
          certifications: certifications,
          languages: languages,
          availableHours: availableHours,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <BackButton href="/profile" />
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Профиль няни</span>
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
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-teal-400 flex-shrink-0 shadow-lg">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      👩‍🏫
                    </div>
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="flex-1 cursor-pointer bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-100 hover:border-green-400 transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Профессиональная информация</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Опыт работы (лет)
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ставка (₽/час)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="ageRange" className="block text-sm font-semibold text-gray-700 mb-2">
                Возраст детей
              </label>
              <input
                type="text"
                id="ageRange"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                placeholder="например: 0-3 года, 3-7 лет"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-semibold text-gray-700 mb-2">
                Образование
              </label>
              <div className="relative">
                <AcademicCapIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Специализация</h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newSpecialization, specializations, setSpecializations, () => setNewSpecialization('')))}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Добавить специализацию..."
              />
              <button
                type="button"
                onClick={() => addItem(newSpecialization, specializations, setSpecializations, () => setNewSpecialization(''))}
                className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {specializations.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(spec, specializations, setSpecializations)}
                    className="text-green-400 hover:text-green-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              Сертификаты и курсы
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newCertification, certifications, setCertifications, () => setNewCertification('')))}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Добавить сертификат..."
              />
              <button
                type="button"
                onClick={() => addItem(newCertification, certifications, setCertifications, () => setNewCertification(''))}
                className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl"
                >
                  <span className="text-green-800 font-medium">{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(cert, certifications, setCertifications)}
                    className="text-green-400 hover:text-green-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LanguageIcon className="w-6 h-6 text-blue-600" />
              Языки
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newLanguage, languages, setLanguages, () => setNewLanguage('')))}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Добавить язык..."
              />
              <button
                type="button"
                onClick={() => addItem(newLanguage, languages, setLanguages, () => setNewLanguage(''))}
                className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(lang, languages, setLanguages)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Hours */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-purple-600" />
              График работы
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newHours, availableHours, setAvailableHours, () => setNewHours('')))}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="например: Будни 9:00-18:00"
              />
              <button
                type="button"
                onClick={() => addItem(newHours, availableHours, setAvailableHours, () => setNewHours(''))}
                className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {availableHours.map((hours, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-purple-50 px-4 py-3 rounded-xl"
                >
                  <span className="text-purple-800 font-medium">{hours}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(hours, availableHours, setAvailableHours)}
                    className="text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-safe">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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

