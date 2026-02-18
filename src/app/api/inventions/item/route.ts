import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single invention by ID via query param
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const invention = await db.invention.findUnique({
      where: { id }
    });
    
    if (!invention) {
      return NextResponse.json({ error: 'Invention not found' }, { status: 404 });
    }
    
    return NextResponse.json(invention);
  } catch (error) {
    console.error('Error fetching invention:', error);
    return NextResponse.json({ error: 'Failed to fetch invention' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const invention = await db.invention.update({
      where: { id },
      data: {
        title: body.title,
        problemSolved: body.problemSolved,
        noveltyDesc: body.noveltyDesc,
        architectureDesc: body.architectureDesc,
        prototypeLink: body.prototypeLink,
        status: body.status,
        patentable: body.patentable,
      }
    });
    
    return NextResponse.json(invention);
  } catch (error) {
    console.error('Error updating invention:', error);
    return NextResponse.json({ error: 'Failed to update invention' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Get the invention to find studentId
    const invention = await db.invention.findUnique({
      where: { id }
    });
    
    if (invention) {
      await db.student.update({
        where: { id: invention.studentId },
        data: {
          totalInventions: { decrement: 1 }
        }
      });
    }
    
    await db.invention.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invention:', error);
    return NextResponse.json({ error: 'Failed to delete invention' }, { status: 500 });
  }
}
