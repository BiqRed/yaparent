'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // В реальном приложении здесь будет проверка типа пользователя из контекста/состояния
    // Для демо используем localStorage или временное значение
    const userType = typeof window !== 'undefined' 
      ? localStorage.getItem('userType') || 'parent'
      : 'parent';

    if (userType === 'nanny') {
      router.replace('/profile/edit/nanny');
    } else {
      router.replace('/profile/edit/parent');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}

