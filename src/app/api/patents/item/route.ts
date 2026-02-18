import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const patent = await db.patentIdea.update({
      where: { id },
      data: {
        title: body.title,
        problemStatement: body.problemStatement,
        currentSolutions: body.currentSolutions,
        newApproach: body.newApproach,
        advantages: body.advantages,
        stage: body.stage,
        provisionalDraft: body.provisionalDraft,
      }
    });
    
    return NextResponse.json(patent);
  } catch (error) {
    console.error('Error updating patent:', error);
    return NextResponse.json({ error: 'Failed to update patent' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    await db.patentIdea.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patent:', error);
    return NextResponse.json({ error: 'Failed to delete patent' }, { status: 500 });
  }
}
