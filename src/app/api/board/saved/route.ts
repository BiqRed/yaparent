import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/board/saved - получить сохраненные объявления пользователя
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Получаем сохраненные посты пользователя
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
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
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Возвращаем только посты с флагом saved: true
    const posts = savedPosts.map(sp => ({ ...sp.post, saved: true }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}

// POST /api/board/saved - сохранить объявление
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, postId } = body;

    // Валидация обязательных полей
    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, postId' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

    // Проверка, не сохранено ли уже объявление
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingSave) {
      return NextResponse.json(
        { error: 'Post already saved' },
        { status: 400 }
      );
    }

    // Создание записи о сохранении
    const savedPost = await prisma.savedPost.create({
      data: {
        userId,
        postId
      }
    });

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

// DELETE /api/board/saved - удалить объявление из избранного
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    // Валидация обязательных полей
    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, postId' },
        { status: 400 }
      );
    }

    // Проверка существования записи
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (!savedPost) {
      return NextResponse.json(
        { error: 'Saved post not found' },
        { status: 404 }
      );
    }

    // Удаление записи
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    return NextResponse.json({ message: 'Post removed from saved' });
  } catch (error) {
    console.error('Error removing saved post:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved post' },
      { status: 500 }
    );
  }
}

