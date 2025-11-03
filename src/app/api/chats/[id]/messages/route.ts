import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Отключаем кэширование для этого роута
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Временный ID текущего пользователя
const CURRENT_USER_ID = 'me@example.com';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await context.params;
    console.log('=== GET /api/chats/[id]/messages ===');
    console.log('Match ID:', matchId);

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });
    console.log('Current user:', currentUser?.id, currentUser?.name);

    if (!currentUser) {
      console.log('ERROR: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем матч
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: true,
        user2: true,
      },
    });
    console.log('Match found:', !!match);

    if (!match) {
      console.log('ERROR: Match not found with ID:', matchId);
      // Проверим все матчи в базе
      const allMatches = await prisma.match.findMany({
        select: { id: true },
        take: 5,
      });
      console.log('Available match IDs:', allMatches.map(m => m.id));
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Проверяем, что пользователь участвует в этом матче
    if (match.user1Id !== currentUser.id && match.user2Id !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const otherUser = match.user1Id === currentUser.id ? match.user2 : match.user1;

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: {
        matchId,
      },
      include: {
        reactions: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Отмечаем сообщения как прочитанные
    await prisma.message.updateMany({
      where: {
        matchId,
        receiverId: currentUser.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Форматируем сообщения
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      sender: msg.senderId === currentUser.id ? 'me' : 'other',
      text: msg.content,
      time: new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      reactions: msg.reactions.map((r) => ({
        id: r.id,
        emoji: r.emoji,
        userId: r.userId,
        userName: r.user.name,
      })),
    }));

    return NextResponse.json({
      messages: formattedMessages,
      contact: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
        avatar: otherUser.avatar,
        online: otherUser.online,
        phone: otherUser.phone,
      },
      currentUserId: currentUser.id,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await context.params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем матч
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Определяем получателя
    const receiverId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id;

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: currentUser.id,
        receiverId,
        content: content.trim(),
      },
      include: {
        reactions: {
          include: {
            user: true,
          },
        },
      },
    });

    // Форматируем ответ
    const formattedMessage = {
      id: message.id,
      sender: 'me' as const,
      text: message.content,
      time: new Date(message.createdAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      reactions: [],
    };

    return NextResponse.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

