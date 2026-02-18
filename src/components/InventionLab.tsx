'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Plus, Search, Trash2, Edit, ExternalLink,
  Calendar, CheckCircle2, FileText, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Invention {
  id: string;
  title: string;
  problemSolved: string;
  noveltyDesc: string;
  architectureDesc: string | null;
  prototypeLink: string | null;
  status: string;
  patentable: boolean;
  weekCreated: number;
  createdAt: string;
}

interface InventionLabProps {
  studentId: string;
  currentWeek: number;
}

const statusColors: Record<string, string> = {
  idea: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  prototype: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  testing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  refined: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function InventionLab({ studentId, currentWeek }: InventionLabProps) {
  const [inventions, setInventions] = useState<Invention[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvention, setEditingInvention] = useState<Invention | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    problemSolved: '',
    noveltyDesc: '',
    architectureDesc: '',
    prototypeLink: '',
    status: 'idea' as const,
    patentable: false,
  });

  useEffect(() => {
    fetchInventions();
  }, [studentId]);

  const fetchInventions = async () => {
    try {
      const res = await fetch(`/api/inventions/student/${studentId}`);
      if (res.ok) {
        setInventions(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch inventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.problemSolved.trim()) return;
    
    setSaving(true);
    try {
      let url: string;
      let method: string;
      
      if (editingInvention) {
        url = `/api/inventions/item?id=${editingInvention.id}`;
        method = 'PUT';
      } else {
        url = `/api/inventions/student/${studentId}`;
        method = 'POST';
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weekCreated: editingInvention?.weekCreated || currentWeek
        })
      });
      
      if (res.ok) {
        fetchInventions();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save invention:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invention?')) return;
    
    try {
      await fetch(`/api/inventions/item?id=${id}`, { method: 'DELETE' });
      fetchInventions();
    } catch (error) {
      console.error('Failed to delete invention:', error);
    }
  };

  const handleEdit = (invention: Invention) => {
    setEditingInvention(invention);
    setFormData({
      title: invention.title,
      problemSolved: invention.problemSolved,
      noveltyDesc: invention.noveltyDesc,
      architectureDesc: invention.architectureDesc || '',
      prototypeLink: invention.prototypeLink || '',
      status: invention.status as any,
      patentable: invention.patentable,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      problemSolved: '',
      noveltyDesc: '',
      architectureDesc: '',
      prototypeLink: '',
      status: 'idea',
      patentable: false,
    });
    setEditingInvention(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-amber-400" />
            Invention Lab
          </h2>
          <p className="text-slate-400">Document your ideas and track your inventions</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> New Invention
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingInvention ? 'Edit Invention' : 'New Invention Idea'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Document your invention idea with as much detail as possible
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Invention Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your invention a name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Problem Solved *</Label>
                <Textarea
                  value={formData.problemSolved}
                  onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                  placeholder="What problem does this invention solve?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">What Makes It Novel?</Label>
                <Textarea
                  value={formData.noveltyDesc}
                  onChange={(e) => setFormData({ ...formData, noveltyDesc: e.target.value })}
                  placeholder="How is this different from existing solutions?"
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Architecture / How It Works</Label>
                <Textarea
                  value={formData.architectureDesc}
                  onChange={(e) => setFormData({ ...formData, architectureDesc: e.target.value })}
                  placeholder="Describe the technical approach..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Prototype Link</Label>
                <Input
                  type="url"
                  value={formData.prototypeLink}
                  onChange={(e) => setFormData({ ...formData, prototypeLink: e.target.value })}
                  placeholder="https://github.com/..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2"
                  >
                    <option value="idea">Idea</option>
                    <option value="prototype">Prototype</option>
                    <option value="testing">Testing</option>
                    <option value="refined">Refined</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Patent Potential</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="patentable"
                      checked={formData.patentable}
                      onChange={(e) => setFormData({ ...formData, patentable: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="patentable" className="text-slate-300 text-sm">
                      This might be patentable
                    </label>
                  </div>
                </div>
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
                  disabled={!formData.title.trim() || !formData.problemSolved.trim() || saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {saving ? 'Saving...' : editingInvention ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Ideas', value: inventions.length, color: 'text-blue-400' },
          { label: 'Prototypes', value: inventions.filter(i => i.status === 'prototype').length, color: 'text-purple-400' },
          { label: 'Refined', value: inventions.filter(i => i.status === 'refined').length, color: 'text-green-400' },
          { label: 'Patentable', value: inventions.filter(i => i.patentable).length, color: 'text-amber-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invention List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full"
          />
        </div>
      ) : inventions.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No inventions yet</h3>
            <p className="text-slate-400 mb-4">Start documenting your ideas!</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Invention
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {inventions.map((invention, index) => (
              <motion.div
                key={invention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{invention.title}</h3>
                          <Badge className={statusColors[invention.status] || statusColors.idea}>
                            {invention.status}
                          </Badge>
                          {invention.patentable && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                              <Sparkles className="w-3 h-3 mr-1" /> Patentable
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-slate-300 mb-2">{invention.problemSolved}</p>
                        
                        {invention.noveltyDesc && (
                          <p className="text-slate-400 text-sm mb-3">
                            <strong className="text-slate-300">Novelty:</strong> {invention.noveltyDesc}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Week {invention.weekCreated}
                          </span>
                          {invention.prototypeLink && (
                            <a 
                              href={invention.prototypeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                            >
                              <ExternalLink className="w-3 h-3" /> View Prototype
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(invention)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(invention.id)}
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
          </AnimatePresence>
        </div>
      )}

      {/* Innovation Tips */}
      <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30 mt-8">
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Innovation Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
              Document every idea - even "crazy" ones can become real inventions
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
              Think about what frustrates you - problems are opportunities for invention
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
              Combine ideas from different fields - that's where breakthroughs happen
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
              Build quick prototypes - testing beats assuming
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
