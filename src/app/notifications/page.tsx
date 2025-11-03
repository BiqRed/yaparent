'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BellIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'event' | 'board' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  userEmail?: string;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (!currentUserEmail) {
        router.push('/login');
        return;
      }

      // Загружаем чаты с непрочитанными сообщениями
      const response = await fetch(`/api/chats?currentUserEmail=${encodeURIComponent(currentUserEmail)}`);
      if (response.ok) {
        const data = await response.json();
        
        // Преобразуем чаты в уведомления
        const notifications: Notification[] = data.chats
          ?.filter((chat: any) => chat.unread > 0)
          .map((chat: any) => ({
            id: chat.id,
            type: 'message' as const,
            title: chat.name,
            message: chat.lastMessage || 'Новое сообщение',
            time: chat.time,
            read: false,
            avatar: chat.avatar,
            userEmail: chat.userEmail,
            link: `/chats/${chat.id}`,
          })) || [];
        
        setNotificationList(notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'event':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />;
      case 'board':
        return <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">
                {unreadCount} непрочитанных
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#FF3B30] font-semibold"
            >
              Прочитать все
            </button>
          )}
        </div>
      </header>

      {/* Notifications List */}
      <main className="divide-y divide-gray-100">
        {notificationList.map((notification) => {
          const hasLink = notification.userEmail || notification.link;
          const href = notification.userEmail 
            ? `/profile/${encodeURIComponent(notification.userEmail)}`
            : notification.link || '#';
          
          const content = (
            <div className="px-4 py-4 flex items-start gap-3">
              {/* Icon/Avatar - clickable to profile */}
              <div className="flex-shrink-0">
                {notification.avatar && notification.userEmail ? (
                  <Link href={href}>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl cursor-pointer hover:opacity-80 transition-opacity">
                      {notification.avatar}
                    </div>
                  </Link>
                ) : notification.avatar ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
                    {notification.avatar}
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-semibold ${
                    notification.read ? 'text-gray-900' : 'text-gray-900 font-bold'
                  }`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-[#FF3B30] rounded-full ml-2 mt-1 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">{notification.time}</p>
                {notification.userEmail && (
                  <Link 
                    href={href}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold mt-2 inline-block"
                  >
                    Посмотреть профиль →
                  </Link>
                )}
              </div>
            </div>
          );

          return hasLink ? (
            <Link
              key={notification.id}
              href={href}
              className={`block transition-colors ${
                notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              {content}
            </Link>
          ) : (
            <div
              key={notification.id}
              className={`transition-colors ${
                notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              {content}
            </div>
          );
        })}

        {/* Empty State */}
        {notificationList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BellIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-lg">Нет уведомлений</p>
            <p className="text-sm">Вы увидите здесь важные обновления</p>
          </div>
        )}
      </main>

      {/* Settings Link */}
      <div className="px-4 py-4">
        <Link
          href="/notifications/settings"
          className="block bg-white rounded-2xl p-4 text-center text-[#FF3B30] font-semibold hover:bg-gray-50 transition-colors"
        >
          Настройки уведомлений
        </Link>
      </div>
    </div>
  );
}

