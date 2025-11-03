'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  NoSymbolIcon,
  LockOpenIcon,
  XMarkIcon,
  UserGroupIcon,
  UsersIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartOutlineIcon,
  NoSymbolIcon as NoSymbolOutlineIcon,
  UserGroupIcon as UserGroupOutlineIcon,
  UsersIcon as UsersOutlineIcon
} from '@heroicons/react/24/outline';
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
  latitude?: number;
  longitude?: number;
}

type TabType = 'friends' | 'favorites' | 'blocked' | 'all';

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

export default function ConnectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'friends');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [blocked, setBlocked] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [hideBlocked, setHideBlocked] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set tab from URL parameter
    if (tabParam && ['friends', 'favorites', 'blocked', 'all'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
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
      
      // Convert to Profile format
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
          latitude: u.latitude,
          longitude: u.longitude,
        };
      });

      // Load user reactions from database
      const reactionsResponse = await fetch(`/api/users/reactions?email=${encodeURIComponent(email)}`);
      let likedEmails: string[] = [];
      let blockedEmails: string[] = [];
      
      if (reactionsResponse.ok) {
        const reactionsData = await reactionsResponse.json();
        likedEmails = reactionsData.likes || [];
        blockedEmails = reactionsData.blocks || [];
      }

      // Set favorites
      const favoritesProfiles = convertedProfiles.filter(p => likedEmails.includes(p.email));
      setFavorites(favoritesProfiles);

      // Set blocked
      const blockedProfiles = convertedProfiles.filter(p => blockedEmails.includes(p.email));
      setBlocked(blockedProfiles);

      // Set all users (filtered by hideBlocked)
      const allUsersFiltered = hideBlocked 
        ? convertedProfiles.filter(p => !blockedEmails.includes(p.email))
        : convertedProfiles;
      setAllUsers(allUsersFiltered);

      // Set friends (from user's friends list)
      const friendEmails = currentUserData.user.friends || [];
      const friendProfiles = convertedProfiles.filter(p => friendEmails.includes(p.email));
      setFriends(friendProfiles);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading connections:', error);
      setIsLoading(false);
    }
  };

  const handleToggleFilter = () => {
    setHideBlocked(!hideBlocked);
    loadConnections();
  };

  const handleLikeToggle = async (profileEmail: string) => {
    try {
      const isLiked = favorites.some(f => f.email === profileEmail);
      
      if (isLiked) {
        // Unlike
        await fetch(`/api/users/reactions?fromEmail=${encodeURIComponent(currentUserEmail)}&toEmail=${encodeURIComponent(profileEmail)}`, {
          method: 'DELETE',
        });
      } else {
        // Like
        await fetch('/api/users/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromEmail: currentUserEmail,
            toEmail: profileEmail,
            type: 'like',
          }),
        });
      }
      
      await loadConnections();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBlock = async (profileEmail: string) => {
    try {
      await fetch('/api/users/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: currentUserEmail,
          toEmail: profileEmail,
          type: 'block',
        }),
      });
      
      await loadConnections();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblock = async (profileEmail: string) => {
    try {
      await fetch(`/api/users/reactions?fromEmail=${encodeURIComponent(currentUserEmail)}&toEmail=${encodeURIComponent(profileEmail)}`, {
        method: 'DELETE',
      });
      
      await loadConnections();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleRemoveFriend = async (profile: Profile) => {
    try {
      // Update user's friends list in database
      const updatedFriends = currentUserData.friends.filter((email: string) => email !== profile.email);
      
      await fetch(`/api/users/${currentUserData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friends: updatedFriends,
        }),
      });
      
      await loadConnections();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleChat = async (profile: Profile) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: profile.email,
          currentUserEmail: currentUserEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.matchId) {
        console.log('Chat created successfully, matchId:', data.matchId);
        
        // Add user to friends if not already there
        if (!currentUserData.friends.includes(profile.email)) {
          const updatedFriends = [...currentUserData.friends, profile.email];
          
          await fetch(`/api/users/${currentUserData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              friends: updatedFriends,
            }),
          });
        }
        
        await loadConnections();
        
        // Small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('Navigating to chat:', `/chats/${data.matchId}`);
        router.push(`/chats/${data.matchId}`);
      } else {
        console.error('Failed to create chat:', data);
        alert('Не удалось создать чат. Пользователь не найден в системе.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  const tabs = [
    { id: 'friends' as TabType, name: 'Друзья', icon: UserGroupIcon, count: friends.length },
    { id: 'favorites' as TabType, name: 'Избранное', icon: HeartIcon, count: favorites.length },
    { id: 'blocked' as TabType, name: 'Заблок.', icon: NoSymbolIcon, count: blocked.length },
    { id: 'all' as TabType, name: 'Все', icon: UsersIcon, count: allUsers.length },
  ];

  const renderProfileCard = (profile: Profile, type: 'friend' | 'favorite' | 'blocked' | 'all') => {
    const isLiked = favorites.some(f => f.email === profile.email);
    const isBlocked = blocked.some(b => b.email === profile.email);

    return (
      <div 
        key={profile.id}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
          isBlocked && type === 'all' ? 'opacity-60 border-2 border-red-200' : ''
        }`}
      >
        <div className="flex gap-4 p-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div
              onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
              className={`w-24 h-24 rounded-xl ${isBlocked && type === 'blocked' ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 'bg-gradient-to-br from-purple-400 to-pink-400'} flex items-center justify-center text-5xl relative cursor-pointer hover:opacity-80 transition-opacity overflow-hidden`}
            >
              {profile.photo.startsWith('data:') || profile.photo.startsWith('http') ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-5xl">{profile.photo}</div>
              )}
              {isBlocked && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
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
                  {isBlocked && type === 'all' && (
                    <span className="ml-2 text-xs font-normal text-red-500">
                      (заблокирован)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{profile.location}</p>
                <p className="text-sm text-gray-500">📍 {profile.distance > 0 ? `${profile.distance} км` : 'Рядом'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              {profile.kids.map((kid, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${type === 'blocked' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>
                  {kid.gender === 'girl' ? '👧' : '👦'} {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                </span>
              ))}
            </div>

            <p className={`text-sm line-clamp-2 mb-3 ${type === 'blocked' ? 'text-gray-500' : 'text-gray-600'}`}>
              {profile.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {type === 'friend' && (
                <>
                  <button
                    onClick={() => handleChat(profile)}
                    className="flex-1 bg-[#FF3B30] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E03329] transition-colors flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    Написать
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(profile)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    title="Убрать из друзей"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </>
              )}
              
              {type === 'favorite' && (
                <>
                  <button
                    onClick={() => handleChat(profile)}
                    className="flex-1 bg-[#FF3B30] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E03329] transition-colors flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    Написать
                  </button>
                  <button
                    onClick={() => handleLikeToggle(profile.email)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    title="Убрать из избранного"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </>
              )}
              
              {type === 'blocked' && (
                <button
                  onClick={() => handleUnblock(profile.email)}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LockOpenIcon className="w-4 h-4" />
                  Разблокировать
                </button>
              )}
              
              {type === 'all' && !isBlocked && (
                <>
                  <button
                    onClick={() => handleLikeToggle(profile.email)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isLiked 
                        ? 'bg-[#FF3B30] text-white hover:bg-[#E03329]' 
                        : 'border-2 border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white'
                    }`}
                  >
                    <HeartIcon className="w-4 h-4" />
                    {isLiked ? 'В избранном' : 'Добавить'}
                  </button>
                  <button
                    onClick={() => handleChat(profile)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-[#FF3B30] hover:bg-pink-50 transition-colors"
                    title="Написать"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleBlock(profile.email)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    title="Заблокировать"
                  >
                    <NoSymbolIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </>
              )}
              
              {type === 'all' && isBlocked && (
                <button
                  onClick={() => handleUnblock(profile.email)}
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
  };

  const getEmptyState = () => {
    switch (activeTab) {
      case 'friends':
        return {
          icon: <UserGroupOutlineIcon className="w-20 h-20 text-gray-300 mb-4" />,
          title: 'Нет друзей',
          description: 'Добавляйте пользователей в друзья через их профиль или создавайте с ними чаты'
        };
      case 'favorites':
        return {
          icon: <HeartOutlineIcon className="w-20 h-20 text-gray-300 mb-4" />,
          title: 'Нет избранных',
          description: 'Понравившиеся профили появятся здесь'
        };
      case 'blocked':
        return {
          icon: <NoSymbolOutlineIcon className="w-20 h-20 text-gray-300 mb-4" />,
          title: 'Нет заблокированных',
          description: 'Заблокированные профили появятся здесь'
        };
      case 'all':
        return {
          icon: <UsersOutlineIcon className="w-20 h-20 text-gray-300 mb-4" />,
          title: 'Нет профилей',
          description: 'Все пользователи заблокированы'
        };
    }
  };

  const getCurrentList = () => {
    switch (activeTab) {
      case 'friends':
        return friends;
      case 'favorites':
        return favorites;
      case 'blocked':
        return blocked;
      case 'all':
        return allUsers;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Мои связи</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const currentList = getCurrentList();
  const emptyState = getEmptyState();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Мои связи</h1>
            <p className="text-sm text-gray-500">
              {activeTab === 'friends' && `${friends.length} друзей`}
              {activeTab === 'favorites' && `${favorites.length} избранных`}
              {activeTab === 'blocked' && `${blocked.length} заблокированных`}
              {activeTab === 'all' && `${allUsers.length} пользователей`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'all' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <FunnelIcon className="w-5 h-5 text-gray-600" />
                {!hideBlocked && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B30] rounded-full"></span>
                )}
              </button>
            )}
            <UserGroupIcon className="w-6 h-6 text-[#FF3B30]" />
          </div>
        </div>

        {/* Filters for All Users Tab */}
        {activeTab === 'all' && showFilters && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
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
            {!hideBlocked && blocked.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Заблокированные профили помечены
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF3B30] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            {emptyState.icon}
            <h2 className="text-xl font-semibold text-gray-400 mb-2">{emptyState.title}</h2>
            <p className="text-gray-400 text-center">{emptyState.description}</p>
            {activeTab === 'all' && hideBlocked && blocked.length > 0 && (
              <button
                onClick={handleToggleFilter}
                className="mt-4 text-[#FF3B30] font-medium"
              >
                Показать заблокированных
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((profile) => {
              const cardType = activeTab === 'friends' ? 'friend' : activeTab === 'favorites' ? 'favorite' : activeTab;
              return renderProfileCard(profile, cardType as 'friend' | 'favorite' | 'blocked' | 'all');
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
