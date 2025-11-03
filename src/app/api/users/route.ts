import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserEmail = searchParams.get('currentUserEmail');
    const userType = searchParams.get('userType');

    console.log('=== GET /api/users ===');
    console.log('Current user:', currentUserEmail);
    console.log('Filter by userType:', userType);

    // Строим фильтр
    const where: any = {};
    
    // Исключаем текущего пользователя
    if (currentUserEmail) {
      where.email = { not: currentUserEmail };
    }
    
    // Фильтр по типу пользователя
    if (userType) {
      where.userType = userType;
    }

    // Получаем пользователей
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        photoUrl: true,
        userType: true,
        location: true,
        birthDate: true,
        bio: true,
        interests: true,
        kids: true,
        latitude: true,
        longitude: true,
        friends: true,
        karma: true,
        rating: true,
        online: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${users.length} users`);

    // Парсим JSON поля
    const usersWithParsedData = users.map(user => ({
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
      kids: user.kids ? JSON.parse(user.kids) : [],
      friends: user.friends ? JSON.parse(user.friends) : [],
    }));

    return NextResponse.json({ 
      users: usersWithParsedData,
      count: users.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}