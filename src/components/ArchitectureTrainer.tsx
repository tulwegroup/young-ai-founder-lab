'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, ChevronRight, CheckCircle2, HelpCircle,
  Lightbulb, ArrowRight, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface ArchitectureTrainerProps {
  missionWeek: number;
  onComplete: (notes: string) => void;
}

const architectureQuestions = [
  {
    id: 1,
    question: "How would this system scale to 1 million users?",
    hints: [
      "Think about database connections",
      "Consider caching strategies",
      "What happens to response times?",
      "Where are the bottlenecks?"
    ],
    concepts: ["Horizontal Scaling", "Load Balancing", "Caching", "Database Sharding"]
  },
  {
    id: 2,
    question: "Where are the potential bottlenecks in this system?",
    hints: [
      "Network calls are slow",
      "Database queries can be expensive",
      "Memory limits exist",
      "Third-party APIs have rate limits"
    ],
    concepts: ["I/O Bound", "CPU Bound", "Memory Constraints", "Rate Limiting"]
  },
  {
    id: 3,
    question: "How would you redesign it for speed?",
    hints: [
      "Cache frequently accessed data",
      "Optimize hot paths",
      "Use async processing",
      "Consider data structures"
    ],
    concepts: ["Caching", "Async Processing", "Optimization", "Data Locality"]
  },
  {
    id: 4,
    question: "What would break first under heavy load?",
    hints: [
      "Check resource limits",
      "Think about dependencies",
      "Consider edge cases",
      "Memory leaks compound"
    ],
    concepts: ["Cascading Failures", "Resource Exhaustion", "Timeouts", "Deadlocks"]
  },
  {
    id: 5,
    question: "How would you make this system resilient?",
    hints: [
      "Things will fail eventually",
      "Have fallback strategies",
      "Monitor and alert",
      "Graceful degradation"
    ],
    concepts: ["Circuit Breakers", "Retries", "Fallbacks", "Health Checks"]
  },
  {
    id: 6,
    question: "What security considerations apply?",
    hints: [
      "Validate all inputs",
      "Encrypt sensitive data",
      "Principle of least privilege",
      "Defense in depth"
    ],
    concepts: ["Input Validation", "Encryption", "Authorization", "Audit Logging"]
  },
  {
    id: 7,
    question: "How would you test this system?",
    hints: [
      "Unit tests for logic",
      "Integration tests for flows",
      "Load tests for scale",
      "Chaos tests for resilience"
    ],
    concepts: ["Unit Testing", "Integration Testing", "Load Testing", "Chaos Engineering"]
  },
  {
    id: 8,
    question: "What would you monitor in production?",
    hints: [
      "Response times matter",
      "Error rates tell stories",
      "Resource usage trends",
      "Business metrics too"
    ],
    concepts: ["Metrics", "Logging", "Tracing", "Alerting"]
  }
];

export default function ArchitectureTrainer({ missionWeek, onComplete }: ArchitectureTrainerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [completed, setCompleted] = useState(false);

  const question = architectureQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / architectureQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < architectureQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowHints(false);
    } else {
      setCompleted(true);
      const allNotes = Object.entries(answers)
        .map(([id, answer]) => {
          const q = architectureQuestions.find(q => q.id === parseInt(id));
          return `Q: ${q?.question}\nA: ${answer}`;
        })
        .join('\n\n');
      onComplete(allNotes);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowHints(false);
    }
  };

  if (completed) {
    return (
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardContent className="py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-white font-semibold text-xl mb-2">Architecture Training Complete!</h3>
          <p className="text-slate-400 mb-4">
            You've thought through {architectureQuestions.length} key architecture questions.
          </p>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <BookOpen className="w-3 h-3 mr-1" /> Architecture Thinking +10 XP
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          Question {currentQuestion + 1} of {architectureQuestions.length}
        </Badge>
        <div className="flex-1 mx-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            {question.question}
          </CardTitle>
          <CardDescription>
            Think critically about system design and trade-offs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Related Concepts */}
          <div className="flex flex-wrap gap-2">
            {question.concepts.map((concept) => (
              <Badge 
                key={concept} 
                variant="outline" 
                className="bg-blue-500/10 text-blue-400 border-blue-500/30"
              >
                {concept}
              </Badge>
            ))}
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Your answer:</label>
            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Think about scalability, reliability, performance, and trade-offs..."
              className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
            />
          </div>

          {/* Hints */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="text-slate-400 hover:text-white"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </Button>
            
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-slate-700/50 rounded-lg"
              >
                <p className="text-sm text-slate-400 mb-2">Things to consider:</p>
                <ul className="space-y-1">
                  {question.hints.map((hint, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                      {hint}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="border-slate-600 text-slate-300"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {currentQuestion === architectureQuestions.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Skip */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompleted(true)}
          className="text-slate-500 hover:text-slate-400"
        >
          Skip Architecture Training
        </Button>
      </div>
    </div>
  );
}
