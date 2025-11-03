import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      name, 
      phone, 
      password,
      userType,
      location,
      birthDate,
      photoUrl,
      bio,
      interests,
      kids,
      latitude,
      longitude
    } = body;

    console.log('=== POST /api/users/register ===');
    console.log('Registering user:', email, name, userType);

    if (!email || !name || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, name, password and userType are required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Создаем нового пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        password, // В реальном приложении нужно хешировать!
        userType,
        location: location || null,
        birthDate: birthDate || null,
        photoUrl: photoUrl || null,
        avatar: photoUrl || (userType === 'parent' ? '👨‍👩‍👧‍👦' : '👶'),
        bio: bio || null,
        interests: interests ? JSON.stringify(interests) : null,
        kids: kids ? JSON.stringify(kids) : null,
        latitude: latitude || null,
        longitude: longitude || null,
        friends: JSON.stringify([]),
        online: true,
      },
    });

    console.log('User created successfully:', user.id, user.email);

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
