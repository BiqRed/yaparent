import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Временный ID текущего пользователя
const CURRENT_USER_EMAIL = 'me@example.com';

export async function GET() {
  try {
    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_EMAIL },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        online: true,
        karma: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: currentUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

