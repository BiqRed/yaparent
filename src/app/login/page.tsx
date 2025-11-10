'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (currentUserEmail) {
        router.push('/profile');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        if (response.status === 401) {
          setErrors({ password: data.error || 'Неверный email или пароль' });
        } else {
          setErrors({ email: data.error || 'Ошибка при входе' });
        }
        return;
      }

      console.log('Login successful:', data.user);

      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUserEmail', data.user.email);
        localStorage.setItem('userType', data.user.userType);
      }

      setIsLoading(false);

      if (data.user.userType === 'nanny') {
        router.push('/nanny');
      } else {
        router.push('/match');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
      setErrors({ email: 'Ошибка при входе. Попробуйте позже.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col">
      {/* Header */}
      <BackButton href="/" />

      {/* Form Container */}
      <div className="flex-1 px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-6">
              <HandRaisedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white">
              С возвращением
            </h1>
            <p className="text-white/70 text-lg">
              Войдите в свой аккаунт
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Введите пароль"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-white bg-red-500/80 px-4 py-2 rounded-lg">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-md border-2 border-white/50 bg-white/20 checked:bg-white checked:border-white transition-all cursor-pointer accent-purple-600"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Запомнить меня
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-white/80 hover:text-white font-medium transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-white/70">
              Нет аккаунта?{' '}
              <Link href="/register" className="font-bold text-white hover:underline transition-all">
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
