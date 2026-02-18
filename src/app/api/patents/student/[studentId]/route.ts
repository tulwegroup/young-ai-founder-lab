import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    
    const patents = await db.patentIdea.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(patents);
  } catch (error) {
    console.error('Error fetching patents:', error);
    return NextResponse.json({ error: 'Failed to fetch patents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();
    
    const patent = await db.patentIdea.create({
      data: {
        studentId,
        title: body.title,
        problemStatement: body.problemStatement,
        currentSolutions: body.currentSolutions,
        newApproach: body.newApproach,
        advantages: body.advantages,
        stage: body.stage || 1,
      }
    });
    
    return NextResponse.json(patent);
  } catch (error) {
    console.error('Error creating patent:', error);
    return NextResponse.json({ error: 'Failed to create patent' }, { status: 500 });
  }
}
