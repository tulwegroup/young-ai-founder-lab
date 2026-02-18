import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all missions
export async function GET() {
  try {
    const missions = await db.mission.findMany({
      orderBy: { weekNumber: 'asc' },
      select: {
        id: true,
        weekNumber: true,
        title: true,
        category: true,
        difficulty: true,
        estimatedHours: true,
      }
    });
    
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}
