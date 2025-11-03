'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      const userType = localStorage.getItem('userType');
      
      console.log('Home page - checking auth:', { currentUserEmail, userType });
      
      if (currentUserEmail && userType) {
        // User is logged in with complete data, redirect to profile
        console.log('Redirecting to profile');
        router.push('/profile');
      } else if (currentUserEmail && !userType) {
        // User has email but no type - let's try to get it from API
        console.log('User has email but no type, fetching from API');
        fetch(`/api/users/current?email=${encodeURIComponent(currentUserEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.userType) {
              localStorage.setItem('userType', data.user.userType);
              router.push('/profile');
            } else {
              // Invalid user, clear localStorage
              localStorage.removeItem('currentUserEmail');
              localStorage.removeItem('userType');
            }
          })
          .catch(err => {
            console.error('Error fetching user:', err);
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('userType');
          });
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#FF3B30] to-[#FF9500]">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-white">
        <div className="flex flex-col items-center gap-8 text-center max-w-md">
          <div className="flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Ya Родители
            </h1>
            <p className="text-xl text-white/90">
              Знакомства для родителей
            </p>
          </div>

          <div className="space-y-3 w-full mt-8">
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-semibold">Smart Match</p>
                <p className="text-sm text-white/80">Умный подбор семей</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">👶</div>
              <div>
                <p className="font-semibold">Групповая няня</p>
                <p className="text-sm text-white/80">Совместное бронирование</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">🗺️</div>
              <div>
                <p className="font-semibold">Live-карта</p>
                <p className="text-sm text-white/80">Родители и няни рядом</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">📅</div>
              <div>
                <p className="font-semibold">Умная афиша</p>
                <p className="text-sm text-white/80">События для детей</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">📋</div>
              <div>
                <p className="font-semibold">Доска объявлений</p>
                <p className="text-sm text-white/80">Предложения и запросы</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3 mt-8">
            <Link
              href="/register"
              className="block w-full py-4 px-8 bg-white text-[#FF3B30] rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95 text-center"
            >
              Регистрация
            </Link>

            <Link
              href="/login"
              className="block w-full py-4 px-8 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all active:scale-95 text-center"
            >
              Войти
            </Link>
          </div>

          <p className="text-sm text-white/70 mt-6">
            🎤 Управление через Алису
          </p>
        </div>
      </main>
    </div>
  );
}
