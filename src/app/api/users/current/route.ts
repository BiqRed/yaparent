import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== GET /api/users/current ===');
    console.log('Email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email },
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.email);

    // Parse JSON fields
    const userData = {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
      kids: user.kids ? JSON.parse(user.kids) : [],
      friends: user.friends ? JSON.parse(user.friends) : [],
    };

    // Get user's reviews and bookings
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        fromUserId: true,
        fromUserName: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: user.id },
          { nannyId: user.id },
        ],
      },
      select: {
        id: true,
        clientId: true,
        date: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      user: {
        ...userData,
        reviews: reviews.map((r: any) => ({
          ...r,
          date: r.createdAt.toISOString(),
        })),
        bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}