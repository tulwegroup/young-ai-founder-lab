'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, User, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentSetupProps {
  onComplete: (student: any) => void;
}

export default function StudentSetup({ onComplete }: StudentSetupProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('13');
  const [difficulty, setDifficulty] = useState('advanced');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: parseInt(age),
          difficultyLevel: difficulty
        })
      });
      
      if (res.ok) {
        const student = await res.json();
        onComplete(student);
      }
    } catch (error) {
      console.error('Failed to create student:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Rocket className="w-16 h-16 text-purple-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Young AI Founder Lab</h1>
          <p className="text-slate-400 text-lg">Elite Engineering Accelerator for Young Builders</p>
        </motion.div>

        {/* Setup Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {step === 1 ? 'Welcome, Young Builder!' : 'Your Learning Profile'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1 
                ? 'This is your personal AI engineering accelerator. Let\'s set up your profile.'
                : 'Help us personalize your learning experience.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-white font-semibold">What You'll Build:</h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      AI Systems & Agents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Operating System Components
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Game Engines & Systems
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      Distributed Systems
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      Your Own Inventions
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                  <p className="text-sm text-slate-300">
                    <strong className="text-purple-400">52 Weeks</strong> of hands-on missions, 
                    invention challenges, and real-world engineering projects.
                  </p>
                </div>

                <Button 
                  onClick={() => setStep(2)}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Let's Begin <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Your Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Your Age
                  </Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[11, 12, 13, 14, 15].map(a => (
                        <SelectItem key={a} value={a.toString()}>{a} years old</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Starting Difficulty
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intermediate">Intermediate - I've built some things</SelectItem>
                      <SelectItem value="advanced">Advanced - I build AI tools & games</SelectItem>
                      <SelectItem value="legendary">Legendary - I want extreme challenges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!name.trim() || loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    {loading ? 'Setting Up...' : 'Start My Journey'}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Build real systems. Think like an architect. Invent the future.
        </p>
      </motion.div>
    </div>
  );
}
