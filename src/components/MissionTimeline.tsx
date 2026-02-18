'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Clock, Star, Zap, Lock, CheckCircle2,
  Circle, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Mission {
  id: string;
  weekNumber: number;
  title: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
}

interface MissionTimelineProps {
  currentWeek: number;
  onSelectMission: (week: number) => void;
}

const categoryColors: Record<string, string> = {
  AI: 'from-purple-500 to-violet-600',
  OS: 'from-pink-500 to-rose-600',
  Game: 'from-orange-500 to-red-600',
  Infrastructure: 'from-blue-500 to-cyan-600',
  Architecture: 'from-green-500 to-emerald-600',
  Distributed: 'from-indigo-500 to-purple-600',
  Innovation: 'from-yellow-500 to-amber-600',
  Capstone: 'from-gradient-500 to-pink-600',
};

const difficultyBadgeColors: Record<string, string> = {
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function MissionTimeline({ currentWeek, onSelectMission }: MissionTimelineProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/missions');
      if (res.ok) {
        const data = await res.json();
        setMissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMissionStatus = (week: number) => {
    if (week < currentWeek) return 'completed';
    if (week === currentWeek) return 'current';
    if (week === currentWeek + 1) return 'available';
    return 'locked';
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

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300">
            {missions.length} Missions
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Current: Week {currentWeek}
          </Badge>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className={viewMode === 'timeline' ? 'bg-purple-500 hover:bg-purple-600' : 'text-slate-400'}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-500 hover:bg-purple-600' : 'text-slate-400'}
          >
            Grid
          </Button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="relative pl-8">
            {/* Timeline Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700" />
            
            {missions.map((mission, index) => {
              const status = getMissionStatus(mission.weekNumber);
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "relative mb-4",
                    isEven ? "ml-8" : "ml-8"
                  )}
                >
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute left-[-26px] top-4 w-4 h-4 rounded-full border-2",
                    status === 'completed' && "bg-green-500 border-green-400",
                    status === 'current' && "bg-purple-500 border-purple-400 animate-pulse",
                    status === 'available' && "bg-blue-500 border-blue-400",
                    status === 'locked' && "bg-slate-700 border-slate-600"
                  )}>
                    {status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
                    )}
                  </div>

                  <Card className={cn(
                    "bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer",
                    status === 'locked' && "opacity-50",
                    status === 'current' && "border-purple-500/50 bg-purple-500/10"
                  )}
                    onClick={() => status !== 'locked' && onSelectMission(mission.weekNumber)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-500">Week {mission.weekNumber}</span>
                            <Badge className={cn("text-xs", difficultyBadgeColors[mission.difficulty] || difficultyBadgeColors.advanced)}>
                              {mission.difficulty}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white truncate">{mission.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {mission.estimatedHours}h
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-xs bg-gradient-to-r",
                              categoryColors[mission.category] || 'from-slate-500 to-slate-600',
                              "text-white border-0"
                            )}>
                              {mission.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {status === 'current' && (
                            <Badge className="bg-purple-500 animate-pulse">
                              Current
                            </Badge>
                          )}
                          {status === 'available' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              Next
                            </Badge>
                          )}
                          {status === 'locked' && (
                            <Lock className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {missions.map((mission, index) => {
            const status = getMissionStatus(mission.weekNumber);
            
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className={cn(
                  "bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer h-full",
                  status === 'locked' && "opacity-50",
                  status === 'current' && "border-purple-500/50 bg-purple-500/10"
                )}
                  onClick={() => status !== 'locked' && onSelectMission(mission.weekNumber)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-300">
                        Week {mission.weekNumber}
                      </Badge>
                      {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {status === 'current' && <Zap className="w-4 h-4 text-purple-400 animate-pulse" />}
                      {status === 'locked' && <Lock className="w-4 h-4 text-slate-600" />}
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{mission.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", difficultyBadgeColors[mission.difficulty] || difficultyBadgeColors.advanced)}>
                        {mission.difficulty}
                      </Badge>
                      <span className="text-xs text-slate-400">{mission.estimatedHours}h</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
