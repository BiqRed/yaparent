import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Временный ID текущего пользователя
const CURRENT_USER_ID = 'me@example.com';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await context.params;
    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем, существует ли сообщение
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Проверяем, есть ли уже такая реакция от этого пользователя
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: currentUser.id,
        emoji,
      },
    });

    if (existingReaction) {
      // Если реакция уже есть, удаляем её (toggle)
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return NextResponse.json({ 
        action: 'removed',
        reactionId: existingReaction.id,
      });
    }

    // Создаем новую реакцию
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: currentUser.id,
        emoji,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      action: 'added',
      reaction: {
        id: reaction.id,
        emoji: reaction.emoji,
        userId: reaction.userId,
        userName: reaction.user.name,
      },
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await context.params;
    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Получаем текущего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { email: CURRENT_USER_ID },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Находим и удаляем реакцию
    const reaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: currentUser.id,
        emoji,
      },
    });

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    await prisma.messageReaction.delete({
      where: {
        id: reaction.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

