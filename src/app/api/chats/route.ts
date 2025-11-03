import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, currentUserEmail } = body;

    console.log('=== POST /api/chats ===');
    console.log('Body:', { userId, userEmail, currentUserEmail });

    if (!userEmail && !userId) {
      return NextResponse.json({ error: 'userEmail or userId is required' }, { status: 400 });
    }

    if (!currentUserEmail) {
      return NextResponse.json({ error: 'currentUserEmail is required' }, { status: 400 });
    }

    // Получаем или создаем текущего пользователя в БД
    let currentUser = await prisma.user.findUnique({
      where: { email: currentUserEmail },
    });

    if (!currentUser) {
      console.log('Creating current user:', currentUserEmail);
      // Если пользователя нет в БД, создаем его
      currentUser = await prisma.user.create({
        data: {
          email: currentUserEmail,
          name: 'User', // Будет обновлено позже
          avatar: '👤',
          online: true,
        },
      });
    }
    console.log('Current user:', currentUser.id, currentUser.email);

    // Находим или создаем целевого пользователя
    // Используем userEmail, если он есть, иначе ищем по userId
    let targetUser = userEmail
      ? await prisma.user.findUnique({ where: { email: userEmail } })
      : await prisma.user.findUnique({ where: { id: userId } });

    if (!targetUser) {
      console.log('Creating target user:', userEmail || userId);
      // Создаем целевого пользователя, если его нет (только если есть email)
      if (userEmail) {
        targetUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: 'User',
            avatar: '👤',
            online: true,
          },
        });
      } else {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }
    }
    console.log('Target user:', targetUser.id, targetUser.email);

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
      console.log('Match already exists:', existingMatch.id);
      return NextResponse.json({
        matchId: existingMatch.id,
        message: 'Match already exists',
      });
    }

    // Создаем новый матч
    console.log('Creating new match between', currentUser.id, 'and', targetUser.id);
    const match = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: targetUser.id,
        active: true,
      },
    });

    console.log('Match created successfully:', match.id);
    return NextResponse.json({
      matchId: match.id,
      message: 'Match created successfully',
    });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserEmail = searchParams.get('currentUserEmail');

    if (!currentUserEmail) {
      return NextResponse.json({ error: 'currentUserEmail is required' }, { status: 400 });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: currentUserEmail },
    });

    if (!currentUser) {
      return NextResponse.json({ chats: [], currentUserId: null });
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

        // Определяем аватар: используем photoUrl если есть, иначе проверяем avatar на эмодзи
        let displayAvatar = otherUser.avatar;
        if (otherUser.photoUrl) {
          displayAvatar = otherUser.photoUrl;
        } else if (!otherUser.avatar || !/[\p{Emoji}]/u.test(otherUser.avatar)) {
          // Если avatar не эмодзи, используем дефолтный эмодзи
          displayAvatar = otherUser.userType === 'nanny' ? '👩‍🏫' : '👨‍👩‍👧‍👦';
        }

        return {
          id: match.id,
          name: otherUser.name,
          avatar: displayAvatar,
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

