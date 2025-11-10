import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  href: string;
  className?: string;
}

export default function BackButton({ href, className = '' }: BackButtonProps) {
  const defaultTextColor = className.includes('text-') ? '' : 'text-white/80 hover:text-white';
  
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