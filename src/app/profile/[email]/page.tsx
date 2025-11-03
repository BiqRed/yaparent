'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import {
  StarIcon,
  HeartIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  FireIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/solid';
import { 
  XMarkIcon, 
  HeartIcon as HeartOutlineIcon,
  NoSymbolIcon as NoSymbolOutlineIcon 
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Booking {
  id: string;
  clientId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface RegisteredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  birthDate: string;
  userType: 'parent' | 'nanny';
  photoUrl?: string;
  bio?: string;
  kids?: Array<{ name: string; age: number; gender: 'boy' | 'girl' }>;
  interests?: string[];
  hourlyRate?: string;
  experience?: string;
  education?: string;
  ageRange?: string;
  specializations?: string[];
  certifications?: string[];
  languages?: string[];
  availableHours?: string[];
  reviews?: Review[];
  bookings?: Booking[];
  friends?: string[];
  rating?: number;
  karma?: number;
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

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaAmount, setKarmaAmount] = useState(1);
  const [actualKarma, setActualKarma] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      const registeredUsersJson = localStorage.getItem('registeredUsers');
      
      if (!storedUser || !registeredUsersJson) {
        router.push('/login');
        return;
      }
      
      try {
        const current: RegisteredUser = JSON.parse(storedUser);
        
        // Check if this is current user's own profile
        if (current.email === email) {
          router.push('/profile');
          return;
        }
        
        const allUsers: RegisteredUser[] = JSON.parse(registeredUsersJson);
        let profileUser = allUsers.find((u) => u.email === email);
        
        // If user not found in registered users, show error
        if (!profileUser) {
          alert('Профиль пользователя не найден');
          router.push('/match');
          return;
        }
        
        setCurrentUser(current);
        setUser(profileUser);
        setIsFriend(current.friends?.includes(email) || false);
        
        // Проверяем, находится ли пользователь в избранном
        const storedLikes = localStorage.getItem('userLikes');
        if (storedLikes) {
          const likedEmails = JSON.parse(storedLikes);
          setIsLiked(likedEmails.includes(email));
        }
        
        // Проверяем, заблокирован ли пользователь
        const storedBlocked = localStorage.getItem('userBlocked');
        if (storedBlocked) {
          const blockedEmails = JSON.parse(storedBlocked);
          setIsBlocked(blockedEmails.includes(email));
        }
        
        setIsLoading(false);
      } catch {
        router.push('/login');
      }
    }
  }, [email, router]);

  // Загружаем актуальную карму из БД
  useEffect(() => {
    const fetchKarma = async () => {
      try {
        const response = await fetch(`/api/users/${email}/karma`);
        if (response.ok) {
          const data = await response.json();
          setActualKarma(data.karma);
        }
      } catch (error) {
        console.error('Error fetching karma:', error);
      }
    };

    if (email && user) {
      fetchKarma();
    }
  }, [email, user]);

  const addFriend = () => {
    if (!currentUser || !user) return;
    
    const registeredUsersJson = localStorage.getItem('registeredUsers');
    if (!registeredUsersJson) return;
    
    const allUsers: RegisteredUser[] = JSON.parse(registeredUsersJson);
    const currentUserIndex = allUsers.findIndex((u) => u.email === currentUser.email);
    
    if (currentUserIndex !== -1) {
      if (!allUsers[currentUserIndex].friends) {
        allUsers[currentUserIndex].friends = [];
      }
      
      if (!allUsers[currentUserIndex].friends!.includes(user.email)) {
        allUsers[currentUserIndex].friends!.push(user.email);
        localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
        localStorage.setItem('currentUser', JSON.stringify(allUsers[currentUserIndex]));
        setIsFriend(true);
        setCurrentUser(allUsers[currentUserIndex]);
      }
    }
  };

  const toggleLike = () => {
    if (!user) return;
    
    const storedLikes = localStorage.getItem('userLikes');
    let likedEmails: string[] = storedLikes ? JSON.parse(storedLikes) : [];
    
    if (isLiked) {
      // Убрать из избранного
      likedEmails = likedEmails.filter((e) => e !== user.email);
      setIsLiked(false);
    } else {
      // Добавить в избранное
      if (!likedEmails.includes(user.email)) {
        likedEmails.push(user.email);
      }
      setIsLiked(true);
      
      // Если был заблокирован, разблокировать
      if (isBlocked) {
        toggleBlock();
      }
    }
    
    localStorage.setItem('userLikes', JSON.stringify(likedEmails));
  };

  const toggleBlock = () => {
    if (!user) return;
    
    const storedBlocked = localStorage.getItem('userBlocked');
    let blockedEmails: string[] = storedBlocked ? JSON.parse(storedBlocked) : [];
    
    if (isBlocked) {
      // Разблокировать
      blockedEmails = blockedEmails.filter((e) => e !== user.email);
      setIsBlocked(false);
    } else {
      // Заблокировать
      if (!blockedEmails.includes(user.email)) {
        blockedEmails.push(user.email);
      }
      setIsBlocked(true);
      
      // Если был в избранном, убрать
      if (isLiked) {
        toggleLike();
      }
    }
    
    localStorage.setItem('userBlocked', JSON.stringify(blockedEmails));
  };

  const addKarma = async () => {
    if (!currentUser || !user || karmaAmount <= 0) return;
    
    try {
      const response = await fetch(`/api/users/${user.email}/karma`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: karmaAmount }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Обновляем актуальную карму
        setActualKarma(data.karma);
        
        // Также обновляем в localStorage для совместимости
        const registeredUsersJson = localStorage.getItem('registeredUsers');
        if (registeredUsersJson) {
          const allUsers: RegisteredUser[] = JSON.parse(registeredUsersJson);
          const userIndex = allUsers.findIndex((u) => u.email === user.email);
          
          if (userIndex !== -1) {
            allUsers[userIndex].karma = data.karma;
            localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
            setUser(allUsers[userIndex]);
          }
        }
        
        setShowKarmaModal(false);
        setKarmaAmount(1);
        
        // Показываем toast уведомление
        setToastMessage(`+${karmaAmount} карма добавлена! 🔥`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Не удалось добавить карму'}`);
      }
    } catch (error) {
      console.error('Error adding karma:', error);
      alert('Ошибка при добавлении кармы. Попробуйте позже.');
    }
  };

  const handleSendMessage = async () => {
    if (!user) return;
    
    try {
      // Создаем или находим чат с этим пользователем через API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user.email }),
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

  const submitReview = () => {
    if (!currentUser || !user || user.userType !== 'nanny') return;
    
    const registeredUsersJson = localStorage.getItem('registeredUsers');
    if (!registeredUsersJson) return;
    
    const allUsers: RegisteredUser[] = JSON.parse(registeredUsersJson);
    const userIndex = allUsers.findIndex((u) => u.email === user.email);
    
    if (userIndex !== -1) {
      if (!allUsers[userIndex].reviews) {
        allUsers[userIndex].reviews = [];
      }
      
      const newReview: Review = {
        id: Date.now().toString(),
        fromUserId: currentUser.email,
        fromUserName: currentUser.name,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString(),
      };
      
      allUsers[userIndex].reviews!.push(newReview);
      
      // Update average rating
      const avgRating = allUsers[userIndex].reviews!.reduce((sum, r) => sum + r.rating, 0) / allUsers[userIndex].reviews!.length;
      allUsers[userIndex].rating = Math.round(avgRating * 10) / 10;
      
      localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
      setUser(allUsers[userIndex]);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const userAge = calculateAge(user.birthDate);
  const completedBookings = user.bookings?.filter((b) => b.status === 'completed').length || 0;
  const activeBookings = user.bookings?.filter((b) => b.status === 'active').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="px-4 pt-6">
        <Link
          href="/match"
          className="inline-block mb-4 text-gray-700 bg-white px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-sm"
        >
          ← Назад
        </Link>
      </div>

      {/* Profile Info */}
      <div className="px-4">
        {isBlocked && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <NoSymbolIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-900 font-semibold">Пользователь заблокирован</p>
              <p className="text-red-700 text-sm">Вы не будете видеть этого пользователя в рекомендациях</p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={`w-24 h-24 ${user.userType === 'parent' ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-gradient-to-br from-green-400 to-teal-400'} rounded-full flex items-center justify-center text-5xl overflow-hidden`}>
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.userType === 'parent' ? '👨‍👩‍👧‍👦' : '👩‍🏫'}</span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}{userAge > 0 ? `, ${userAge}` : ''}
                  </h1>
                  <p className="text-gray-600 text-sm">{user.location}</p>
                </div>
                {user.userType === 'nanny' && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₽{user.hourlyRate || '800'}</div>
                    <div className="text-xs text-gray-500">руб/час</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{user.rating?.toFixed(1) || '0.0'}</span>
                </div>
                {user.userType === 'nanny' && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="text-sm text-gray-600">
                      {user.reviews?.length || 0} отзывов
                    </div>
                  </>
                )}
                {user.userType === 'parent' && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-900">{actualKarma !== null ? actualKarma : (user.karma || 0)}</span>
                      <span className="text-xs text-gray-600">кармы</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {/* Основные кнопки */}
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Написать
              </button>
              
              <button
                onClick={toggleLike}
                className={`px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isLiked ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                {isLiked ? (
                  <HeartIcon className="w-6 h-6" />
                ) : (
                  <HeartOutlineIcon className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={toggleBlock}
                className={`px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
                  isBlocked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isBlocked ? 'Разблокировать' : 'Заблокировать'}
              >
                {isBlocked ? (
                  <NoSymbolIcon className="w-6 h-6" />
                ) : (
                  <NoSymbolOutlineIcon className="w-6 h-6" />
                )}
              </button>
            </div>
            
            {/* Дополнительные кнопки */}
            <div className="flex gap-2">
              {user.userType === 'parent' && (
                <>
                  <button
                    onClick={addFriend}
                    disabled={isFriend}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      isFriend
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
                    }`}
                  >
                    <UserPlusIcon className="w-5 h-5 inline-block mr-2" />
                    {isFriend ? 'Уже друзья' : 'Добавить в друзья'}
                  </button>
                  <button
                    onClick={() => setShowKarmaModal(true)}
                    disabled={isBlocked}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <FireIcon className="w-5 h-5 inline-block mr-2" />
                    Добавить карму
                  </button>
                </>
              )}
              {user.userType === 'nanny' && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={isBlocked}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <StarIcon className="w-5 h-5 inline-block mr-2" />
                  Оставить отзыв
                </button>
              )}
            </div>
          </div>

          {/* Kids (for parents) */}
          {user.userType === 'parent' && user.kids && user.kids.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Дети:</p>
              <div className="flex gap-2 flex-wrap">
                {user.kids.map((kid, idx) => (
                  <div key={idx} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-semibold">
                    {kid.gender === 'girl' ? '👧' : '👦'} {kid.name}, {kid.age} {kid.age === 1 ? 'год' : kid.age < 5 ? 'года' : 'лет'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests (for parents) */}
          {user.userType === 'parent' && user.interests && user.interests.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-500 mb-2">Интересы:</p>
              <div className="flex gap-2 flex-wrap">
                {user.interests.map((interest, idx) => (
                  <div key={idx} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-full text-sm font-semibold">
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Info (for nannies) */}
          {user.userType === 'nanny' && (
            <>
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="font-semibold block text-xs text-gray-500">Опыт</span>
                      <span className="text-gray-900">{user.experience || '5'} лет</span>
                    </div>
                  </div>
                  {user.ageRange && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircleIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="font-semibold block text-xs text-gray-500">Возраст детей</span>
                        <span className="text-gray-900">{user.ageRange}</span>
                      </div>
                    </div>
                  )}
                </div>

                {user.education && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <AcademicCapIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-xs text-gray-500 mb-1">Образование</span>
                      <span className="text-gray-900">{user.education}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {user.specializations && user.specializations.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Специализация:</p>
                  <div className="flex gap-2 flex-wrap">
                    {user.specializations.map((spec, idx) => (
                      <div key={idx} className="bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {user.certifications && user.certifications.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    <ShieldCheckIcon className="w-4 h-4 inline-block mr-1 text-green-600" />
                    Сертификаты:
                  </p>
                  <ul className="space-y-1">
                    {user.certifications.map((cert, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {user.languages && user.languages.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Языки:</p>
                  <div className="flex gap-2 flex-wrap">
                    {user.languages.map((lang, idx) => (
                      <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold">
                        🌐 {lang}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {user.userType === 'nanny' && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-2xl p-4 text-center">
              <ClockIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
              <p className="text-xs text-gray-600">Завершено</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <UserCircleIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{activeBookings}</p>
              <p className="text-xs text-gray-600">Активных</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <StarIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{user.reviews?.length || 0}</p>
              <p className="text-xs text-gray-600">Отзывов</p>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {user.userType === 'nanny' && user.reviews && user.reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mt-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Отзывы</h3>
            <div className="space-y-4">
              {user.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.fromUserName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, idx) => (
                          <StarIcon
                            key={idx}
                            className={`w-4 h-4 ${idx < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Оставить отзыв</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Оценка:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`w-10 h-10 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Комментарий:</p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Расскажите о вашем опыте работы с няней..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={submitReview}
                disabled={!reviewComment.trim()}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Karma Modal */}
      {showKarmaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FireIcon className="w-6 h-6 text-orange-500" />
                Добавить карму
              </h3>
              <button
                onClick={() => setShowKarmaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Текущая карма: <span className="font-bold text-orange-600">{actualKarma !== null ? actualKarma : (user?.karma || 0)}</span>
            </p>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Количество кармы:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setKarmaAmount(Math.max(1, karmaAmount - 1))}
                  className="w-10 h-10 bg-gray-100 rounded-lg text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={karmaAmount}
                    onChange={(e) => setKarmaAmount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  onClick={() => setKarmaAmount(Math.min(10, karmaAmount + 1))}
                  className="w-10 h-10 bg-gray-100 rounded-lg text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">От 1 до 10 единиц кармы</p>
            </div>

            <div className="mb-4 bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Карма</strong> помогает другим пользователям понять, насколько {user?.name} активен и полезен в сообществе.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowKarmaModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={addKarma}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <FireIcon className="w-5 h-5" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px]">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <FireIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{toastMessage}</p>
              <p className="text-sm text-orange-100">Новое значение: {actualKarma}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

