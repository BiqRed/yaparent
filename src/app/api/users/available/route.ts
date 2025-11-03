import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Временный ID текущего пользователя
const CURRENT_USER_ID = 'me@example.com';

export async function GET() {
  try {
    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем всех пользователей, с которыми уже есть матч
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
        active: true,
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    // Собираем ID пользователей, с которыми уже есть матчи
    const matchedUserIds = new Set<string>();
    existingMatches.forEach((match) => {
      if (match.user1Id !== currentUser.id) {
        matchedUserIds.add(match.user1Id);
      }
      if (match.user2Id !== currentUser.id) {
        matchedUserIds.add(match.user2Id);
      }
    });

    // Получаем всех пользователей, кроме текущего и тех, с кем уже есть матч
    const availableUsers = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.id,
          notIn: Array.from(matchedUserIds),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        online: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ users: availableUsers });
  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

