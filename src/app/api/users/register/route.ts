import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, photoUrl } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Пользователь уже существует, возвращаем его данные
      return NextResponse.json({ 
        user: existingUser,
        message: 'User already exists',
      });
    }

    // Создаем нового пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        avatar: photoUrl || '👤',
        online: true,
      },
    });

    return NextResponse.json({ 
      user,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

