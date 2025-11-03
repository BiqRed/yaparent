import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/users/[id]/karma - получить карму пользователя
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await prisma.user.findUnique({
      where: { email: params.id },
      select: { karma: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ karma: user.karma });
  } catch (error) {
    console.error('Error fetching user karma:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users/[id]/karma - добавить карму пользователю
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid karma amount' }, { status: 400 });
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Обновляем карму
    const updatedUser = await prisma.user.update({
      where: { email: params.id },
      data: {
        karma: {
          increment: amount,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        karma: true,
      },
    });

    return NextResponse.json({
      success: true,
      karma: updatedUser.karma,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user karma:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

