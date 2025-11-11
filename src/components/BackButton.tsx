'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface BackButtonProps {
  href: string;
  className?: string;
}

// Extend Window interface to include Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        BackButton?: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
      };
    };
  }
}

export default function BackButton({ href, className = '' }: BackButtonProps) {
  const router = useRouter();
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const defaultTextColor = className.includes('text-') ? '' : 'text-white/80 hover:text-white';
  
  useEffect(() => {
    // Check if running in Telegram WebApp
    const isWebApp = typeof window !== 'undefined' &&
                     window.Telegram?.WebApp?.BackButton !== undefined;
    
    setIsTelegramWebApp(isWebApp);
    
    if (isWebApp && window.Telegram?.WebApp?.BackButton) {
      const backButton = window.Telegram.WebApp.BackButton;
      
      // Define the callback function
      const handleBackClick = () => {
        router.push(href);
      };
      
      // Set up the Telegram back button
      backButton.onClick(handleBackClick);
      backButton.show();
      
      // Cleanup function
      return () => {
        backButton.offClick(handleBackClick);
        backButton.hide();
      };
    }
  }, [href, router]);
  
  // If running in Telegram WebApp, don't render the custom button
  if (isTelegramWebApp) {
    return null;
  }
  
  // Render the regular back button for non-WebApp contexts
  return (
    <div className="pt-6 px-6 pb-4">
      <Link
        href={href}
        className={`inline-flex items-center gap-2 ${defaultTextColor} transition-colors ${className}`}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="font-medium">Назад</span>
      </Link>
    </div>
  );
}