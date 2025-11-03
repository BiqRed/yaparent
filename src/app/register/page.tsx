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
  CalendarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

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
  // Geolocation
  latitude?: number;
  longitude?: number;
  // Statistics
  reviews?: Review[];
  bookings?: Booking[];
  friends?: string[]; // Array of user emails
  rating?: number;
}

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (currentUserEmail) {
        // User is already logged in, redirect to profile
        router.push('/profile');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'Файл слишком большой. Максимум 5MB' }));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: 'Пожалуйста, выберите изображение' }));
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        setPhotoPreview(base64String);
        // Clear photo error if any
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

    // Request geolocation
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000, // Reduced timeout to 5 seconds
            maximumAge: 60000, // Allow cached position up to 1 minute old
            enableHighAccuracy: false, // Faster, less accurate positioning
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        setLocationGranted(true);
      } catch (error) {
        console.log('Geolocation denied or unavailable:', error);
        setLocationGranted(false);
        // Continue without geolocation - this is optional
      }
    } else {
      setLocationGranted(false);
    }

    setIsRequestingLocation(false);

    // Сохраняем пользователя в базу данных
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

      // Сохраняем только ID текущего пользователя в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUserEmail', data.user.email);
        localStorage.setItem('userType', formData.userType);
      }

      // Redirect based on user type
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
    <div className="min-h-screen bg-gradient-to-br from-[#FF3B30] to-[#FF9500] flex flex-col">
      {/* Header */}
      <div className="safe-area-top p-6 text-white">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Назад
          </Link>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6" />
            <span className="font-bold text-lg">Ya Родители</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6 py-8 overflow-y-auto hide-scrollbar">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="text-center mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Регистрация</h1>
            <p className="text-white/90">
              Присоединяйтесь к сообществу
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-3">
                Я хочу зарегистрироваться как:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, userType: 'parent' }))}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    formData.userType === 'parent'
                      ? 'bg-white border-white text-[#FF3B30] shadow-lg'
                      : 'bg-white/20 border-white/50 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="font-bold text-lg">Родитель</div>
                  <div className="text-xs mt-1 opacity-80">
                    Знакомства и поиск нянь
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, userType: 'nanny' }))}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    formData.userType === 'nanny'
                      ? 'bg-white border-white text-[#FF3B30] shadow-lg'
                      : 'bg-white/20 border-white/50 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="text-4xl mb-2">👶</div>
                  <div className="font-bold text-lg">Няня</div>
                  <div className="text-xs mt-1 opacity-80">
                    Предложение услуг
                  </div>
                </button>
              </div>
              {errors.userType && (
                <p className="mt-2 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.userType}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white/90 text-sm font-semibold mb-2">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="Иван Иванов"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/90 text-sm font-semibold mb-2">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="ivan@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-white/90 text-sm font-semibold mb-2">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="+7 (900) 000-00-00"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-white/90 text-sm font-semibold mb-2">
                Город
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="Москва"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Birth Date Field */}
            <div>
              <label htmlFor="birthDate" className="block text-white/90 text-sm font-semibold mb-2">
                Дата рождения (необязательно)
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Photo Upload Field */}
            <div>
              <label htmlFor="photo" className="block text-white/90 text-sm font-semibold mb-2">
                Фото профиля (необязательно)
              </label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label
                  htmlFor="photo"
                  className="flex-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent hover:border-white hover:bg-white transition-all"
                >
                  <div className="px-4 py-3.5 text-center">
                    <span className="text-gray-600 font-medium">
                      {photoPreview ? 'Изменить фото' : '📷 Выбрать фото'}
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
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.photo}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/90 text-sm font-semibold mb-2">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="Минимум 6 символов"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white/90 text-sm font-semibold mb-2">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                  placeholder="Повторите пароль"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
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
                  <CheckCircleIcon className="absolute inset-0 w-6 h-6 text-[#FF3B30] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-white/90 leading-relaxed group-hover:text-white transition-colors">
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
                <p className="mt-2 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-4 bg-white text-[#FF3B30] rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
          <div className="mt-6 text-center text-white/90">
            <p>
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-bold underline hover:text-white transition-colors">
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

