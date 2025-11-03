import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get user's reactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== GET /api/users/reactions ===');
    console.log('Email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all reactions given by this user
    const reactions = await prisma.userReaction.findMany({
      where: { fromUserId: user.id },
      include: {
        toUser: {
          select: {
            id: true,
            email: true,
            name: true,
            photoUrl: true,
            avatar: true,
          },
        },
      },
    });

    // Separate by type
    const likes = reactions.filter((r: any) => r.type === 'like').map((r: any) => r.toUser.email);
    const blocks = reactions.filter((r: any) => r.type === 'block').map((r: any) => r.toUser.email);

    console.log(`Found ${likes.length} likes and ${blocks.length} blocks`);

    return NextResponse.json({
      likes,
      blocks,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a reaction (like or block)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromEmail, toEmail, type } = body;

    console.log('=== POST /api/users/reactions ===');
    console.log('From:', fromEmail, 'To:', toEmail, 'Type:', type);

    if (!fromEmail || !toEmail || !type) {
      return NextResponse.json(
        { error: 'fromEmail, toEmail, and type are required' },
        { status: 400 }
      );
    }

    if (!['like', 'block'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "like" or "block"' },
        { status: 400 }
      );
    }

    // Get users
    const fromUser = await prisma.user.findUnique({ where: { email: fromEmail } });
    const toUser = await prisma.user.findUnique({ where: { email: toEmail } });

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if reaction already exists
    const existingReaction = await prisma.userReaction.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      },
    });

    if (existingReaction) {
      // Update existing reaction
      const updated = await prisma.userReaction.update({
        where: {
          fromUserId_toUserId: {
            fromUserId: fromUser.id,
            toUserId: toUser.id,
          },
        },
        data: { type },
      });

      console.log('Reaction updated:', updated.id);
      return NextResponse.json({
        reaction: updated,
        message: 'Reaction updated',
      });
    }

    // Create new reaction
    const reaction = await prisma.userReaction.create({
      data: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        type,
      },
    });

    console.log('Reaction created:', reaction.id);

    // If it's a like, check for mutual match
    if (type === 'like') {
      const mutualReaction = await prisma.userReaction.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: toUser.id,
            toUserId: fromUser.id,
          },
        },
      });

      if (mutualReaction && mutualReaction.type === 'like') {
        // Create a match if it doesn't exist
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: fromUser.id, user2Id: toUser.id },
              { user1Id: toUser.id, user2Id: fromUser.id },
            ],
          },
        });

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              user1Id: fromUser.id,
              user2Id: toUser.id,
              active: true,
            },
          });
          console.log('Match created between', fromUser.email, 'and', toUser.email);
        }
      }
    }

    return NextResponse.json({
      reaction,
      message: 'Reaction created',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a reaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromEmail = searchParams.get('fromEmail');
    const toEmail = searchParams.get('toEmail');

    console.log('=== DELETE /api/users/reactions ===');
    console.log('From:', fromEmail, 'To:', toEmail);

    if (!fromEmail || !toEmail) {
      return NextResponse.json(
        { error: 'fromEmail and toEmail are required' },
        { status: 400 }
      );
    }

    // Get users
    const fromUser = await prisma.user.findUnique({ where: { email: fromEmail } });
    const toUser = await prisma.user.findUnique({ where: { email: toEmail } });

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete reaction
    await prisma.userReaction.delete({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      },
    });

    console.log('Reaction deleted');

    return NextResponse.json({
      message: 'Reaction deleted',
    });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}