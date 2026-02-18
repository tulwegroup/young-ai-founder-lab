import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get or create student
export async function GET() {
  try {
    // Get the first student (single user app)
    const student = await db.student.findFirst();
    
    if (!student) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, difficultyLevel } = body;
    
    // Check if student already exists
    const existing = await db.student.findFirst();
    if (existing) {
      return NextResponse.json(existing);
    }
    
    const student = await db.student.create({
      data: {
        name,
        age,
        difficultyLevel,
        currentWeek: 1,
        totalMissionsDone: 0,
        totalInventions: 0,
        engineeringScore: 0,
      }
    });
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
