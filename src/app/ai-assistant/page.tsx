'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import {
  MicrophoneIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';

interface Command {
  id: number;
  icon: string;
  title: string;
  example: string;
  color: string;
}

const commands: Command[] = [
  {
    id: 1,
    icon: '🔍',
    title: 'Найти события',
    example: 'Алиса, найди детские события на выходные',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 2,
    icon: '👶',
    title: 'Забронировать няню',
    example: 'Алиса, нужна няня на завтра в 15:00',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 3,
    icon: '🗺️',
    title: 'Где родители рядом',
    example: 'Алиса, кто из родителей онлайн рядом со мной',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 4,
    icon: '📋',
    title: 'Создать объявление',
    example: 'Алиса, создай объявление что ищу няню',
    color: 'from-purple-400 to-blue-600'
  },
  {
    id: 5,
    icon: '🤝',
    title: 'Создать встречу',
    example: 'Алиса, создай групповую встречу в парке',
    color: 'from-yellow-400 to-orange-600'
  },
  {
    id: 6,
    icon: '💬',
    title: 'Отправить сообщение',
    example: 'Алиса, напиши Марии что я опаздываю',
    color: 'from-pink-400 to-pink-600'
  }
];

export default function AIAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleVoiceClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Симуляция распознавания речи
      setTimeout(() => {
        setTranscript('Алиса, найди детские события на выходные');
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Яндекс.Алиса</h1>
            <p className="text-sm text-gray-600">Голосовой ассистент</p>
          </div>
        </div>
      </header>

      {/* Main Voice Interface */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-6">
          {/* Voice Button */}
          <button
            onClick={handleVoiceClick}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse shadow-2xl scale-110'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            <MicrophoneIcon className="w-16 h-16 text-white" />
          </button>

          {/* Status Text */}
          <div className="space-y-2">
            {isListening ? (
              <>
                <p className="text-lg font-semibold text-purple-900">Слушаю...</p>
                <p className="text-sm text-gray-600">Говорите команду</p>
              </>
            ) : transcript ? (
              <>
                <p className="text-lg font-semibold text-purple-900">Распознано:</p>
                <p className="text-sm text-gray-700 bg-white rounded-xl px-4 py-2 shadow-sm">
                  {transcript}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-purple-900">Нажмите для команды</p>
                <p className="text-sm text-gray-600">Или скажите "Алиса"</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Commands List */}
      <div className="px-4 pb-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Голосовые команды</h2>

        {commands.map((command) => (
          <div
            key={command.id}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${command.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {command.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{command.title}</h3>
                <p className="text-sm text-gray-600 italic">"{command.example}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Info */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-700" />
            <h3 className="font-bold text-purple-900">Умная интеграция</h3>
          </div>
          <ul className="text-sm text-purple-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Работает с Яндекс.Станцией и смартфонами</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Понимает контекст ваших запросов</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Быстрые действия без открытия приложения</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Голосовые уведомления о важных событиях</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-20">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95">
            <CalendarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">События</p>
          </button>
          <button className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95">
            <UserGroupIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Няня</p>
          </button>
          <button className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95">
            <MapPinIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">Карта</p>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

