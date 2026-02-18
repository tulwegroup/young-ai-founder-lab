'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, X, Rocket, Map, Lightbulb, MessageCircle, 
  Trophy, FileText, Zap, ChevronRight, Target, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const guideSections = [
  {
    icon: Rocket,
    title: 'Getting Started',
    color: 'text-purple-400',
    items: [
      'Create your profile with your name, age, and experience level',
      'Choose your difficulty: Intermediate, Advanced, or Legendary',
      'Your journey begins at Week 1 and progresses through 52 weeks',
    ]
  },
  {
    icon: Map,
    title: 'Roadmap & Missions',
    color: 'text-blue-400',
    items: [
      'Click any week on the roadmap to see mission details',
      'Each mission has a Core Build Project - this is your main task',
      'Stretch Goals are optional challenges for deeper learning',
      'Track your progress in the "My Progress" tab',
    ]
  },
  {
    icon: Lightbulb,
    title: 'Invention Lab',
    color: 'text-amber-400',
    items: [
      'Record your invention ideas as you learn',
      'Describe the problem it solves and what makes it unique',
      'Link to any prototypes you build',
      'Mark ideas as "Patentable" if they seem novel',
    ]
  },
  {
    icon: MessageCircle,
    title: 'AI Mentor (Atlas)',
    color: 'text-green-400',
    items: [
      'Ask Atlas anything about engineering, AI, or system design',
      'Get help debugging your code or designing architectures',
      'Brainstorm invention ideas together',
      'Clear the chat anytime to start fresh',
    ]
  },
  {
    icon: Trophy,
    title: 'Progress Tracking',
    color: 'text-cyan-400',
    items: [
      'Your Engineering Score increases as you complete missions',
      'View stats on missions completed and inventions created',
      'Reset any mission if you want to try it again',
    ]
  },
  {
    icon: FileText,
    title: 'Patent Pathway',
    color: 'text-pink-400',
    items: [
      'Turn your best invention ideas into patent drafts',
      'Follow the structured template to describe your innovation',
      'Document what makes your approach unique',
      'Export drafts to share with mentors or advisors',
    ]
  },
];

const quickTips = [
  { icon: Zap, text: 'Complete missions in order for the best learning path' },
  { icon: Target, text: 'Aim for 2-3 missions per week to stay on track' },
  { icon: BookOpen, text: 'Use the Architecture tab to learn key concepts' },
  { icon: MessageCircle, text: "Ask Atlas for help - that's what it's here for!" },
];

export default function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How to Use Young AI Founder Lab</h2>
              <p className="text-sm text-slate-400">Your guide to becoming a world-class builder</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Quick Tips */}
            <div className="grid grid-cols-2 gap-3">
              {quickTips.map((tip, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
                >
                  <tip.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{tip.text}</span>
                </div>
              ))}
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {guideSections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <section.icon className={cn("w-5 h-5", section.color)} />
                        <span className="text-white">{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                            <ChevronRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* The Learning Journey */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  Your 52-Week Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>
                    <strong className="text-white">Weeks 1-12 (AI Foundation):</strong> Build AI tools, learn about LLMs, create chatbots and agents.
                  </p>
                  <p>
                    <strong className="text-white">Weeks 13-24 (Operating Systems):</strong> Build an OS from scratch, memory management, file systems.
                  </p>
                  <p>
                    <strong className="text-white">Weeks 25-36 (Game Development):</strong> Physics engines, multiplayer games, procedural generation.
                  </p>
                  <p>
                    <strong className="text-white">Weeks 37-48 (Infrastructure):</strong> Databases, caching, distributed systems.
                  </p>
                  <p>
                    <strong className="text-white">Weeks 49-52 (Capstone):</strong> Build your masterpiece - a project combining everything you've learned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <Button onClick={onClose} className="w-full bg-purple-500 hover:bg-purple-600">
            Got it! Let's Start Building 🚀
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
