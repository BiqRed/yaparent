'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BellIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  pushEnabled: boolean;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'matches',
      title: 'Новые совпадения',
      description: 'Когда кто-то лайкает вас в Smart Match',
      icon: <HeartIcon className="w-5 h-5 text-red-500" />,
      enabled: true,
      pushEnabled: true
    },
    {
      id: 'messages',
      title: 'Сообщения',
      description: 'Новые сообщения в чатах',
      icon: <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />,
      enabled: true,
      pushEnabled: true
    },
    {
      id: 'events',
      title: 'События и афиша',
      description: 'Новые события и напоминания',
      icon: <CalendarIcon className="w-5 h-5 text-purple-500" />,
      enabled: true,
      pushEnabled: false
    },
    {
      id: 'board',
      title: 'Доска объявлений',
      description: 'Новые объявления в вашем районе',
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />,
      enabled: true,
      pushEnabled: true
    },
    {
      id: 'nanny',
      title: 'Групповая няня',
      description: 'Обновления по бронированиям',
      icon: <UserGroupIcon className="w-5 h-5 text-green-500" />,
      enabled: true,
      pushEnabled: true
    },
    {
      id: 'nearby',
      title: 'Родители рядом',
      description: 'Когда подходящая семья онлайн рядом',
      icon: <BellIcon className="w-5 h-5 text-gray-500" />,
      enabled: false,
      pushEnabled: false
    }
  ]);

  const toggleEnabled = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const togglePush = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, pushEnabled: !s.pushEnabled } : s
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Настройки уведомлений</h1>
          </div>
        </div>
      </header>

      {/* Settings List */}
      <main className="p-4 space-y-3">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {setting.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {setting.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {setting.description}
                </p>

                <div className="space-y-2">
                  {/* In-app notifications toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">В приложении</span>
                    <button
                      onClick={() => toggleEnabled(setting.id)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push notifications toggle */}
                  {setting.enabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Push-уведомления</span>
                      <button
                        onClick={() => togglePush(setting.id)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          setting.pushEnabled ? 'bg-[#FF3B30]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                            setting.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Sound Settings */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Дополнительно</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Звуки уведомлений</span>
              <button className="relative w-12 h-7 rounded-full bg-green-500">
                <div className="absolute top-1 translate-x-6 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Вибрация</span>
              <button className="relative w-12 h-7 rounded-full bg-green-500">
                <div className="absolute top-1 translate-x-6 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Показывать на экране блокировки</span>
              <button className="relative w-12 h-7 rounded-full bg-green-500">
                <div className="absolute top-1 translate-x-6 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
          <h3 className="font-semibold text-purple-900 mb-2">🌙 Тихие часы</h3>
          <p className="text-sm text-purple-700 mb-3">
            Отключить уведомления в определенное время
          </p>
          <button className="w-full bg-white text-purple-700 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Настроить расписание
          </button>
        </div>
      </div>
    </div>
  );
}

