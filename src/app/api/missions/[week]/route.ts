import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ week: string }> }
) {
  try {
    const { week } = await params;
    const weekNumber = parseInt(week);
    
    const mission = await db.mission.findUnique({
      where: { weekNumber }
    });
    
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }
    
    return NextResponse.json(mission);
  } catch (error) {
    console.error('Error fetching mission:', error);
    return NextResponse.json({ error: 'Failed to fetch mission' }, { status: 500 });
  }
}
