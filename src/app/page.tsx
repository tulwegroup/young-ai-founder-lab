'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Brain, Lightbulb, Trophy, MessageCircle, 
  ChevronRight, Zap, Target, Clock, Star,
  BookOpen, Wrench, Award, TrendingUp, Menu, X, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import MissionTimeline from '@/components/MissionTimeline';
import MissionDetail from '@/components/MissionDetail';
import InventionLab from '@/components/InventionLab';
import ProgressDashboard from '@/components/ProgressDashboard';
import AIMentor from '@/components/AIMentor';
import PatentPathway from '@/components/PatentPathway';
import ArchitectureTrainer from '@/components/ArchitectureTrainer';
import StudentSetup from '@/components/StudentSetup';
import HelpGuide from '@/components/HelpGuide';

export default function YoungAIFounderLab() {
  const [activeTab, setActiveTab] = useState('missions');
  const [student, setStudent] = useState<any>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await fetch('/api/student');
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (error) {
      console.error('Failed to fetch student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreated = (newStudent: any) => {
    setStudent(newStudent);
  };

  const handleMissionSelect = (week: number) => {
    setSelectedMission(week);
    setActiveTab('mission-detail');
  };

  const handleBackToMissions = () => {
    setSelectedMission(null);
    setActiveTab('missions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!student) {
    return <StudentSetup onComplete={handleStudentCreated} />;
  }

  const navItems = [
    { id: 'missions', label: 'Mission Roadmap', icon: Rocket },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'inventions', label: 'Invention Lab', icon: Lightbulb },
    { id: 'mentor', label: 'AI Mentor', icon: MessageCircle },
    { id: 'patents', label: 'Patent Path', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-white">AI Founder Lab</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-700
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:block pt-0 lg:pt-0
      `}>
        <div className="p-6 border-b border-slate-700 hidden lg:block">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Rocket className="w-10 h-10 text-purple-400" />
            </motion.div>
            <div>
              <h1 className="font-bold text-xl text-white">Young AI Founder</h1>
              <p className="text-sm text-slate-400">Elite Engineering Lab</p>
            </div>
          </div>
        </div>

        {/* Student Profile */}
        <div className="p-4 border-b border-slate-700 mt-16 lg:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{student.name?.[0]?.toUpperCase() || 'S'}</span>
            </div>
            <div>
              <p className="font-semibold text-white">{student.name}</p>
              <p className="text-xs text-slate-400">Week {student.currentWeek} • Level {student.difficultyLevel}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Engineering Score</span>
              <span className="text-purple-400 font-semibold">{student.engineeringScore}/100</span>
            </div>
            <Progress value={student.engineeringScore} className="h-2" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
                if (item.id === 'missions') setSelectedMission(null);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${activeTab === item.id 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'text-slate-300 hover:bg-slate-800'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
          
          {/* Help Button */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">How to Use</span>
          </motion.button>
        </nav>

        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{student.totalMissionsDone}</p>
              <p className="text-xs text-slate-400">Missions</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <Lightbulb className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{student.totalInventions}</p>
              <p className="text-xs text-slate-400">Inventions</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-20 lg:pt-0">
        <AnimatePresence mode="wait">
          {activeTab === 'missions' && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">52-Week Mission Roadmap</h2>
                  <p className="text-slate-400">Your journey from curious builder to elite engineer</p>
                </div>
                
                {/* Phase Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
                  {[
                    { name: 'Foundations', weeks: '1-8', color: 'from-green-500 to-emerald-600' },
                    { name: 'AI Deep Dive', weeks: '9-16', color: 'from-purple-500 to-violet-600' },
                    { name: 'Infrastructure', weeks: '17-24', color: 'from-blue-500 to-cyan-600' },
                    { name: 'Game Systems', weeks: '25-32', color: 'from-orange-500 to-red-600' },
                    { name: 'Advanced OS', weeks: '33-40', color: 'from-pink-500 to-rose-600' },
                    { name: 'Capstone', weeks: '41-52', color: 'from-yellow-500 to-amber-600' },
                  ].map((phase, i) => (
                    <motion.div
                      key={phase.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-br ${phase.color} rounded-xl p-4 text-white`}
                    >
                      <p className="font-bold text-sm">{phase.name}</p>
                      <p className="text-xs opacity-80">Weeks {phase.weeks}</p>
                    </motion.div>
                  ))}
                </div>

                <MissionTimeline 
                  currentWeek={student.currentWeek} 
                  onSelectMission={handleMissionSelect}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'mission-detail' && selectedMission && (
            <motion.div
              key="mission-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <MissionDetail 
                weekNumber={selectedMission} 
                studentId={student.id}
                onBack={handleBackToMissions}
                onProgressUpdate={fetchStudent}
              />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <ProgressDashboard studentId={student.id} />
            </motion.div>
          )}

          {activeTab === 'inventions' && (
            <motion.div
              key="inventions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <InventionLab studentId={student.id} currentWeek={student.currentWeek} />
            </motion.div>
          )}

          {activeTab === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <AIMentor studentId={student.id} studentName={student.name} />
            </motion.div>
          )}

          {activeTab === 'patents' && (
            <motion.div
              key="patents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 lg:p-8"
            >
              <PatentPathway studentId={student.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Help Guide Modal */}
      <HelpGuide isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
