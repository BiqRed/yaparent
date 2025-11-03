'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/solid';

const steps = [
  {
    id: 1,
    emoji: '👋',
    title: 'Добро пожаловать!',
    description: 'Ya Родители помогает находить друзей среди родителей с детьми похожего возраста',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 2,
    emoji: '🎯',
    title: 'Smart Match',
    description: 'Свайпайте профили родителей и находите совпадения по интересам и геолокации',
    color: 'from-red-400 to-pink-600'
  },
  {
    id: 3,
    emoji: '👶',
    title: 'Групповая няня',
    description: 'Делите стоимость няни с другими семьями и экономьте до 70%',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 4,
    emoji: '🗺️',
    title: 'Live-карта',
    description: 'Смотрите, кто из родителей и нянь онлайн рядом с вами прямо сейчас',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 5,
    emoji: '📋',
    title: 'Доска объявлений',
    description: 'Публикуйте объявления и находите помощь, няню или новых друзей',
    color: 'from-purple-400 to-blue-600'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/match');
    }
  };

  const handleSkip = () => {
    router.push('/match');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-[#FF3B30] transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-gray-500 font-semibold hover:text-gray-700 transition-colors"
        >
          Пропустить
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Emoji Icon */}
          <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-7xl shadow-2xl`}>
            {step.emoji}
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {step.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-[#FF3B30]'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <div className="p-6 space-y-3">
        <button
          onClick={handleNext}
          className="w-full bg-[#FF3B30] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#FF2D1F] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {currentStep < steps.length - 1 ? (
            <>
              Далее
              <ChevronRightIcon className="w-5 h-5" />
            </>
          ) : (
            <>
              Начать знакомства
              <CheckIcon className="w-5 h-5" />
            </>
          )}
        </button>

        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 active:scale-95 transition-all"
          >
            Назад
          </button>
        )}
      </div>
    </div>
  );
}

