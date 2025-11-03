'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

const quickLinks = [
  { name: 'Афиша', href: '/events', icon: CalendarIcon, color: 'bg-blue-500' },
  { name: 'Няня', href: '/nanny', icon: UserGroupIcon, color: 'bg-green-500' },
  { name: 'AI помощь', href: '/ai-assistant', icon: SparklesIcon, color: 'bg-purple-500' },
];

export default function TopMenu() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
            >
              <div className={`w-6 h-6 ${link.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

