'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { XMarkIcon, HeartIcon, ArrowRightIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [matches, setMatches] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [blockedProfiles, setBlockedProfiles] = useState<string[]>([]);
  const [skippedProfiles, setSkippedProfiles] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [currentUserCity, setCurrentUserCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLikeNotification, setShowLikeNotification] = useState(false);
  const [likedProfile, setLikedProfile] = useState<Profile | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
      
      // Get current user's city (extract city from location)
      const userCity = currentUserData.user.location?.split(',')[0]?.trim() || '';
      setCurrentUserCity(userCity);
      
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
      
      // Sort profiles: same city first, then by distance
      const sortedProfiles = convertedProfiles.sort((a, b) => {
        const aCityMatch = a.location?.split(',')[0]?.trim().toLowerCase() === userCity.toLowerCase();
        const bCityMatch = b.location?.split(',')[0]?.trim().toLowerCase() === userCity.toLowerCase();
        
        // If both from same city or both not, sort by distance
        if (aCityMatch === bCityMatch) {
          return a.distance - b.distance;
        }
        
        // Otherwise, prioritize same city
        return aCityMatch ? -1 : 1;
      });
      
      setProfiles(sortedProfiles);

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
    if (!currentProfile || isAnimating) return;
    
    setIsAnimating(true);
    setSwipeDirection(direction);

    // Save current profile email and data before any state changes
    const profileToProcess = currentProfile.email;
    const profileData = currentProfile;
    const currentIdx = currentIndex;

    // Start animation first, then process in background
    setTimeout(async () => {
      try {
        if (direction === 'right') {
          // Like - save to database
          await fetch('/api/users/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromEmail: currentUserEmail,
              toEmail: profileToProcess,
              type: 'like',
            }),
          });

          const newLikes = [...likedProfiles, profileToProcess];
          setLikedProfiles(newLikes);
          setMatches(newLikes.length);
          
          // Remove from skipped if present
          if (skippedProfiles.includes(profileToProcess)) {
            const newSkipped = skippedProfiles.filter(id => id !== profileToProcess);
            setSkippedProfiles(newSkipped);
            localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
          }

          // Show notification and confetti after like
          setLikedProfile(profileData);
          setShowConfetti(true);
          setTimeout(() => {
            setShowLikeNotification(true);
          }, 100);
          
          // Hide confetti after animation
          setTimeout(() => {
            setShowConfetti(false);
          }, 2000);
        } else {
          // Block - save to database
          await fetch('/api/users/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromEmail: currentUserEmail,
              toEmail: profileToProcess,
              type: 'block',
            }),
          });

          const newBlocked = [...blockedProfiles, profileToProcess];
          setBlockedProfiles(newBlocked);
          
          // Remove from skipped if present
          if (skippedProfiles.includes(profileToProcess)) {
            const newSkipped = skippedProfiles.filter(id => id !== profileToProcess);
            setSkippedProfiles(newSkipped);
            localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
          }
        }
      } catch (error) {
        console.error('Error saving reaction:', error);
      }

      // After animation completes, update index
      setSwipeDirection(null);
      if (currentIdx < profilesToShow.length - 1) {
        setCurrentIndex(currentIdx + 1);
      } else {
        setCurrentIndex(0);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    if (!currentProfile || isAnimating) return;
    
    setIsAnimating(true);
    setSwipeDirection('skip');
    
    // Save current profile email and index before any state changes
    const profileToSkip = currentProfile.email;
    const currentIdx = currentIndex;
    
    // Start animation first, then process in background
    setTimeout(() => {
      // Add to skipped (localStorage only - temporary)
      if (!skippedProfiles.includes(profileToSkip)) {
        const newSkipped = [...skippedProfiles, profileToSkip];
        setSkippedProfiles(newSkipped);
        localStorage.setItem('userSkipped', JSON.stringify(newSkipped));
      }

      // After animation completes, update index
      setSwipeDirection(null);
      if (currentIdx < profilesToShow.length - 1) {
        setCurrentIndex(currentIdx + 1);
      } else {
        setCurrentIndex(0);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleSendMessage = async () => {
    if (!likedProfile || !currentUserEmail) return;
    
    try {
      setShowLikeNotification(false);
      
      // Create or get existing chat
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: likedProfile.email,
          currentUserEmail: currentUserEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.matchId) {
        // Wait a bit to ensure the match is created
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Navigate to the specific chat
        router.push(`/chats/${data.matchId}`);
      } else {
        console.error('Failed to create chat:', data);
        alert('Не удалось создать чат');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  const handleCloseLikeNotification = () => {
    setShowLikeNotification(false);
    setTimeout(() => {
      setLikedProfile(null);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
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

  // Check if current profile is from the same city
  const profileCity = currentProfile.location?.split(',')[0]?.trim() || '';
  const isSameCity = profileCity.toLowerCase() === currentUserCity.toLowerCase();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content - Profile Card + Buttons */}
      <main className="flex-1 flex flex-col px-4 pt-6 pb-3 min-h-0 overflow-hidden">
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
                {isSameCity && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    📍 {currentProfile.distance > 0 ? `${currentProfile.distance} км` : 'Рядом'}
                  </div>
                )}
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

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55'][Math.floor(Math.random() * 7)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Backdrop for closing notification */}
      {showLikeNotification && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseLikeNotification}
        />
      )}

      {/* Like Notification - Minimal & Slides from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          showLikeNotification ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {likedProfile && (
          <div
            className="bg-white/95 backdrop-blur-xl shadow-2xl p-5 mx-4 mb-20 rounded-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact content */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">Добавлено в избранное!</p>
                <p className="text-xs text-gray-600 truncate">{likedProfile.name}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Написать
              </button>
              <button
                onClick={handleCloseLikeNotification}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confetti Animation Styles */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>

      <BottomNav />
    </div>
  );
}
