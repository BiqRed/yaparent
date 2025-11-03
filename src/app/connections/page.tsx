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

type TabType = 'friends' | 'favorites' | 'blocked' | 'all';

// Profiles will be loaded from the database
const allProfiles: Profile[] = [];

export default function ConnectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'friends');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [blocked, setBlocked] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [blockedProfiles, setBlockedProfiles] = useState<number[]>([]);
  const [hideBlocked, setHideBlocked] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Устанавливаем вкладку из URL параметра
    if (tabParam && ['friends', 'favorites', 'blocked', 'all'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    // Загружаем избранных
    const storedLikes = localStorage.getItem('userLikes');
    if (storedLikes) {
      const likedIds = JSON.parse(storedLikes);
      setLikedProfiles(likedIds);
      const likedProfiles = allProfiles.filter(profile => likedIds.includes(profile.id));
      setFavorites(likedProfiles);
    }

    // Загружаем заблокированных
    const storedBlocked = localStorage.getItem('userBlocked');
    if (storedBlocked) {
      const blockedIds = JSON.parse(storedBlocked);
      setBlockedProfiles(blockedIds);
      const blockedProfilesList = allProfiles.filter(profile => blockedIds.includes(profile.id));
      setBlocked(blockedProfilesList);
      
      // Обновляем список всех пользователей с учетом фильтра
      updateAllUsersProfiles(blockedIds, hideBlocked);
    } else {
      updateAllUsersProfiles([], hideBlocked);
    }

    // Друзья - это те, кто добавлен в друзья через localStorage
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
      const currentUser = JSON.parse(currentUserJson);
      const friendEmails = currentUser.friends || [];
      
      // Фильтруем профили по email друзей
      const friendProfiles = allProfiles.filter(profile => 
        friendEmails.includes(profile.email)
      );
      setFriends(friendProfiles);
    } else {
      setFriends([]);
    }
  };

  const updateAllUsersProfiles = (blocked: number[], hide: boolean) => {
    let filtered = allProfiles;
    
    if (hide) {
      filtered = allProfiles.filter(profile => !blocked.includes(profile.id));
    }
    
    setAllUsers(filtered);
  };

  const handleToggleFilter = () => {
    const newHideBlocked = !hideBlocked;
    setHideBlocked(newHideBlocked);
    updateAllUsersProfiles(blockedProfiles, newHideBlocked);
  };

  const handleLike = (profileId: number) => {
    const newLikes = [...likedProfiles, profileId];
    setLikedProfiles(newLikes);
    localStorage.setItem('userLikes', JSON.stringify(newLikes));
    loadConnections();
  };

  const handleLikeToggle = (profileId: number) => {
    if (likedProfiles.includes(profileId)) {
      const newLikes = likedProfiles.filter(id => id !== profileId);
      setLikedProfiles(newLikes);
      localStorage.setItem('userLikes', JSON.stringify(newLikes));
    } else {
      const newLikes = [...likedProfiles, profileId];
      setLikedProfiles(newLikes);
      localStorage.setItem('userLikes', JSON.stringify(newLikes));
    }
    loadConnections();
  };

  const handleBlock = (profileId: number) => {
    const newBlocked = [...blockedProfiles, profileId];
    setBlockedProfiles(newBlocked);
    localStorage.setItem('userBlocked', JSON.stringify(newBlocked));
    
    if (hideBlocked) {
      setAllUsers(allUsers.filter(p => p.id !== profileId));
    }
    loadConnections();
  };

  const handleUnlike = async (profileId: number) => {
    const storedLikes = localStorage.getItem('userLikes');
    if (storedLikes) {
      const likedIds = JSON.parse(storedLikes);
      const updatedLikes = likedIds.filter((id: number) => id !== profileId);
      localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
      await loadConnections();
    }
  };

  const handleUnblock = async (profileId: number) => {
    const storedBlocked = localStorage.getItem('userBlocked');
    if (storedBlocked) {
      const blockedIds = JSON.parse(storedBlocked);
      const updatedBlocked = blockedIds.filter((id: number) => id !== profileId);
      localStorage.setItem('userBlocked', JSON.stringify(updatedBlocked));
      await loadConnections();
    }
  };

  const handleRemoveFriend = async (profile: Profile) => {
    const currentUserJson = localStorage.getItem('currentUser');
    const registeredUsersJson = localStorage.getItem('registeredUsers');
    
    if (currentUserJson && registeredUsersJson) {
      const currentUser = JSON.parse(currentUserJson);
      const allUsers = JSON.parse(registeredUsersJson);
      
      if (currentUser.friends) {
        // Удаляем email друга из списка
        currentUser.friends = currentUser.friends.filter((email: string) => email !== profile.email);
        
        // Обновляем в массиве всех пользователей
        const currentUserIndex = allUsers.findIndex((u: any) => u.email === currentUser.email);
        if (currentUserIndex !== -1) {
          allUsers[currentUserIndex] = currentUser;
          localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          await loadConnections();
        }
      }
    }
  };

  const handleChat = async (profile: Profile) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: profile.email }),
      });

      const data = await response.json();

      if (response.ok && data.matchId) {
        // Добавляем пользователя в друзья, если его там еще нет
        const currentUserJson = localStorage.getItem('currentUser');
        const registeredUsersJson = localStorage.getItem('registeredUsers');
        
        if (currentUserJson && registeredUsersJson) {
          const currentUser = JSON.parse(currentUserJson);
          const allUsers = JSON.parse(registeredUsersJson);
          
          if (!currentUser.friends) {
            currentUser.friends = [];
          }
          
          if (!currentUser.friends.includes(profile.email)) {
            currentUser.friends.push(profile.email);
            
            // Обновляем в массиве всех пользователей
            const currentUserIndex = allUsers.findIndex((u: any) => u.email === currentUser.email);
            if (currentUserIndex !== -1) {
              allUsers[currentUserIndex] = currentUser;
              localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
              localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
          }
        }
        
        // Обновляем список друзей после создания чата
        await loadConnections();
        router.push(`/chats/${data.matchId}`);
      } else {
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

  const renderFriendCard = (profile: Profile) => (
    <div 
      key={profile.id}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div 
            onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
            className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            {profile.photo}
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
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavoriteCard = (profile: Profile) => (
    <div 
      key={profile.id}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div 
            onClick={() => router.push(`/profile/${encodeURIComponent(profile.email)}`)}
            className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            {profile.photo}
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
            <button
              onClick={() => handleChat(profile)}
              className="flex-1 bg-[#FF3B30] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E03329] transition-colors flex items-center justify-center gap-2"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Написать
            </button>
            <button
              onClick={() => handleUnlike(profile.id)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
              title="Убрать из избранного"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockedCard = (profile: Profile) => (
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
  );

  const renderAllUsersCard = (profile: Profile) => {
    const liked = likedProfiles.includes(profile.id);
    const blocked = blockedProfiles.includes(profile.id);
    
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
                    onClick={() => handleLikeToggle(profile.id)}
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

  const renderCard = (profile: Profile) => {
    switch (activeTab) {
      case 'friends':
        return renderFriendCard(profile);
      case 'favorites':
        return renderFavoriteCard(profile);
      case 'blocked':
        return renderBlockedCard(profile);
      case 'all':
        return renderAllUsersCard(profile);
    }
  };

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
            {!hideBlocked && blockedProfiles.length > 0 && (
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
            {activeTab === 'all' && hideBlocked && blockedProfiles.length > 0 && (
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
            {currentList.map((profile) => renderCard(profile))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

