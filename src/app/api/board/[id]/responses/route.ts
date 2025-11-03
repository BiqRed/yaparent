import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/board/[id]/responses - создать отклик на объявление
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных параметров
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: postId } = resolvedParams;
    
    console.log('Creating response for post:', postId);
    
    const body = await request.json();
    const { responderId, message } = body;

    console.log('Request body:', { responderId, message });

    // Валидация обязательных полей
    if (!responderId || !message) {
      console.log('Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: responderId, message' },
        { status: 400 }
      );
    }

    // Проверка существования объявления
    const post = await prisma.boardPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Проверка, что объявление активно
    if (post.status !== 'active') {
      return NextResponse.json(
        { error: 'This post is closed' },
        { status: 400 }
      );
    }

    // Проверка, что пользователь не откликается на свое объявление
    if (post.authorId === responderId) {
      return NextResponse.json(
        { error: 'You cannot respond to your own post' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: responderId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверка, не откликался ли уже пользователь
    const existingResponse = await prisma.boardResponse.findFirst({
      where: {
        postId,
        responderId
      }
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: 'You have already responded to this post' },
        { status: 400 }
      );
    }

    // Создание отклика
    const response = await prisma.boardResponse.create({
      data: {
        postId,
        responderId,
        message
      },
      include: {
        responder: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating board response:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create board response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/board/[id]/responses - получить отклики на объявление
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных параметров
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: postId } = resolvedParams;

    // Проверка существования объявления
    const post = await prisma.boardPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Получение откликов
    const responses = await prisma.boardResponse.findMany({
      where: { postId },
      include: {
        responder: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching board responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board responses' },
      { status: 500 }
    );
  }
}

