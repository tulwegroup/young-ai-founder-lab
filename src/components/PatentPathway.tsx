'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, FileText, CheckCircle2, ArrowRight, Plus,
  Edit, Trash2, ExternalLink, Lightbulb, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PatentIdea {
  id: string;
  title: string;
  problemStatement: string;
  currentSolutions: string;
  newApproach: string;
  advantages: string;
  stage: number;
  provisionalDraft: string | null;
  createdAt: string;
}

interface PatentPathwayProps {
  studentId: string;
}

const stages = [
  {
    number: 1,
    title: 'Understanding Patents',
    description: 'Learn what patents are and what makes something patentable',
    tips: [
      'A patent protects new inventions',
      'Must be novel (new)',
      'Must be non-obvious',
      'Must be useful',
    ]
  },
  {
    number: 2,
    title: 'Identify Patentable Ideas',
    description: 'Review your inventions for patent potential',
    tips: [
      'Is it truly new?',
      'Does it solve a problem in a unique way?',
      'Would an expert say "why didn\'t I think of that?"',
      'Can it be built/manufactured?',
    ]
  },
  {
    number: 3,
    title: 'Document Your Invention',
    description: 'Write a clear description of your invention',
    tips: [
      'Describe the problem clearly',
      'Explain existing solutions',
      'Detail your new approach',
      'List all advantages',
    ]
  },
  {
    number: 4,
    title: 'Provisional Draft',
    description: 'Create a provisional patent application structure',
    tips: [
      'Title of invention',
      'Background and field',
      'Summary of invention',
      'Detailed description',
      'Claims (what you want to protect)',
    ]
  },
];

export default function PatentPathway({ studentId }: PatentPathwayProps) {
  const [ideas, setIdeas] = useState<PatentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<PatentIdea | null>(null);
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    currentSolutions: '',
    newApproach: '',
    advantages: '',
    stage: 1 as const,
  });

  useEffect(() => {
    fetchIdeas();
  }, [studentId]);

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`/api/patents/student/${studentId}`);
      if (res.ok) {
        setIdeas(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch patents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    try {
      let url: string;
      let method: string;
      
      if (editingIdea) {
        url = `/api/patents/item?id=${editingIdea.id}`;
        method = 'PUT';
      } else {
        url = `/api/patents/student/${studentId}`;
        method = 'POST';
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchIdeas();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save patent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patent idea?')) return;
    
    try {
      await fetch(`/api/patents/item?id=${id}`, { method: 'DELETE' });
      fetchIdeas();
    } catch (error) {
      console.error('Failed to delete patent:', error);
    }
  };

  const handleEdit = (idea: PatentIdea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      problemStatement: idea.problemStatement,
      currentSolutions: idea.currentSolutions,
      newApproach: idea.newApproach,
      advantages: idea.advantages,
      stage: idea.stage,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      problemStatement: '',
      currentSolutions: '',
      newApproach: '',
      advantages: '',
      stage: 1,
    });
    setEditingIdea(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-400" />
          Patent Preparation Pathway
        </h2>
        <p className="text-slate-400">Learn to document and protect your inventions</p>
      </div>

      {/* Important Notice */}
      <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/30 mb-8">
        <CardContent className="p-4">
          <p className="text-slate-300 text-sm">
            <strong className="text-amber-400">Note:</strong> This is educational guidance only, not legal advice. 
            For actual patent filings, consult with a registered patent attorney.
          </p>
        </CardContent>
      </Card>

      {/* Learning Stages */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4">Learning Stages</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {stages.map((stage) => (
            <motion.div
              key={stage.number}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedStage(stage.number)}
              className={cn(
                "cursor-pointer rounded-lg p-4 border transition-all",
                selectedStage === stage.number
                  ? "bg-amber-500/20 border-amber-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  selectedStage === stage.number
                    ? "bg-amber-500 text-white"
                    : "bg-slate-700 text-slate-400"
                )}>
                  {stage.number}
                </div>
                <span className="text-white font-medium text-sm">{stage.title}</span>
              </div>
              <p className="text-xs text-slate-400">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <Card className="bg-slate-800/50 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">
            Stage {stages[selectedStage - 1].number}: {stages[selectedStage - 1].title}
          </CardTitle>
          <CardDescription>{stages[selectedStage - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stages[selectedStage - 1].tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5" />
                <span className="text-slate-300">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patent Ideas */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Your Patent Ideas</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> New Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingIdea ? 'Edit Patent Idea' : 'New Patent Idea'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Document your invention for potential patent consideration
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Invention Title</Label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief, descriptive title"
                  className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Problem Statement</Label>
                <Textarea
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="What problem does this invention solve?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Current Solutions</Label>
                <Textarea
                  value={formData.currentSolutions}
                  onChange={(e) => setFormData({ ...formData, currentSolutions: e.target.value })}
                  placeholder="How is this problem currently addressed?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Your New Approach</Label>
                <Textarea
                  value={formData.newApproach}
                  onChange={(e) => setFormData({ ...formData, newApproach: e.target.value })}
                  placeholder="How does your invention solve the problem differently?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Advantages</Label>
                <Textarea
                  value={formData.advantages}
                  onChange={(e) => setFormData({ ...formData, advantages: e.target.value })}
                  placeholder="What are the benefits of your approach?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { setDialogOpen(false); resetForm(); }}
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.title.trim()}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {editingIdea ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"
          />
        </div>
      ) : ideas.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No patent ideas yet</h3>
            <p className="text-slate-400 mb-4">Start documenting inventions with patent potential</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Idea
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{idea.title}</h3>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          Stage {idea.stage}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                          <strong className="text-slate-400">Problem:</strong> {idea.problemStatement}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-slate-400">New Approach:</strong> {idea.newApproach}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(idea)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(idea.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
