import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    
    // Get student info
    const student = await db.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    // Get all progress
    const allProgress = await db.progress.findMany({
      where: { studentId },
      include: { mission: true }
    });
    
    // Calculate stats
    const completedMissions = allProgress.filter(p => p.status === 'completed').length;
    const inProgressMissions = allProgress.filter(p => p.status === 'in_progress').length;
    
    // Category breakdown
    const categoryBreakdown = allProgress
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => {
        const cat = p.mission.category;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const categoryData = Object.entries(categoryBreakdown).map(([category, count]) => ({
      category,
      count
    }));
    
    // Weekly progress
    const weeklyProgress = Array.from({ length: 52 }, (_, i) => {
      const week = i + 1;
      const progress = allProgress.find(p => p.mission.weekNumber === week);
      return {
        week,
        status: progress?.status || (week <= student.currentWeek + 1 ? 'available' : 'locked')
      };
    });
    
    return NextResponse.json({
      totalMissions: 52,
      completedMissions,
      inProgressMissions,
      totalInventions: student.totalInventions,
      engineeringScore: student.engineeringScore,
      currentWeek: student.currentWeek,
      categoryBreakdown: categoryData,
      weeklyProgress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
