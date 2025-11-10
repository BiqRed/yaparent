import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== PUT /api/users/current ===');
    console.log('Email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Update data:', body);

    // Find user first
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Basic fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl;
    if (body.bio !== undefined) updateData.bio = body.bio;

    // JSON fields for parents
    if (body.kids !== undefined) {
      updateData.kids = JSON.stringify(body.kids);
    }
    if (body.interests !== undefined) {
      updateData.interests = JSON.stringify(body.interests);
    }

    // For nanny-specific fields, we'll store them in the bio as a JSON object
    // or we can extend the schema later
    if (existingUser.userType === 'nanny') {
      // Store nanny-specific data in a structured way
      const nannyData: any = {};
      
      if (body.hourlyRate !== undefined) nannyData.hourlyRate = body.hourlyRate;
      if (body.experience !== undefined) nannyData.experience = body.experience;
      if (body.education !== undefined) nannyData.education = body.education;
      if (body.ageRange !== undefined) nannyData.ageRange = body.ageRange;
      if (body.specializations !== undefined) nannyData.specializations = body.specializations;
      if (body.certifications !== undefined) nannyData.certifications = body.certifications;
      if (body.languages !== undefined) nannyData.languages = body.languages;
      if (body.availableHours !== undefined) nannyData.availableHours = body.availableHours;

      // Store in interests field as JSON (we'll use it for nanny data)
      if (Object.keys(nannyData).length > 0) {
        updateData.interests = JSON.stringify(nannyData);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    console.log('User updated successfully');

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    let userData: any = {
      ...user,
      kids: user.kids ? JSON.parse(user.kids) : [],
      friends: user.friends ? JSON.parse(user.friends) : [],
    };

    // Handle interests field differently for nannies and parents
    if (user.userType === 'nanny' && user.interests) {
      try {
        const nannyData = JSON.parse(user.interests);
        // If it's nanny data (has hourlyRate, experience, etc.)
        if (nannyData.hourlyRate || nannyData.experience) {
          userData = {
            ...userData,
            ...nannyData,
            interests: [], // Clear interests for nannies
          };
        } else {
          userData.interests = Array.isArray(nannyData) ? nannyData : [];
        }
      } catch {
        userData.interests = [];
      }
    } else {
      userData.interests = user.interests ? JSON.parse(user.interests) : [];
    }

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