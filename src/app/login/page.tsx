'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  birthDate: string;
  userType: 'parent' | 'nanny';
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
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

    // Simulate API call - check user credentials
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Get registered users
        const registeredUsersJson = localStorage.getItem('registeredUsers');
        const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
        
        // Find user by email
        const user = registeredUsers.find((u: RegisteredUser) => u.email === formData.email);
        
        if (!user) {
          setIsLoading(false);
          setErrors({ email: 'Пользователь с таким email не найден' });
          return;
        }
        
        // Check password
        if (user.password !== formData.password) {
          setIsLoading(false);
          setErrors({ password: 'Неверный пароль' });
          return;
        }
        
        // Login successful - save user info
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userType', user.userType);
        
        // Синхронизируем пользователя с базой данных для чатов
        fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            phone: user.phone,
            photoUrl: '👤',
          }),
        }).catch((error) => {
          console.error('Error syncing user to database:', error);
        });
        
        setIsLoading(false);
        
        // Redirect based on user type
        if (user.userType === 'nanny') {
          router.push('/nanny');
        } else {
          router.push('/match');
        }
      }
    }, 1500);
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
      <div className="flex-1 px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8 text-white">
            <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mx-auto mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">С возвращением!</h1>
            <p className="text-white/90">
              Войдите в свой аккаунт
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Введите пароль"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-white bg-red-500/50 px-3 py-1 rounded-lg">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-white/50 bg-white/20 checked:bg-white checked:border-white transition-all cursor-pointer"
                />
                <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                  Запомнить меня
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-white/90 hover:text-white font-semibold transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-4 bg-white text-[#FF3B30] rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
                  Вход...
                </span>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/80 font-semibold">
                или
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button 
              disabled
              className="w-full py-3.5 bg-white/10 backdrop-blur-sm text-white/50 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 cursor-not-allowed opacity-60 relative"
            >
              <LockClosedIcon className="w-5 h-5" />
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <circle cx="12" cy="12" r="8" fill="#FC3F1D"/>
                  <path fill="#FFFFFF" d="M7 14.5h10v2H7v-2zm0-4h10v2H7v-2z"/>
                </svg>
                Войти через Яндекс ID
              </span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center text-white/90">
            <p>
              Нет аккаунта?{' '}
              <Link href="/register" className="font-bold underline hover:text-white transition-colors">
                Зарегистрироваться
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

