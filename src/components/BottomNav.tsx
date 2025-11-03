'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  MegaphoneIcon,
  UserCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon,
  MegaphoneIcon as MegaphoneSolidIcon,
  UserCircleIcon as UserCircleSolidIcon,
  UserGroupIcon as UserGroupSolidIcon
} from '@heroicons/react/24/solid';

const navItems = [
  {
    name: 'Подбор',
    href: '/match',
    icon: HeartIcon,
    activeIcon: HeartSolidIcon
  },
  {
    name: 'Связи',
    href: '/connections',
    icon: UserGroupIcon,
    activeIcon: UserGroupSolidIcon
  },
  {
    name: 'Чаты',
    href: '/chats',
    icon: ChatBubbleLeftIcon,
    activeIcon: ChatBubbleLeftSolidIcon
  },
  {
    name: 'Доска',
    href: '/sos',
    icon: MegaphoneIcon,
    activeIcon: MegaphoneSolidIcon
  },
  {
    name: 'Профиль',
    href: '/profile',
    icon: UserCircleIcon,
    activeIcon: UserCircleSolidIcon
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-[#FF3B30]' : 'text-gray-500'
                }`}
              />
              <span className={`text-xs ${
                isActive ? 'text-[#FF3B30] font-semibold' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

