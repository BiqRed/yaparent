import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: userId } = await params;

    console.log('=== PATCH /api/users/[id] ===');
    console.log('User ID:', userId);
    console.log('Update data:', body);

    // Build update data
    const updateData: any = {};

    if (body.friends !== undefined) {
      updateData.friends = JSON.stringify(body.friends);
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio;
    }
    if (body.interests !== undefined) {
      updateData.interests = JSON.stringify(body.interests);
    }
    if (body.kids !== undefined) {
      updateData.kids = JSON.stringify(body.kids);
    }
    if (body.location !== undefined) {
      updateData.location = body.location;
    }
    if (body.birthDate !== undefined) {
      updateData.birthDate = body.birthDate;
    }
    if (body.photoUrl !== undefined) {
      updateData.photoUrl = body.photoUrl;
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone;
    }
    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('User updated successfully:', user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    console.log('=== GET /api/users/[id] ===');
    console.log('User ID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Parse JSON fields
    const userData = {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
      kids: user.kids ? JSON.parse(user.kids) : [],
      friends: user.friends ? JSON.parse(user.friends) : [],
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
