'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { NoSymbolIcon, ArrowLeftIcon, LockOpenIcon } from '@heroicons/react/24/solid';
import { NoSymbolIcon as NoSymbolOutlineIcon } from '@heroicons/react/24/outline';

interface Profile {
  id: number;
  name: string;
  age: number;
  email: string;
  kids: Array<{ age: number; gender: string }>;
  interests: string[];
  bio: string;
  distance: number;
  photo: string;
  location: string;
}

export default function BlockedPage() {
  const router = useRouter();
  const [blocked, setBlocked] = useState<Profile[]>([]);

  useEffect(() => {
    // Загружаем заблокированных пользователей из localStorage
    const storedBlocked = localStorage.getItem('userBlocked');
    if (storedBlocked) {
      const blockedIds = JSON.parse(storedBlocked);
      // Profiles will be loaded from the database
      const allProfiles: Profile[] = [];
      
      const blockedProfiles = allProfiles.filter(profile => blockedIds.includes(profile.id));
      setBlocked(blockedProfiles);
    }
  }, []);

  const handleUnblock = (profileId: number) => {
    const storedBlocked = localStorage.getItem('userBlocked');
    if (storedBlocked) {
      const blockedIds = JSON.parse(storedBlocked);
      const updatedBlocked = blockedIds.filter((id: number) => id !== profileId);
      localStorage.setItem('userBlocked', JSON.stringify(updatedBlocked));
      setBlocked(blocked.filter(profile => profile.id !== profileId));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Заблокированные</h1>
            <p className="text-sm text-gray-500">{blocked.length} пользователей</p>
          </div>
        </div>
        <NoSymbolIcon className="w-6 h-6 text-red-500" />
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {blocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <NoSymbolOutlineIcon className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Нет заблокированных</h2>
            <p className="text-gray-400 text-center">
              Заблокированные профили появятся здесь
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocked.map((profile) => (
              <div 
                key={profile.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow opacity-75"
              >
                <div className="flex gap-4 p-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div 
                      onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
                      className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-5xl relative cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {profile.photo}
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <NoSymbolIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 
                          onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
                          className="text-lg font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                        >
                          {profile.name}, {profile.age}
                        </h3>
                        <p className="text-sm text-gray-600">{profile.location}</p>
                        <p className="text-sm text-gray-500">📍 {profile.distance} км</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {profile.kids.map((kid, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                          {kid.gender === 'girl' ? '👧' : '👦'} {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {profile.bio}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={() => handleUnblock(profile.id)}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <LockOpenIcon className="w-4 h-4" />
                      Разблокировать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

