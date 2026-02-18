import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    
    // Get or create session
    let session = await db.mentorSession.findFirst({
      where: { studentId },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (!session) {
      session = await db.mentorSession.create({
        data: {
          studentId,
          messages: JSON.stringify([]),
          context: 'general'
        }
      });
    }
    
    return NextResponse.json({
      sessionId: session.id,
      messages: session.messages
    });
  } catch (error) {
    console.error('Error fetching mentor session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    
    await db.mentorSession.deleteMany({
      where: { studentId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing sessions:', error);
    return NextResponse.json({ error: 'Failed to clear sessions' }, { status: 500 });
  }
}
