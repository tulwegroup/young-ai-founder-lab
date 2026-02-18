'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Target, Zap, Star, BookOpen, Wrench,
  Trophy, MessageCircle, Lightbulb, ChevronDown, ChevronUp,
  CheckCircle2, ExternalLink, Play, RotateCcw, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MissionDetailProps {
  weekNumber: number;
  studentId: string;
  onBack: () => void;
  onProgressUpdate: () => void;
}

interface Mission {
  id: string;
  weekNumber: number;
  title: string;
  objective: string;
  coreBuildProject: string;
  stretchGoals: string[];
  architectureConcepts: string[];
  terminology: { term: string; definition: string }[];
  realWorldParallel: string;
  advancedChallenge: string | null;
  teachingChallenge: string;
  inventionChallenge: string;
  toolRecommendations: { tool: string; reason: string }[];
  legendaryMission: string | null;
  estimatedHours: number;
  difficulty: string;
  category: string;
}

interface ProgressData {
  status: string;
  notes: string;
  buildLink: string;
  reflectionNotes: string;
  selfAssessment: number | null;
}

const difficultyColors: Record<string, string> = {
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
};

const categoryGradients: Record<string, string> = {
  AI: 'from-purple-500 to-violet-600',
  OS: 'from-pink-500 to-rose-600',
  Game: 'from-orange-500 to-red-600',
  Infrastructure: 'from-blue-500 to-cyan-600',
  Architecture: 'from-green-500 to-emerald-600',
  Distributed: 'from-indigo-500 to-purple-600',
  Innovation: 'from-yellow-500 to-amber-600',
  Capstone: 'from-gradient-500 to-pink-600',
};

export default function MissionDetail({ weekNumber, studentId, onBack, onProgressUpdate }: MissionDetailProps) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMission();
  }, [weekNumber]);

  const fetchMission = async () => {
    setLoading(true);
    try {
      const [missionRes, progressRes] = await Promise.all([
        fetch(`/api/missions/${weekNumber}`),
        fetch(`/api/progress/${studentId}/${weekNumber}`)
      ]);
      
      if (missionRes.ok) {
        const missionData = await missionRes.json();
        setMission({
          ...missionData,
          stretchGoals: JSON.parse(missionData.stretchGoals || '[]'),
          architectureConcepts: JSON.parse(missionData.architectureConcepts || '[]'),
          terminology: JSON.parse(missionData.terminology || '[]'),
          toolRecommendations: JSON.parse(missionData.toolRecommendations || '[]'),
        });
      }
      
      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async (updates: Partial<ProgressData>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/progress/${studentId}/${weekNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setProgress(updated);
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartMission = () => {
    handleSaveProgress({ status: 'in_progress' });
  };

  const handleCompleteMission = () => {
    handleSaveProgress({ status: 'completed' });
  };

  const handleResetMission = async () => {
    if (!confirm('Are you sure you want to reset this mission? All your progress will be lost.')) return;
    
    try {
      const res = await fetch(`/api/progress/${studentId}/${weekNumber}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProgress(null);
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to reset mission:', error);
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

  if (!mission) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Mission not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">Go Back</Button>
      </div>
    );
  }

  const status = progress?.status || 'available';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-slate-700 border-slate-600">
                Week {mission.weekNumber}
              </Badge>
              <Badge className={difficultyColors[mission.difficulty] || difficultyColors.advanced}>
                {mission.difficulty}
              </Badge>
              <Badge className={cn(
                "bg-gradient-to-r text-white border-0",
                categoryGradients[mission.category] || 'from-slate-500 to-slate-600'
              )}>
                {mission.category}
              </Badge>
              {status === 'completed' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{mission.title}</h1>
            <p className="text-slate-400 text-lg">{mission.objective}</p>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {mission.estimatedHours} hours
              </span>
              {progress?.buildLink && (
                <a 
                  href={progress.buildLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-4 h-4" /> View Project
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {status === 'available' && (
              <Button onClick={handleStartMission} className="bg-purple-500 hover:bg-purple-600">
                <Play className="w-4 h-4 mr-2" /> Start Mission
              </Button>
            )}
            {status === 'in_progress' && (
              <>
                <Button onClick={handleCompleteMission} className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Mission
                </Button>
                <Button onClick={handleResetMission} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </>
            )}
            {status === 'completed' && (
              <Button onClick={handleResetMission} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Progress
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">Overview</TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-purple-500">Tools</TabsTrigger>
          <TabsTrigger value="architecture" className="data-[state=active]:bg-purple-500">Architecture</TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-500">Challenges</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-500">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Core Build Project */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Core Build Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-lg">{mission.coreBuildProject}</p>
            </CardContent>
          </Card>

          {/* Stretch Goals */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Stretch Goals
              </CardTitle>
              <CardDescription>Extra challenges for deeper learning</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mission.stretchGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Real World Parallel */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Real-World Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{mission.realWorldParallel}</p>
            </CardContent>
          </Card>

          {/* Legendary Mission */}
          {mission.legendaryMission && (
            <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Legendary Challenge
                </CardTitle>
                <CardDescription className="text-amber-400/60">
                  Extremely challenging optional project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{mission.legendaryMission}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                Recommended Tool Stack
              </CardTitle>
              <CardDescription>Tools selected for this mission and why</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mission.toolRecommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{rec.tool}</h4>
                      <p className="text-sm text-slate-400">{rec.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          {/* Architecture Concepts */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Architecture Concepts
              </CardTitle>
              <CardDescription>Key patterns and concepts you'll learn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mission.architectureConcepts.map((concept, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-green-500/10 text-green-400 border-green-500/30"
                  >
                    {concept}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terminology */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Terminology
              </CardTitle>
              <CardDescription>Engineering terms explained simply</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {mission.terminology.map((term, i) => (
                  <AccordionItem key={i} value={`term-${i}`} className="border-slate-700">
                    <AccordionTrigger className="text-white hover:text-purple-400">
                      {term.term}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      {term.definition}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Teaching Challenge */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-400" />
                  Teaching Challenge
                </CardTitle>
                <CardDescription>Teach someone else to deepen understanding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{mission.teachingChallenge}</p>
              </CardContent>
            </Card>

            {/* Invention Challenge */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-amber-900/20 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Invention Challenge
                </CardTitle>
                <CardDescription>Create something new based on this mission</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{mission.inventionChallenge}</p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Challenge */}
          {mission.advancedChallenge && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  Advanced Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{mission.advancedChallenge}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Your Progress</CardTitle>
              <CardDescription>Track your work and reflections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Status:</span>
                <Badge className={
                  status === 'completed' ? 'bg-green-500' :
                  status === 'in_progress' ? 'bg-purple-500' :
                  'bg-slate-600'
                }>
                  {status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Build Link */}
              <div className="space-y-2">
                <Label className="text-slate-300">Project Link</Label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={progress?.buildLink || ''}
                    onChange={(e) => setProgress({ ...progress!, buildLink: e.target.value })}
                    placeholder="https://github.com/your-project"
                    className="flex-1 bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2"
                  />
                  <Button 
                    onClick={() => handleSaveProgress({ buildLink: progress?.buildLink })}
                    disabled={saving}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-slate-300">Build Notes</Label>
                <Textarea
                  value={progress?.notes || ''}
                  onChange={(e) => setProgress({ ...progress!, notes: e.target.value })}
                  placeholder="What did you build? What did you learn?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
                <Button 
                  onClick={() => handleSaveProgress({ notes: progress?.notes })}
                  disabled={saving}
                  className="mt-2"
                >
                  Save Notes
                </Button>
              </div>

              {/* Architecture Reflection */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-400" />
                  Architecture Reflection
                </Label>
                <p className="text-sm text-slate-400 mb-2">
                  Answer: How would this system scale to 1 million users? Where are bottlenecks?
                </p>
                <Textarea
                  value={progress?.reflectionNotes || ''}
                  onChange={(e) => setProgress({ ...progress!, reflectionNotes: e.target.value })}
                  placeholder="Think about scaling, bottlenecks, and design trade-offs..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
                />
                <Button 
                  onClick={() => handleSaveProgress({ reflectionNotes: progress?.reflectionNotes })}
                  disabled={saving}
                  className="mt-2"
                >
                  Save Reflection
                </Button>
              </div>

              {/* Self Assessment */}
              <div className="space-y-2">
                <Label className="text-slate-300">Confidence Level</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={progress?.selfAssessment === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSaveProgress({ selfAssessment: level })}
                      className={progress?.selfAssessment === level ? 'bg-purple-500' : ''}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">1 = Need more practice, 5 = Fully confident</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
