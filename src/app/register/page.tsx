'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  HeartIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';

const RUSSIAN_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
];

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    birthDate: '',
    userType: '' as 'parent' | 'nanny' | '',
  });
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (currentUserEmail) {
        router.push('/profile');
      }
    }
  }, [router]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Replace leading 8 with 7
    let formatted = cleaned;
    if (formatted.startsWith('8')) {
      formatted = '7' + formatted.slice(1);
    }
    
    // Ensure it starts with 7
    if (formatted && !formatted.startsWith('7')) {
      formatted = '7' + formatted;
    }
    
    // Format: +7 (XXX) XXX XX XX
    if (formatted.length === 0) return '';
    if (formatted.length <= 1) return `+${formatted}`;
    if (formatted.length <= 4) return `+${formatted[0]} (${formatted.slice(1)}`;
    if (formatted.length <= 7) return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
    if (formatted.length <= 9) return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)} ${formatted.slice(7)}`;
    return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBirthDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    if (type === 'day') setBirthDay(value);
    if (type === 'month') setBirthMonth(value);
    if (type === 'year') setBirthYear(value);

    // Update formData.birthDate when all three are selected
    const day = type === 'day' ? value : birthDay;
    const month = type === 'month' ? value : birthMonth;
    const year = type === 'year' ? value : birthYear;

    if (day && month && year) {
      const monthIndex = String(parseInt(month) + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      setFormData((prev) => ({ ...prev, birthDate: `${year}-${monthIndex}-${dayPadded}` }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'Файл слишком большой. Максимум 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: 'Пожалуйста, выберите изображение' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        setPhotoPreview(base64String);
        if (errors.photo) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.photo;
            return newErrors;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userType) {
      newErrors.userType = 'Выберите тип аккаунта';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше имя';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Введите город';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Необходимо принять условия';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setIsRequestingLocation(true);

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
            enableHighAccuracy: false,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        setLocationGranted(true);
      } catch (error) {
        console.log('Geolocation denied or unavailable:', error);
        setLocationGranted(false);
      }
    } else {
      setLocationGranted(false);
    }

    setIsRequestingLocation(false);

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          userType: formData.userType,
          location: formData.location,
          birthDate: formData.birthDate,
          photoUrl: photoUrl || undefined,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setErrors({ email: data.error || 'Ошибка при регистрации' });
        return;
      }

      console.log('User registered successfully:', data.user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUserEmail', data.user.email);
        localStorage.setItem('userType', formData.userType);
      }

      setTimeout(() => {
        setIsLoading(false);
        if (formData.userType === 'parent') {
          router.push('/profile/edit/parent');
        } else {
          router.push('/profile/edit/nanny');
        }
      }, 500);
    } catch (error) {
      console.error('Error registering user:', error);
      setIsLoading(false);
      setErrors({ email: 'Ошибка при регистрации. Попробуйте позже.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col">
      {/* Header */}
      <BackButton href="/" />

      {/* Form Container */}
      <div className="flex-1 px-6 py-8 overflow-y-auto hide-scrollbar">
        <div className="max-w-md mx-auto pb-8">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white">Регистрация</h1>
            <p className="text-white/70 text-lg">
              Присоединяйтесь к сообществу
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Я хочу зарегистрироваться как:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, userType: 'parent' }))}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    formData.userType === 'parent'
                      ? 'bg-white border-white text-purple-600 shadow-xl scale-105'
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  <UserGroupIcon className={`w-12 h-12 mx-auto mb-2 ${formData.userType === 'parent' ? 'text-purple-600' : 'text-white'}`} />
                  <div className="font-bold text-lg">Родитель</div>
                  <div className="text-xs mt-1 opacity-80">
                    Знакомства и поиск нянь
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, userType: 'nanny' }))}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    formData.userType === 'nanny'
                      ? 'bg-white border-white text-purple-600 shadow-xl scale-105'
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  <HeartIcon className={`w-12 h-12 mx-auto mb-2 ${formData.userType === 'nanny' ? 'text-purple-600' : 'text-white'}`} />
                  <div className="font-bold text-lg">Няня</div>
                  <div className="text-xs mt-1 opacity-80">
                    Предложение услуг
                  </div>
                </button>
              </div>
              {errors.userType && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.userType}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white/90 text-sm font-medium mb-2">
                Полное имя
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Иван Иванов"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="ivan@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-white/90 text-sm font-medium mb-2">
                Телефон
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="+7 (900) 000 00 00"
                  maxLength={18}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-white/90 text-sm font-medium mb-2">
                Город
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-10 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Выберите город</option>
                  {RUSSIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.location && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Birth Date Field */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Дата рождения <span className="text-white/50">(необязательно)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Day */}
                <div className="relative">
                  <select
                    value={birthDay}
                    onChange={(e) => handleBirthDateChange('day', e.target.value)}
                    className="w-full px-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">День</option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Month */}
                <div className="relative">
                  <select
                    value={birthMonth}
                    onChange={(e) => handleBirthDateChange('month', e.target.value)}
                    className="w-full px-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">Месяц</option>
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Year */}
                <div className="relative">
                  <select
                    value={birthYear}
                    onChange={(e) => handleBirthDateChange('year', e.target.value)}
                    className="w-full px-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">Год</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload Field */}
            <div>
              <label htmlFor="photo" className="block text-white/90 text-sm font-medium mb-2">
                Фото профиля <span className="text-white/50">(необязательно)</span>
              </label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label
                  htmlFor="photo"
                  className="flex-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent hover:border-white hover:bg-white transition-all"
                >
                  <div className="px-4 py-4 text-center flex items-center justify-center gap-2">
                    <CameraIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600 font-medium">
                      {photoPreview ? 'Изменить фото' : 'Выбрать фото'}
                    </span>
                  </div>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.photo && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.photo}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                Пароль
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Минимум 6 символов"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white/90 text-sm font-medium mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Повторите пароль"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 bg-white/90 rounded-lg border-2 border-white/50 peer-checked:bg-white peer-checked:border-white transition-all" />
                  <CheckCircleIcon className="absolute inset-0 w-6 h-6 text-purple-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-white/80 leading-relaxed group-hover:text-white transition-colors">
                  Я принимаю{' '}
                  <Link href="/terms" className="underline font-semibold">
                    условия использования
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="underline font-semibold">
                    политику конфиденциальности
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRequestingLocation ? (
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
                  Запрос геолокации...
                </span>
              ) : isLoading ? (
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
                  Регистрация...
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-white/70">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-bold text-white hover:underline transition-all">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Safe Area Bottom Padding */}
      <div className="safe-area-bottom" />
    </div>
  );
}
