import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/board/[id] - обновить объявление (закрыть, выбрать исполнителя)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных параметров
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    console.log('[PATCH /api/board/[id]] Starting update for post:', id);
    
    const body = await request.json();
    const { status, selectedResponderId, authorId } = body;
    
    console.log('[PATCH /api/board/[id]] Request body:', { status, selectedResponderId, authorId });

    // Проверка существования объявления
    const post = await prisma.boardPost.findUnique({
      where: { id }
    });

    if (!post) {
      console.error('[PATCH /api/board/[id]] Post not found:', id);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log('[PATCH /api/board/[id]] Found post:', { id: post.id, authorId: post.authorId });

    // Проверка прав (только автор может обновлять)
    if (authorId && post.authorId !== authorId) {
      console.error('[PATCH /api/board/[id]] Authorization failed:', { 
        postAuthorId: post.authorId, 
        requestAuthorId: authorId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to update this post' },
        { status: 403 }
      );
    }

    // Обновление объявления
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (selectedResponderId !== undefined) {
      updateData.selectedResponderId = selectedResponderId;
      // Если выбран исполнитель, закрываем объявление
      if (selectedResponderId) {
        updateData.status = 'closed';
      }
    }

    console.log('[PATCH /api/board/[id]] Update data:', updateData);

    const updatedPost = await prisma.boardPost.update({
      where: { id },
      data: updateData,
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
    });

    console.log('[PATCH /api/board/[id]] Successfully updated post:', updatedPost.id);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('[PATCH /api/board/[id]] Error updating board post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PATCH /api/board/[id]] Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update board post', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/board/[id] - удалить объявление
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных параметров
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get('authorId');

    // Проверка существования объявления
    const post = await prisma.boardPost.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Проверка прав (только автор может удалять)
    if (authorId && post.authorId !== authorId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Удаление объявления (каскадно удалятся и отклики)
    await prisma.boardPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board post:', error);
    return NextResponse.json(
      { error: 'Failed to delete board post' },
      { status: 500 }
    );
  }
}

// GET /api/board/[id] - получить одно объявление
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных параметров
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    const post = await prisma.boardPost.findUnique({
      where: { id },
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
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await prisma.boardPost.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching board post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board post' },
      { status: 500 }
    );
  }
}

