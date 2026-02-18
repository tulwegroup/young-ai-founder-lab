import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    
    const inventions = await db.invention.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(inventions);
  } catch (error) {
    console.error('Error fetching inventions:', error);
    return NextResponse.json({ error: 'Failed to fetch inventions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();
    
    const invention = await db.invention.create({
      data: {
        studentId,
        title: body.title,
        problemSolved: body.problemSolved,
        noveltyDesc: body.noveltyDesc,
        architectureDesc: body.architectureDesc,
        prototypeLink: body.prototypeLink,
        status: body.status || 'idea',
        patentable: body.patentable || false,
        weekCreated: body.weekCreated,
      }
    });
    
    // Update student stats
    await db.student.update({
      where: { id: studentId },
      data: {
        totalInventions: { increment: 1 }
      }
    });
    
    return NextResponse.json(invention);
  } catch (error) {
    console.error('Error creating invention:', error);
    return NextResponse.json({ error: 'Failed to create invention' }, { status: 500 });
  }
}
