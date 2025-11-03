'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon
} from '@heroicons/react/24/solid';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  type: 'personal' | 'group';
  userEmail?: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching chats from API...');
      
      // Получаем email текущего пользователя из localStorage
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (!currentUserEmail) {
        console.error('User email not found in localStorage');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/chats?currentUserEmail=${encodeURIComponent(currentUserEmail)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Received data:', data);
      console.log('Chats count:', data.chats?.length);
      setChatList(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();

    // Перезагружаем чаты при возврате на страницу
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchChats();
      }
    };

    const handleFocus = () => {
      fetchChats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchChats]);

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users/available');
      const data = await response.json();
      setAvailableUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowNewChatModal(false);
        await fetchChats(); // Обновляем список чатов
        router.push(`/chats/${data.matchId}`);
      } else {
        alert(data.error || 'Ошибка создания чата');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка создания чата');
    }
  };

  const openNewChatModal = () => {
    fetchAvailableUsers();
    setShowNewChatModal(true);
  };

  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = chatList.reduce((sum, chat) => sum + chat.unread, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
            {totalUnread > 0 && (
              <p className="text-sm text-gray-600">
                {totalUnread} непрочитанных
              </p>
            )}
          </div>
          <button
            onClick={openNewChatModal}
            className="w-10 h-10 bg-[#FF3B30] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <PlusCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
          />
        </div>
      </header>

      {/* Chat List */}
      <main className="divide-y divide-gray-100">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className="bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="px-4 py-4 flex items-center gap-3">
              {/* Avatar - clickable to profile */}
              <div className="relative">
                {chat.userEmail ? (
                  <Link href={`/profile/${encodeURIComponent(chat.userEmail)}`}>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl cursor-pointer hover:opacity-80 transition-opacity overflow-hidden">
                      {chat.avatar && (chat.avatar.startsWith('http') || chat.avatar.startsWith('data:')) ? (
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                      ) : chat.avatar && /[\p{Emoji}]/u.test(chat.avatar) ? (
                        chat.avatar
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {chat.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </Link>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl overflow-hidden">
                      {chat.avatar && (chat.avatar.startsWith('http') || chat.avatar.startsWith('data:')) ? (
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                      ) : chat.avatar && /[\p{Emoji}]/u.test(chat.avatar) ? (
                        chat.avatar
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {chat.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </>
                )}
              </div>

              {/* Chat Info - click to open chat */}
              <Link
                href={`/chats/${chat.id}`}
                onClick={() => console.log('Opening chat:', chat.id, chat.name)}
                className="flex-1 min-w-0 block"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate hover:text-purple-600 transition-colors">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {chat.time}
                  </span>
                </div>
                <p className={`text-sm truncate ${
                  chat.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'
                }`}>
                  {chat.lastMessage}
                </p>
              </Link>

              {/* Unread Badge */}
              {chat.unread > 0 && (
                <div className="w-6 h-6 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="font-semibold text-lg">Чаты не найдены</p>
            <p className="text-sm">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Новый чат</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {availableUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Нет доступных пользователей</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateChat(user.id)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl overflow-hidden">
                          {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : user.avatar && /[\p{Emoji}]/u.test(user.avatar) ? (
                            user.avatar
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        {user.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

