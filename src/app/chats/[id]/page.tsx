'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  FaceSmileIcon
} from '@heroicons/react/24/solid';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  reactions: Reaction[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  online: boolean;
  phone?: string;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Получаем ID чата из params
  useEffect(() => {
    params.then(p => setChatId(p.id));
  }, [params]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch messages:', response.status);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      setContact(data.contact);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages();

    // Перезагружаем сообщения при возврате на страницу
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() && !sending && chatId) {
      setSending(true);
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: inputText }),
        });
        
        const data = await response.json();
        setMessages([...messages, data.message]);
        setInputText('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });
      
      const data = await response.json();
      
      // Обновляем сообщения с новой реакцией
      setMessages(messages.map(msg => {
        if (msg.id === messageId) {
          if (data.action === 'added') {
            return {
              ...msg,
              reactions: [...msg.reactions, data.reaction],
            };
          } else {
            return {
              ...msg,
              reactions: msg.reactions.filter(r => r.id !== data.reactionId),
            };
          }
        }
        return msg;
      }));
      
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePhoneCall = () => {
    if (contact?.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Чат не найден</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <Link href={`/profile/${encodeURIComponent(contact.email)}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl">
              {contact.avatar}
            </div>
            {contact.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{contact.name}</h2>
            {contact.online && <p className="text-xs text-green-600">онлайн</p>}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Audio Call Button */}
          <button 
            onClick={handlePhoneCall}
            disabled={!contact.phone}
            className={`p-2 rounded-lg transition-colors ${
              contact.phone 
                ? 'hover:bg-gray-100 text-gray-600' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title={contact.phone ? `Позвонить на ${contact.phone}` : 'Номер телефона недоступен'}
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
          
          {/* Video Call Button - Disabled */}
          <button 
            disabled
            className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
            title="Видеозвонки временно недоступны"
          >
            <VideoCameraIcon className="w-5 h-5" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="relative group max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.sender === 'me'
                    ? 'bg-[#FF3B30] text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'me' ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  {message.time}
                </p>
              </div>

              {/* Reactions */}
              {message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(
                    message.reactions.reduce((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      className="bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>{emoji}</span>
                      {count > 1 && <span className="text-gray-600">{count}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Reaction Picker */}
              <div className={`absolute ${message.sender === 'me' ? 'right-0' : 'left-0'} -top-10 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <button
                  onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                  className="bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-50 border border-gray-200"
                >
                  <FaceSmileIcon className="w-4 h-4 text-gray-600" />
                </button>

                {showReactionPicker === message.id && (
                  <div className="absolute top-10 bg-white shadow-xl rounded-xl p-2 flex gap-1 border border-gray-200 z-10">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="hover:bg-gray-100 rounded-lg p-2 text-xl transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <PlusCircleIcon className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Сообщение..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF3B30] disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className={`p-2 rounded-full transition-all ${
              inputText.trim() && !sending
                ? 'bg-[#FF3B30] text-white hover:bg-[#FF2D1F] active:scale-95'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

