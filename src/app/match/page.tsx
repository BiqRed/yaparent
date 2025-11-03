'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { XMarkIcon, HeartIcon, ArrowRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { calculateDistance } from '@/lib/geolocation';

interface Profile {
  id: string;
  name: string;
  age: number;
  email: string;
  kids: Array<{ age: number; gender: string; name?: string }>;
  interests: string[];
  bio: string;
  distance: number;
  photo: string;
  location: string;
  userType?: 'parent' | 'nanny';
  latitude?: number;
  longitude?: number;
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

export default function MatchPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'skip' | null>(null);
  const [matches, setMatches] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [blockedProfiles, setBlockedProfiles] = useState<string[]>([]);
  const [skippedProfiles, setSkippedProfiles] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Фильтруем профили: исключаем лайкнутых и заблокированных
  const availableProfiles = useMemo(() => {
    const reviewedIds = [...likedProfiles, ...blockedProfiles];
    return profiles.filter(profile => !reviewedIds.includes(profile.email));
  }, [profiles, likedProfiles, blockedProfiles]);

  // Профили для показа: сначала не пропущенные, потом пропущенные
  const { profilesToShow, showingSkipped } = useMemo(() => {
    const notSkipped = availableProfiles.filter(p => !skippedProfiles.includes(p.email));
    const skipped = availableProfiles.filter(p => skippedProfiles.includes(p.email));
    
    if (notSkipped.length > 0) {
      return { profilesToShow: notSkipped, showingSkipped: false };
    } else if (skipped.length > 0) {
      return { profilesToShow: skipped, showingSkipped: true };
    }
    return { profilesToShow: [], showingSkipped: false };
  }, [availableProfiles, skippedProfiles]);

  const currentProfile = profilesToShow[currentIndex];

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (typeof window === 'undefined') return;

    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      router.push('/login');
      return;
    }

    setCurrentUserEmail(email);

    try {
      // Load current user data
      const currentUserResponse = await fetch(`/api/users/current?email=${encodeURIComponent(email)}`);
      if (!currentUserResponse.ok) {
        router.push('/login');
        return;
      }
      const currentUserData = await currentUserResponse.json();
      setCurrentUserData(currentUserData.user);

      // Load all users
      const usersResponse = await fetch(`/api/users?currentUserEmail=${encodeURIComponent(email)}`);
      if (!usersResponse.ok) {
        console.error('Failed to load users');
        setIsLoading(false);
        return;
      }

      const usersData = await usersResponse.json();
      
      // Convert to Profile format and calculate distances
      const convertedProfiles: Profile[] = usersData.users.map((u: any) => {
        let distance: number;
        if (currentUserData.user.latitude && currentUserData.user.longitude && u.latitude && u.longitude) {
          distance = calculateDistance(
            currentUserData.user.latitude,
            currentUserData.user.longitude,
            u.latitude,
            u.longitude
          );
        } else {
          distance = 0;
        }

        return {
          id: u.email,
          name: u.name,
          age: calculateAge(u.birthDate),
          email: u.email,
          kids: u.kids || [],
          interests: u.interests || [],
          bio: u.bio || 'Привет! Я ищу новых друзей среди родителей.',
          distance,
          photo: u.photoUrl || u.avatar || (u.userType === 'parent' ? '👨‍👩‍👧‍👦' : '👶'),
          location: u.location,
          userType: u.userType,
          latitude: u.latitude,
          longitude: u.longitude,
        };
      });
      
      setProfiles(convertedProfiles);

      // Load user reactions from database
      const reactionsResponse = await fetch(`/api/users/reactions?email=${encodeURIComponent(email)}`);
      if (reactionsResponse.ok) {
        const reactionsData = await reactionsResponse.json();
        setLikedProfiles(reactionsData.likes || []);
        setBlockedProfiles(reactionsData.blocks || []);
        setMatches(reactionsData.likes?.length || 0);
      }

      // Load skipped from localStorage (temporary storage)
      const storedSkipped = localStorage.getItem('userSkipped');
      if (storedSkipped) {
        setSkippedProfiles(JSON.parse(storedSkipped));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Сброс индекса при изменении списка профилей
  useEffect(() => {
    if (currentIndex >= profilesToShow.length) {
      setCurrentIndex(0);
    }
  }, [profilesToShow.length, currentIndex]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentProfile) return;
    
    setSwipeDirection(direction);

    try {
      if (direction === 'right') {
        // Like - save to database
        await fetch('/api/users/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromEmail: currentUserEmail,
            toEmail: currentProfile.email,
            type: 'like',
          }),
        });

        const newLikes = [...likedProfiles, currentProfile.email];
        setLikedProfiles(newLikes);
        setMatches(newLikes.length);
        
        // Remove from skipped if present
        if (skippedProfiles.includes(currentProfile.email)) {
          const newSkipped = skippedProfiles.filter(id => id !== currentProfile.email);
          setSkippedProfiles(newSkipped);
          localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
        }
      } else {
        // Block - save to database
        await fetch('/api/users/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromEmail: currentUserEmail,
            toEmail: currentProfile.email,
            type: 'block',
          }),
        });

        const newBlocked = [...blockedProfiles, currentProfile.email];
        setBlockedProfiles(newBlocked);
        
        // Remove from skipped if present
        if (skippedProfiles.includes(currentProfile.email)) {
          const newSkipped = skippedProfiles.filter(id => id !== currentProfile.email);
          setSkippedProfiles(newSkipped);
          localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
        }
      }
    } catch (error) {
      console.error('Error saving reaction:', error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < profilesToShow.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    
    setSwipeDirection('skip');
    
    // Add to skipped (localStorage only - temporary)
    if (!skippedProfiles.includes(currentProfile.email)) {
      const newSkipped = [...skippedProfiles, currentProfile.email];
      setSkippedProfiles(newSkipped);
      localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < profilesToShow.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Smart Match</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка профилей...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Если нет доступных профилей
  if (profilesToShow.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Smart Match</h1>
        </header>

        <main className="flex-1 flex flex-col justify-center items-center p-6">
          <div className="text-center space-y-5 max-w-sm w-full">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">Вы просмотрели всех!</h2>
            <p className="text-gray-600">
              Вы просмотрели все доступные профили. Новые пользователи появятся здесь позже.
            </p>
            <div className="space-y-3 pt-4">
              <button
                onClick={() => router.push('/connections?tab=favorites')}
                className="block w-full bg-[#FF3B30] text-white px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-[#E03329] transition-all active:scale-95 shadow-lg"
              >
                Посмотреть избранных ({matches})
              </button>
              <button
                onClick={() => router.push('/connections?tab=all')}
                className="block w-full border-2 border-[#FF3B30] text-[#FF3B30] px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-[#FF3B30] hover:text-white transition-all active:scale-95"
              >
                Все профили
              </button>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (!currentProfile) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Smart Match</h1>
      </header>

      {/* Main Content - Profile Card + Buttons */}
      <main className="flex-1 flex flex-col px-4 py-3 min-h-0 overflow-hidden">
        <div className="flex flex-col h-full w-full max-w-sm mx-auto">
          {/* Indicator if showing skipped */}
          {showingSkipped && (
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-center flex-shrink-0">
              <p className="text-sm text-blue-700 font-medium">
                ⏪ Показываем пропущенных ранее
              </p>
            </div>
          )}

          {/* Profile Card - Takes most space */}
          <div className="flex-1 flex flex-col min-h-0 mb-4">
            <div
              className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${
                swipeDirection === 'left' ? '-translate-x-full opacity-0' :
                swipeDirection === 'right' ? 'translate-x-full opacity-0' :
                swipeDirection === 'skip' ? 'translate-y-[-50px] opacity-0' : ''
              }`}
            >
              {/* Photo Section */}
              <div
                onClick={() => router.push(`/profile/${encodeURIComponent(currentProfile.email)}`)}
                className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              >
                {currentProfile.photo.startsWith('data:') || currentProfile.photo.startsWith('http') ? (
                  <img
                    src={currentProfile.photo}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-8xl">{currentProfile.photo}</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                  📍 {currentProfile.distance > 0 ? `${currentProfile.distance} км` : 'Рядом'}
                </div>
              </div>

              {/* Info Section - Scrollable */}
              <div className="p-5 space-y-3 flex-1 overflow-y-auto">
                <div>
                  <h2 
                    onClick={() => router.push(`/profile/${encodeURIComponent(currentProfile.email)}`)}
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                  >
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <p className="text-gray-600">{currentProfile.location}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentProfile.userType === 'nanny' && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      👶 Няня
                    </span>
                  )}
                  {currentProfile.kids.map((kid, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {kid.gender === 'girl' ? '👧' : '👦'} {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {currentProfile.bio}
                </p>

                <button
                  onClick={() => router.push(`/profile/${encodeURIComponent(currentProfile.email)}`)}
                  className="w-full py-2 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Посмотреть полный профиль
                </button>

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Интересы:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Right under the card */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-2 border-gray-200"
                title="Заблокировать"
              >
                <XMarkIcon className="w-8 h-8 text-red-500" />
              </button>

              <button
                onClick={handleSkip}
                className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-2 border-gray-200"
                title="Пропустить (вернётся позже)"
              >
                <ArrowRightIcon className="w-7 h-7 text-blue-500" />
              </button>

              <button
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 bg-[#FF3B30] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                title="Добавить в избранное"
              >
                <HeartIcon className="w-10 h-10 text-white" />
              </button>
            </div>

            {/* Counter & Browse Link */}
            <div className="text-center space-y-1">
              <div className="text-gray-500 text-sm">
                {currentIndex + 1} из {profilesToShow.length}
                {skippedProfiles.length > 0 && !showingSkipped && (
                  <span className="ml-2 text-blue-500">
                    (+{skippedProfiles.length} пропущено)
                  </span>
                )}
              </div>
              <button
                onClick={() => router.push('/connections?tab=all')}
                className="text-[#FF3B30] font-medium text-sm hover:underline"
              >
                Посмотреть все профили →
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
