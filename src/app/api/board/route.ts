import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/board - получить список объявлений
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const status = searchParams.get('status') || 'active';
    const authorId = searchParams.get('authorId'); // для получения своих объявлений

    // Фильтры
    const where: any = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (city && city !== 'Все города') {
      where.city = city;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }

    const posts = await prisma.boardPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        responses: {
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
        },
        selectedResponder: {
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

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching board posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board posts' },
      { status: 500 }
    );
  }
}

// POST /api/board - создать новое объявление
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      authorId,
      type,
      title,
      description,
      city,
      district,
      dateFrom,
      dateUntil
    } = body;

    // Валидация обязательных полей
    if (!authorId || !type || !description || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: authorId, type, description, city' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: authorId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Создание объявления
    const post = await prisma.boardPost.create({
      data: {
        authorId,
        type,
        title,
        description,
        city,
        district,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateUntil: dateUntil ? new Date(dateUntil) : null,
        status: 'active',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        responses: true,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating board post:', error);
    return NextResponse.json(
      { error: 'Failed to create board post' },
      { status: 500 }
    );
  }
}

