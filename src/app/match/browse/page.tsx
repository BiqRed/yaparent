'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  FunnelIcon,
  NoSymbolIcon 
} from '@heroicons/react/24/solid';

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
  userType?: 'parent' | 'nanny';
}

// Profiles will be loaded from the database
const allProfiles: Profile[] = [];

export default function BrowseProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [blockedProfiles, setBlockedProfiles] = useState<number[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [hideBlocked, setHideBlocked] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'parent' | 'nanny'>('all');

  useEffect(() => {
    // Загружаем данные из localStorage
    const storedBlocked = localStorage.getItem('userBlocked');
    const storedLikes = localStorage.getItem('userLikes');
    
    if (storedBlocked) {
      setBlockedProfiles(JSON.parse(storedBlocked));
    }
    
    if (storedLikes) {
      setLikedProfiles(JSON.parse(storedLikes));
    }
    
    // Фильтруем профили
    updateProfiles(JSON.parse(storedBlocked || '[]'), hideBlocked, userTypeFilter);
  }, []);

  // Пересчитываем профили при изменении фильтра типа пользователя
  useEffect(() => {
    updateProfiles(blockedProfiles, hideBlocked, userTypeFilter);
  }, [userTypeFilter]);

  const updateProfiles = (blocked: number[], hide: boolean, typeFilter: 'all' | 'parent' | 'nanny') => {
    let filtered = allProfiles;
    
    // Фильтр по типу пользователя
    if (typeFilter !== 'all') {
      filtered = filtered.filter(profile => profile.userType === typeFilter);
    }
    
    // Фильтр по заблокированным
    if (hide) {
      filtered = filtered.filter(profile => !blocked.includes(profile.id));
    }
    
    setProfiles(filtered);
  };

  const handleToggleFilter = () => {
    const newHideBlocked = !hideBlocked;
    setHideBlocked(newHideBlocked);
    updateProfiles(blockedProfiles, newHideBlocked, userTypeFilter);
  };

  const handleLike = (profileId: number) => {
    const newLikes = [...likedProfiles, profileId];
    setLikedProfiles(newLikes);
    localStorage.setItem('userLikes', JSON.stringify(newLikes));
  };

  const handleUnlike = (profileId: number) => {
    const newLikes = likedProfiles.filter(id => id !== profileId);
    setLikedProfiles(newLikes);
    localStorage.setItem('userLikes', JSON.stringify(newLikes));
  };

  const handleBlock = (profileId: number) => {
    const newBlocked = [...blockedProfiles, profileId];
    setBlockedProfiles(newBlocked);
    localStorage.setItem('userBlocked', JSON.stringify(newBlocked));
    
    if (hideBlocked) {
      setProfiles(profiles.filter(p => p.id !== profileId));
    }
  };

  const handleUnblock = (profileId: number) => {
    const newBlocked = blockedProfiles.filter(id => id !== profileId);
    setBlockedProfiles(newBlocked);
    localStorage.setItem('userBlocked', JSON.stringify(newBlocked));
  };

  const handleChat = async (profile: Profile) => {
    try {
      // Создаем или находим чат с этим пользователем через API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: profile.email }),
      });

      const data = await response.json();

      if (response.ok && data.matchId) {
        // Переходим в чат
        router.push(`/chats/${data.matchId}`);
      } else {
        // Если пользователя нет в БД, показываем сообщение
        alert('Не удалось создать чат. Пользователь не найден в системе.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  const isLiked = (profileId: number) => likedProfiles.includes(profileId);
  const isBlocked = (profileId: number) => blockedProfiles.includes(profileId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Все профили</h1>
              <p className="text-sm text-gray-500">{profiles.length} пользователей</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <FunnelIcon className="w-6 h-6 text-gray-600" />
            {!hideBlocked && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B30] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            {/* User Type Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Тип пользователя:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserTypeFilter('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userTypeFilter === 'all'
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FF3B30]'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setUserTypeFilter('parent')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userTypeFilter === 'parent'
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FF3B30]'
                  }`}
                >
                  👨‍👩‍👧‍👦 Родители
                </button>
                <button
                  onClick={() => setUserTypeFilter('nanny')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userTypeFilter === 'nanny'
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FF3B30]'
                  }`}
                >
                  👶 Няни
                </button>
              </div>
            </div>
            
            {/* Blocked Users Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <NoSymbolIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Скрыть заблокированных
                </span>
              </div>
              <button
                onClick={handleToggleFilter}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hideBlocked ? 'bg-[#FF3B30]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hideBlocked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {!hideBlocked && blockedProfiles.length > 0 && (
              <p className="text-xs text-gray-500">
                Заблокированные профили помечены
              </p>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {profiles.map((profile) => {
            const liked = isLiked(profile.id);
            const blocked = isBlocked(profile.id);
            
            return (
              <div 
                key={profile.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                  blocked ? 'opacity-60 border-2 border-red-200' : ''
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div 
                      onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
                      className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl relative cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {profile.photo}
                      {blocked && (
                        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                          <NoSymbolIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
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
                          {blocked && (
                            <span className="ml-2 text-xs font-normal text-red-500">
                              (заблокирован)
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{profile.location}</p>
                        <p className="text-sm text-gray-500">📍 {profile.distance} км</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {profile.userType === 'nanny' && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          👶 Няня
                        </span>
                      )}
                      {profile.kids.map((kid, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                          {kid.gender === 'girl' ? '👧' : '👦'} {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {profile.bio}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {!blocked ? (
                        <>
                          <button
                            onClick={() => liked ? handleUnlike(profile.id) : handleLike(profile.id)}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              liked 
                                ? 'bg-[#FF3B30] text-white hover:bg-[#E03329]' 
                                : 'border-2 border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white'
                            }`}
                          >
                            <HeartIcon className="w-4 h-4" />
                            {liked ? 'В избранном' : 'Добавить'}
                          </button>
                          <button
                            onClick={() => handleChat(profile)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-[#FF3B30] hover:bg-pink-50 transition-colors"
                            title="Написать"
                          >
                            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleBlock(profile.id)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                            title="Заблокировать"
                          >
                            <NoSymbolIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUnblock(profile.id)}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          Разблокировать
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <NoSymbolIcon className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Нет профилей</h2>
            <p className="text-gray-400 text-center">
              Все пользователи заблокированы
            </p>
            <button
              onClick={handleToggleFilter}
              className="mt-4 text-[#FF3B30] font-medium"
            >
              Показать заблокированных
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

