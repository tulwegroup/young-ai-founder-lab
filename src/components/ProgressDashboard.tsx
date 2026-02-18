'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Trophy, Lightbulb, Target, Clock,
  Calendar, CheckCircle2, Play, Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProgressDashboardProps {
  studentId: string;
}

const categoryColors: Record<string, string> = {
  AI: '#8b5cf6',
  OS: '#ec4899',
  Game: '#f97316',
  Infrastructure: '#3b82f6',
  Architecture: '#22c55e',
  Distributed: '#6366f1',
  Innovation: '#eab308',
  Capstone: '#a855f7',
};

export default function ProgressDashboard({ studentId }: ProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMissions: 52,
    completedMissions: 0,
    inProgressMissions: 0,
    totalInventions: 0,
    engineeringScore: 0,
    currentWeek: 1,
    categoryBreakdown: [] as { category: string; count: number }[],
    weeklyProgress: [] as { week: number; status: string }[],
  });

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress/${studentId}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const completionRate = Math.round((stats.completedMissions / stats.totalMissions) * 100);
  
  const pieData = stats.categoryBreakdown.map(c => ({
    name: c.category,
    value: c.count,
    fill: categoryColors[c.category] || '#64748b'
  }));

  const chartConfig = {
    count: {
      label: "Missions",
    },
  } satisfies ChartConfig;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-400" />
          Progress Dashboard
        </h2>
        <p className="text-slate-400">Track your journey through the curriculum</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.completedMissions}</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgressMissions}</p>
                  <p className="text-sm text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalInventions}</p>
                  <p className="text-sm text-slate-400">Inventions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.engineeringScore}</p>
                  <p className="text-sm text-slate-400">Eng. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Overall Progress */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Overall Progress</CardTitle>
            <CardDescription>Your journey through 52 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Completion Rate</span>
                  <span className="text-purple-400 font-semibold">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300">Current Week</span>
                </div>
                <Badge className="bg-purple-500">Week {stats.currentWeek}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-lg font-bold text-green-400">{stats.completedMissions}</p>
                  <p className="text-xs text-slate-400">Done</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-lg font-bold text-purple-400">{stats.inProgressMissions}</p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-lg font-bold text-slate-400">{stats.totalMissions - stats.completedMissions - stats.inProgressMissions}</p>
                  <p className="text-xs text-slate-400">Remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Category Focus</CardTitle>
            <CardDescription>Missions completed by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {stats.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: categoryColors[cat.category] || '#64748b' }}
                  />
                  <span className="text-slate-400">{cat.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Timeline */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Weekly Journey</CardTitle>
          <CardDescription>Visual progress through all 52 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-13 gap-1">
              {stats.weeklyProgress.map((week, i) => {
                const statusColor = 
                  week.status === 'completed' ? 'bg-green-500' :
                  week.status === 'in_progress' ? 'bg-purple-500' :
                  week.status === 'available' ? 'bg-blue-500/50' :
                  'bg-slate-700';
                
                return (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`
                      w-8 h-8 rounded flex items-center justify-center text-xs font-medium
                      ${statusColor} text-white
                    `}
                    title={`Week ${week.week}: ${week.status}`}
                  >
                    {week.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      week.week
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500/50" />
              <span className="text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-slate-700" />
              <span className="text-slate-400">Locked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Suggestions */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border-purple-500/30 mt-6">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Next Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { goal: 'Complete Week 1', reward: 'First Steps', progress: stats.currentWeek >= 1 ? 100 : 0 },
              { goal: 'Create 3 Inventions', reward: 'Inventor Badge', progress: Math.min(100, (stats.totalInventions / 3) * 100) },
              { goal: 'Reach Engineering Score 25', reward: 'Rising Engineer', progress: Math.min(100, (stats.engineeringScore / 25) * 100) },
            ].map((milestone, i) => (
              <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">{milestone.goal}</span>
                  {milestone.progress === 100 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                </div>
                <Progress value={milestone.progress} className="h-2 mb-1" />
                <p className="text-xs text-slate-500">{milestone.reward}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
