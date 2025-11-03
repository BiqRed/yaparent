import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('=== POST /api/auth/login ===');
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        password: true,
        userType: true,
        location: true,
        birthDate: true,
        photoUrl: true,
        avatar: true,
        bio: true,
        interests: true,
        kids: true,
        latitude: true,
        longitude: true,
        friends: true,
        karma: true,
        rating: true,
        online: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // TODO: In production, use bcrypt to compare hashed passwords
    // For now, comparing plain text or simple hashed format
    const isPasswordValid =
      user.password === password ||
      user.password === `hashed_${password}`;
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update user online status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        online: true,
        lastActiveAt: new Date(),
      },
    });

    console.log('Login successful for:', user.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Parse JSON fields
    const userData = {
      ...userWithoutPassword,
      interests: user.interests ? JSON.parse(user.interests) : [],
      kids: user.kids ? JSON.parse(user.kids) : [],
      friends: user.friends ? JSON.parse(user.friends) : [],
    };

    return NextResponse.json({
      user: userData,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}