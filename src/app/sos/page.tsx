'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { BOARD_POST_TYPES, BOARD_CITIES } from '@/lib/constants';
import {
  MegaphoneIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CheckCircleIcon,
  FunnelIcon,
  PlusCircleIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  BookmarkIcon,
  HeartIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';

// Используем тип из types/index.ts
import { PostType } from '@/types';

interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Response {
  id: string;
  postId: string;
  responderId: string;
  responder: Author;
  message: string;
  contacted: boolean;
  createdAt: string;
}

interface BoardPost {
  id: string;
  type: PostType;
  authorId: string;
  author: Author;
  title?: string;
  description: string;
  city: string;
  district?: string;
  dateFrom?: string;
  dateUntil?: string;
  status: 'active' | 'closed';
  viewCount: number;
  responses: Response[];
  selectedResponderId?: string;
  selectedResponder?: Author;
  createdAt: string;
  updatedAt: string;
  saved?: boolean;
}

// Используем централизованные константы из constants.ts
const POST_TYPES = BOARD_POST_TYPES;
const CITIES = BOARD_CITIES;

export default function BoardPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [myPosts, setMyPosts] = useState<BoardPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Фильтры (мультиселект для типов)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);
  const [selectedCity, setSelectedCity] = useState<string>('Все города');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Форма создания
  const [newPostType, setNewPostType] = useState<PostType>('need_nanny');
  const [newPostCity, setNewPostCity] = useState('Москва');
  const [newPostDistrict, setNewPostDistrict] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');

  // Получаем текущего пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log('Fetching current user...');
        const currentUserEmail = localStorage.getItem('currentUserEmail');
        if (!currentUserEmail) {
          console.error('No user email found in localStorage');
          return;
        }
        
        const response = await fetch(`/api/users/me?email=${encodeURIComponent(currentUserEmail)}`);
        const data = await response.json();
        console.log('Current user response:', data);
        if (data.user && data.user.id) {
          setCurrentUserId(data.user.id);
          console.log('Current user ID set to:', data.user.id);
        } else {
          console.error('No user found in response:', data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Загрузка объявлений
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Для фильтрации по городу
      if (selectedCity !== 'Все города') params.append('city', selectedCity);
      
      const response = await fetch(`/api/board?${params.toString()}`);
      let data = await response.json();
      
      // Клиентская фильтрация по типам (мультиселект)
      if (!selectedTypes.includes('all') && selectedTypes.length > 0) {
        data = data.filter((post: BoardPost) => selectedTypes.includes(post.type));
      }
      
      // Если есть текущий пользователь, загружаем его сохраненные посты
      if (currentUserId) {
        try {
          const savedResponse = await fetch(`/api/board/saved?userId=${currentUserId}`);
          const savedPosts = await savedResponse.json();
          const savedPostIds = new Set(savedPosts.map((p: any) => p.id));
          
          // Помечаем сохраненные посты
          const postsWithSaved = data.map((post: BoardPost) => ({
            ...post,
            saved: savedPostIds.has(post.id)
          }));
          
          setPosts(postsWithSaved);
        } catch (error) {
          console.error('Error fetching saved posts:', error);
          setPosts(data);
        }
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTypes, selectedCity, currentUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchMyPosts = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`/api/board?authorId=${currentUserId}`);
      const data = await response.json();
      setMyPosts(data);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  }, [currentUserId]);

  // Загрузка моих объявлений
  useEffect(() => {
    if (currentUserId) {
      fetchMyPosts();
    }
  }, [currentUserId, fetchMyPosts]);

  const getTypeInfo = (type: PostType) => {
    const info = POST_TYPES.find(t => t.value === type);
    return info || { icon: '📋', label: type };
  };

  const getTypeColor = (type: PostType | 'all') => {
    const colors: Record<string, string> = {
      all: 'bg-gray-100 text-gray-700 border-gray-200',
      need_nanny: 'bg-orange-100 text-orange-700 border-orange-200',
      can_babysit: 'bg-green-100 text-green-700 border-green-200',
      playdate: 'bg-purple-100 text-purple-700 border-purple-200',
      looking_for_friends: 'bg-blue-100 text-blue-700 border-blue-200',
      offer_help: 'bg-teal-100 text-teal-700 border-teal-200',
      need_help: 'bg-red-100 text-red-700 border-red-200',
      coffee_meetup: 'bg-pink-100 text-pink-700 border-pink-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const toggleType = (typeValue: string) => {
    if (typeValue === 'all') {
      setSelectedTypes(['all']);
    } else {
      const newTypes = selectedTypes.includes(typeValue)
        ? selectedTypes.filter(t => t !== typeValue)
        : [...selectedTypes.filter(t => t !== 'all'), typeValue];
      
      setSelectedTypes(newTypes.length === 0 ? ['all'] : newTypes);
    }
  };

  const toggleSave = async (postId: string) => {
    if (!currentUserId) {
      alert('Необходимо авторизоваться');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isSaved = post.saved;

    try {
      if (isSaved) {
        // Удалить из избранного
        const response = await fetch(`/api/board/saved?userId=${currentUserId}&postId=${postId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setPosts(posts.map(p => 
            p.id === postId ? { ...p, saved: false } : p
          ));
        } else {
          const error = await response.json();
          console.error('Error removing from saved:', error);
          alert('Ошибка при удалении из избранного');
        }
      } else {
        // Добавить в избранное
        const response = await fetch('/api/board/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUserId,
            postId,
          }),
        });

        if (response.ok) {
          setPosts(posts.map(p => 
            p.id === postId ? { ...p, saved: true } : p
          ));
        } else {
          const error = await response.json();
          console.error('Error saving post:', error);
          alert('Ошибка при добавлении в избранное');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('Ошибка при работе с избранным');
    }
  };

  const handleSavePost = async () => {
    if (!newPostDescription.trim() || !currentUserId) return;
    
    try {
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: currentUserId,
          type: newPostType,
          description: newPostDescription,
          city: newPostCity,
          district: newPostDistrict || undefined,
        }),
      });

      if (response.ok) {
        // Очистка формы
        setNewPostDescription('');
        setNewPostDistrict('');
        setShowCreatePost(false);
        
        // Перезагрузка списка объявлений
        await fetchPosts();
        await fetchMyPosts();
      } else {
        const error = await response.json();
        console.error('Error creating post:', error);
        alert('Ошибка при создании объявления: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Ошибка при создании объявления');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !currentUserId) {
      console.log('Cannot add comment:', { newComment: newComment.trim(), currentUserId });
      return;
    }
    
    try {
      console.log('Sending response to:', `/api/board/${postId}/responses`);
      console.log('Body:', { responderId: currentUserId, message: newComment });
      
      const response = await fetch(`/api/board/${postId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responderId: currentUserId,
          message: newComment,
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        setNewComment('');
        // Перезагрузка объявлений для обновления счетчика и откликов
        await fetchPosts();
        // Уведомление об успехе
        alert('✓ Отклик отправлен!');
      } else {
        const error = await response.json();
        console.error('Error creating response:', error);
        alert('Ошибка при создании отклика: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating response:', error);
      alert('Ошибка при создании отклика');
    }
  };

  const handleClosePost = async (postId: string) => {
    if (!currentUserId) {
      console.error('Cannot close post: currentUserId is not set');
      alert('Ошибка: не удалось определить текущего пользователя. Попробуйте обновить страницу.');
      return;
    }
    
    const confirmed = confirm('Вы уверены, что хотите закрыть это объявление?');
    if (!confirmed) return;

    try {
      console.log('Closing post:', { postId, currentUserId });
      
      const response = await fetch(`/api/board/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: currentUserId,
          status: 'closed',
        }),
      });

      console.log('Close post response status:', response.status);

      if (response.ok) {
        // Перезагрузка объявлений
        await fetchPosts();
        await fetchMyPosts();
        alert('✓ Объявление успешно закрыто');
      } else {
        const error = await response.json();
        console.error('Error closing post:', error);
        alert('Ошибка при закрытии объявления: ' + (error.error || 'Unknown error') + (error.details ? ' (' + error.details + ')' : ''));
      }
    } catch (error) {
      console.error('Error closing post:', error);
      alert('Ошибка при закрытии объявления: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSelectResponder = async (postId: string, responderId: string) => {
    if (!currentUserId) return;
    
    const confirmed = confirm('Вы хотите выбрать этого исполнителя? Объявление будет закрыто.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/board/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: currentUserId,
          selectedResponderId: responderId,
        }),
      });

      if (response.ok) {
        // Перезагрузка объявлений
        await fetchPosts();
        await fetchMyPosts();
        closeComments();
      } else {
        const error = await response.json();
        console.error('Error selecting responder:', error);
        alert('Ошибка при выборе исполнителя: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error selecting responder:', error);
      alert('Ошибка при выборе исполнителя');
    }
  };

  const openComments = (postId: string) => {
    setSelectedPostId(postId);
  };

  const closeComments = () => {
    setSelectedPostId(null);
    setNewComment('');
  };

  const closeMyPosts = () => {
    setShowMyPosts(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : 'часа'} назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'день' : 'дня'} назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Фильтрация постов с учетом избранного
  const filteredPosts = showOnlyFavorites ? posts.filter(p => p.saved) : posts;
  const selectedPost = posts.find(p => p.id === selectedPostId);
  const postComments = selectedPost?.responses || [];
  const isMyPost = selectedPost?.authorId === currentUserId;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 px-6 py-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">Доска объявлений</h1>
            <p className="text-sm text-white/90 mt-1">Найди то, что нужно</p>
          </div>
          <div className="flex gap-2">
            {currentUserId && (
              <button
                onClick={() => setShowMyPosts(true)}
                className="relative p-3.5 rounded-2xl transition-all shadow-lg bg-white/20 hover:bg-white/30"
                title="Мои объявления"
              >
                <UserIcon className="w-7 h-7" />
                {myPosts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {myPosts.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className={`p-3.5 rounded-2xl transition-all shadow-lg ${
                showCreatePost 
                  ? 'bg-white text-purple-600 rotate-45' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <PlusCircleIcon className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Quick Type Filters - мультиселект */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
          {POST_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  isSelected
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span className="mr-1.5">{type.icon}</span>
                {type.label}
                {isSelected && type.value !== 'all' && (
                  <span className="ml-1.5">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* City Filter Bar */}
      <div className="bg-white shadow-sm px-6 py-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <MapPinIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <div className="relative flex-1">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2.5 pr-10 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent appearance-none cursor-pointer hover:border-purple-300 transition-all shadow-sm"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-600 font-bold">▼</div>
          </div>
          {(!selectedTypes.includes('all') || selectedCity !== 'Все города' || showOnlyFavorites) && (
            <button
              onClick={() => {
                setSelectedTypes(['all']);
                setSelectedCity('Все города');
                setShowOnlyFavorites(false);
              }}
              className="text-xs text-purple-600 font-semibold bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
        
        {/* Фильтр избранного */}
        {currentUserId && (
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
              showOnlyFavorites
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <BookmarkIcon className="w-5 h-5" />
            <span>{showOnlyFavorites ? 'Показать все' : 'Только избранное'}</span>
            {showOnlyFavorites && posts.filter(p => p.saved).length > 0 && (
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                {posts.filter(p => p.saved).length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <div className="mx-5 mt-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-xl border-2 border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-7 py-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">✨ Новое объявление</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-7 space-y-6">
            {/* Type Selection - компактные кнопки как в фильтрах */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="text-xl">✨</div>
                <p className="text-sm font-bold text-purple-700">Что вы хотите разместить?</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {POST_TYPES.filter(t => t.value !== 'all').map(type => (
                  <button
                    key={type.value}
                    onClick={() => setNewPostType(type.value as PostType)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      newPostType === type.value
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border-2 border-gray-200'
                    }`}
                  >
                    <span className="mr-1.5">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-700 uppercase tracking-wide">Город</label>
                <div className="relative">
                  <select
                    value={newPostCity}
                    onChange={(e) => setNewPostCity(e.target.value)}
                    className="w-full p-4 pr-10 bg-white border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent font-semibold text-gray-900 appearance-none shadow-md hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
                  >
                    {CITIES.filter(c => c !== 'Все города').map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-600 font-bold text-lg">▼</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-700 uppercase tracking-wide">Район</label>
                <input
                  type="text"
                  value={newPostDistrict}
                  onChange={(e) => setNewPostDistrict(e.target.value)}
                  placeholder="Например, Центральный"
                  className="w-full p-4 bg-white border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 placeholder:text-gray-400 shadow-sm hover:border-purple-300 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-purple-700 uppercase tracking-wide">Подробное описание</label>
              <textarea
                value={newPostDescription}
                onChange={(e) => setNewPostDescription(e.target.value)}
                className="w-full p-5 bg-white border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 shadow-sm hover:border-purple-300 transition-all"
                rows={5}
                placeholder="Расскажите подробнее о вашем объявлении. Чем больше информации, тем больше откликов!"
              />
              <p className="text-xs text-purple-600 text-right font-medium">{newPostDescription.length} / 500</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button 
                onClick={handleSavePost}
                disabled={!newPostDescription.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                🚀 Опубликовать
              </button>
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Posts */}
      <main className="flex-1 px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-gray-900 text-lg">
            {showOnlyFavorites ? '⭐' : '📌'} {filteredPosts.length} {filteredPosts.length === 1 ? 'объявление' : 'объявлений'}
            {showOnlyFavorites && ' в избранном'}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
              <MegaphoneIcon className="w-12 h-12 text-purple-600" />
            </div>
            <p className="font-bold text-xl text-gray-900 mb-2">Загрузка...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              {showOnlyFavorites ? (
                <BookmarkIcon className="w-12 h-12 text-purple-600" />
              ) : (
                <MegaphoneIcon className="w-12 h-12 text-purple-600" />
              )}
            </div>
            <p className="font-bold text-xl text-gray-900 mb-2">
              {showOnlyFavorites ? 'Нет избранных объявлений' : 'Объявлений не найдено'}
            </p>
            <p className="text-gray-600 mb-6">
              {showOnlyFavorites 
                ? 'Добавьте объявления в избранное, чтобы быстро находить их' 
                : 'Попробуйте изменить фильтры или создайте своё'}
            </p>
            {!showOnlyFavorites && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all"
              >
                Создать объявление
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const typeInfo = getTypeInfo(post.type);
            return (
              <div key={post.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
                {/* Color stripe */}
                <div className={`h-1.5 ${getTypeColor(post.type).replace('bg-', 'bg-gradient-to-r from-').replace('100', '400')}`} />
                
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{typeInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${getTypeColor(post.type)}`}>
                            {typeInfo.label}
                          </span>
                          {post.status === 'closed' && (
                            <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              Закрыто
                            </span>
                          )}
                          {post.selectedResponder && (
                            <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-green-100 text-green-700 border border-green-200">
                              ✓ Исполнитель выбран
                            </span>
                          )}
                        </div>
                        <Link href={`/profile/${encodeURIComponent(post.author.email)}`}>
                          <p className="font-bold text-gray-900 text-lg cursor-pointer hover:text-purple-600 transition-colors">{post.author.name}</p>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold">
                            <MapPinIcon className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-900">
                              {post.city}{post.district && `, ${post.district}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <button 
                      onClick={() => toggleSave(post.id)}
                      className="ml-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      {post.saved ? (
                        <BookmarkIcon className="w-6 h-6 text-purple-600" />
                      ) : (
                        <BookmarkOutlineIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Selected Responder */}
                  {post.selectedResponder && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-green-800 mb-1">✓ Выбран исполнитель:</p>
                      <Link href={`/profile/${encodeURIComponent(post.selectedResponder.email)}`}>
                        <p className="font-bold text-green-700 hover:text-green-800 cursor-pointer">{post.selectedResponder.name}</p>
                      </Link>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-50">
                    <button
                      onClick={() => openComments(post.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-purple-600" />
                        <span>{post.responses.length} {post.responses.length === 1 ? 'отклик' : 'откликов'}</span>
                      </div>
                    </button>

                    <div className="flex gap-2">
                      {post.status === 'active' && post.authorId !== currentUserId ? (
                        <>
                          <button 
                            onClick={() => openComments(post.id)}
                            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-7 py-3 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all text-sm"
                          >
                            Откликнуться
                          </button>
                          <Link href={`/profile/${encodeURIComponent(post.author.email)}`}>
                            <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all">
                              <PhoneIcon className="w-5 h-5 text-purple-600" />
                            </button>
                          </Link>
                        </>
                      ) : post.status === 'closed' ? (
                        <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold cursor-not-allowed text-sm">
                          <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                          Закрыто
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* My Posts Modal */}
      {showMyPosts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center animate-in fade-in duration-200">
          <div className="w-full sm:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-5 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeMyPosts}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <ArrowLeftIcon className="w-5 h-5 text-white" />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-white">Мои объявления</h3>
                    <p className="text-sm text-white/90">{myPosts.length} активных</p>
                  </div>
                </div>
                <UserIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* My Posts List */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
              {myPosts.length > 0 ? (
                myPosts.map((post) => {
                  const typeInfo = getTypeInfo(post.type);
                  return (
                    <div key={post.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                      {/* Color stripe */}
                      <div className={`h-1.5 ${getTypeColor(post.type).replace('bg-', 'bg-gradient-to-r from-').replace('100', '400')}`} />
                      
                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-4xl">{typeInfo.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${getTypeColor(post.type)}`}>
                                  {typeInfo.label}
                                </span>
                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                                  post.status === 'active' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                  {post.status === 'active' ? '✓ Активно' : 'Закрыто'}
                                </span>
                                {post.selectedResponder && (
                                  <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                    ✓ Исполнитель выбран
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>{formatTimeAgo(post.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <MapPinIcon className="w-4 h-4 text-purple-600" />
                                  <span className="text-gray-900">
                                    {post.city}{post.district && `, ${post.district}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed">
                          {post.description}
                        </p>

                        {/* Selected Responder */}
                        {post.selectedResponder && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <p className="text-sm font-bold text-green-800 mb-1">✓ Выбран исполнитель:</p>
                            <Link href={`/profile/${encodeURIComponent(post.selectedResponder.email)}`}>
                              <p className="font-bold text-green-700 hover:text-green-800 cursor-pointer">{post.selectedResponder.name}</p>
                            </Link>
                          </div>
                        )}

                        {/* Stats and Actions */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 bg-purple-50 px-4 py-2 rounded-lg">
                              <ChatBubbleLeftIcon className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold">{post.responses.length} откликов</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-lg">
                              <HeartIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold">{post.viewCount} просмотров</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                closeMyPosts();
                                openComments(post.id);
                              }}
                              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg active:scale-95 transition-all"
                            >
                              Отклики
                            </button>
                            {post.status === 'active' && (
                              <button 
                                onClick={() => {
                                  closeMyPosts();
                                  handleClosePost(post.id);
                                }}
                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-all"
                              >
                                Закрыть
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <MegaphoneIcon className="w-12 h-12 text-purple-600" />
                  </div>
                  <p className="font-bold text-xl text-gray-900 mb-2">У вас пока нет объявлений</p>
                  <p className="text-gray-600 mb-6">Создайте свое первое объявление!</p>
                  <button
                    onClick={() => {
                      closeMyPosts();
                      setShowCreatePost(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all"
                  >
                    Создать объявление
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPostId && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center animate-in fade-in duration-200">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-5 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeComments}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <ArrowLeftIcon className="w-5 h-5 text-white" />
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-white">Отклики</h3>
                    <p className="text-sm text-white/90">{postComments.length} {postComments.length === 1 ? 'отклик' : 'откликов'}</p>
                  </div>
                </div>
                <div className="text-2xl">{getTypeInfo(selectedPost.type).icon}</div>
              </div>
            </div>

            {/* Post Info */}
            <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-purple-100 flex-shrink-0">
              <p className="font-bold text-gray-900 mb-1">{selectedPost.author.name}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{selectedPost.description}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {postComments.length > 0 ? (
                postComments.map((comment) => (
                  <div key={comment.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <Link href={`/profile/${encodeURIComponent(comment.responder.email)}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-xl flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                          {comment.responder.avatar || '👤'}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${encodeURIComponent(comment.responder.email)}`}>
                            <p className="font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors">{comment.responder.name}</p>
                          </Link>
                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.message}</p>
                        
                        {/* Select responder button (only for post author) */}
                        {isMyPost && selectedPost.status === 'active' && !selectedPost.selectedResponderId && (
                          <button
                            onClick={() => handleSelectResponder(selectedPost.id, comment.responderId)}
                            className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                          >
                            ✓ Выбрать исполнителем
                          </button>
                        )}
                        
                        {/* Selected badge */}
                        {selectedPost.selectedResponderId === comment.responderId && (
                          <div className="mt-3 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold inline-block">
                            ✓ Выбран исполнителем
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Пока нет откликов</p>
                  <p className="text-sm text-gray-600">Будьте первым, кто откликнется!</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            {selectedPost.status === 'active' && !isMyPost && (
              <div className="px-6 py-5 bg-gradient-to-br from-purple-50 to-blue-50 border-t border-purple-100 flex-shrink-0">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Напишите ваш отклик..."
                    className="flex-1 p-4 bg-white border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 shadow-sm"
                    rows={3}
                  />
                  <button
                    onClick={() => handleAddComment(selectedPostId)}
                    disabled={!newComment.trim()}
                    className="px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center"
                  >
                    <PaperAirplaneIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
            
            {isMyPost && selectedPost.status === 'active' && (
              <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-blue-50 border-t border-purple-100 flex-shrink-0">
                <p className="text-sm text-gray-600 text-center">
                  Это ваше объявление. Вы можете выбрать исполнителя из откликов выше.
                </p>
              </div>
            )}
            
            {selectedPost.status === 'closed' && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                <p className="text-sm text-gray-600 text-center font-semibold">
                  ✓ Это объявление закрыто
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
