'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      const userType = localStorage.getItem('userType');
      
      console.log('Home page - checking auth:', { currentUserEmail, userType });
      
      if (currentUserEmail && userType) {
        console.log('Redirecting to profile');
        router.push('/profile');
      } else if (currentUserEmail && !userType) {
        console.log('User has email but no type, fetching from API');
        fetch(`/api/users/current?email=${encodeURIComponent(currentUserEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.userType) {
              localStorage.setItem('userType', data.user.userType);
              router.push('/profile');
            } else {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center gap-12 text-center max-w-lg w-full">
          {/* Logo/Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <UserGroupIcon className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight text-white">
              Ya Родители
            </h1>
            <p className="text-xl text-white/80 font-light leading-relaxed">
              Сообщество для родителей.<br />
              Знакомства, общение, взаимопомощь.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-4 mt-8">
            <Link
              href="/register"
              className="block w-full py-5 px-8 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95"
            >
              Начать
            </Link>

            <Link
              href="/login"
              className="block w-full py-5 px-8 bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-200 active:scale-95"
            >
              Войти
            </Link>
          </div>

          {/* Footer Text */}
          <p className="text-sm text-white/50 mt-8 font-light">
            Безопасное пространство для родителей
          </p>
        </div>
      </main>
    </div>
  );
}
