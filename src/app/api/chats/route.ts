import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Временный ID текущего пользователя (в реальном приложении будет из сессии)
const CURRENT_USER_ID = 'me@example.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail } = body;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'userId or userEmail is required' }, { status: 400 });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Находим целевого пользователя по ID или email
    let targetUser;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      targetUser = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Проверяем, существует ли уже матч
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            user1Id: currentUser.id,
            user2Id: targetUser.id,
          },
          {
            user1Id: targetUser.id,
            user2Id: currentUser.id,
          },
        ],
      },
    });

    if (existingMatch) {
      return NextResponse.json({ 
        matchId: existingMatch.id,
        message: 'Match already exists',
      });
    }

    // Создаем новый матч
    const match = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: targetUser.id,
        active: true,
      },
    });

    return NextResponse.json({ 
      matchId: match.id,
      message: 'Match created successfully',
    });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем все матчи пользователя
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
        active: true,
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
    });

    // Форматируем данные для фронтенда
    const chats = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.user1Id === currentUser.id ? match.user2 : match.user1;
        const lastMessage = match.messages[0];

        // Подсчитываем непрочитанные сообщения
        const unreadCount = await prisma.message.count({
          where: {
            matchId: match.id,
            receiverId: currentUser.id,
            read: false,
          },
        });

        return {
          id: match.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          online: otherUser.online,
          lastMessage: lastMessage?.content || '',
          time: lastMessage
            ? new Date(lastMessage.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          unread: unreadCount,
          type: 'personal' as const,
          userId: otherUser.id,
          userEmail: otherUser.email,
          phone: otherUser.phone,
        };
      })
    );

    return NextResponse.json({ chats, currentUserId: currentUser.id });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

