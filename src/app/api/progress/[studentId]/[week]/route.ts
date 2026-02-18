import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; week: string }> }
) {
  try {
    const { studentId, week } = await params;
    const weekNumber = parseInt(week);
    
    // Get mission
    const mission = await db.mission.findUnique({
      where: { weekNumber }
    });
    
    if (!mission) {
      return NextResponse.json({ status: 'available' });
    }
    
    // Get progress
    const progress = await db.progress.findUnique({
      where: {
        studentId_missionId: {
          studentId,
          missionId: mission.id
        }
      }
    });
    
    return NextResponse.json(progress || { status: 'available' });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; week: string }> }
) {
  try {
    const { studentId, week } = await params;
    const weekNumber = parseInt(week);
    const body = await request.json();
    
    // Get mission
    const mission = await db.mission.findUnique({
      where: { weekNumber }
    });
    
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }
    
    // Upsert progress
    const progress = await db.progress.upsert({
      where: {
        studentId_missionId: {
          studentId,
          missionId: mission.id
        }
      },
      create: {
        studentId,
        missionId: mission.id,
        status: body.status || 'in_progress',
        notes: body.notes,
        buildLink: body.buildLink,
        reflectionNotes: body.reflectionNotes,
        selfAssessment: body.selfAssessment,
        startedAt: body.status === 'in_progress' ? new Date() : undefined,
        completedAt: body.status === 'completed' ? new Date() : undefined,
      },
      update: {
        status: body.status || undefined,
        notes: body.notes ?? undefined,
        buildLink: body.buildLink ?? undefined,
        reflectionNotes: body.reflectionNotes ?? undefined,
        selfAssessment: body.selfAssessment ?? undefined,
        startedAt: body.status === 'in_progress' ? new Date() : undefined,
        completedAt: body.status === 'completed' ? new Date() : undefined,
      }
    });
    
    // Update student stats if mission completed
    if (body.status === 'completed') {
      const student = await db.student.findUnique({
        where: { id: studentId }
      });
      
      if (student) {
        const newScore = Math.min(100, student.engineeringScore + 2);
        await db.student.update({
          where: { id: studentId },
          data: {
            totalMissionsDone: { increment: 1 },
            engineeringScore: newScore,
            currentWeek: Math.max(student.currentWeek, weekNumber + 1)
          }
        });
      }
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
