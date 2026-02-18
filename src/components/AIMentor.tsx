'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Trash2, Sparkles, User, Bot,
  RefreshCw, Lightbulb, BookOpen, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIMentorProps {
  studentId: string;
  studentName: string;
}

const suggestedQuestions = [
  "What should I focus on this week?",
  "Explain a concept I'm struggling with",
  "Help me brainstorm an invention idea",
  "Review my project architecture",
  "What's the best way to learn X?",
  "How do professionals build this?",
];

export default function AIMentor({ studentId, studentName }: AIMentorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
  }, [studentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initSession = async () => {
    try {
      const res = await fetch(`/api/mentor/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        if (data.messages) {
          setMessages(JSON.parse(data.messages));
        }
      }
    } catch (error) {
      console.error('Failed to init session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId,
          message: userMessage.content,
          studentName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const fallbackMessage: Message = {
          role: 'assistant',
          content: "I'm here to help you learn and build! Try asking me about:\n\n• Concepts from your current mission\n• Help with debugging or architecture\n• Brainstorming invention ideas\n• Career advice for young engineers\n\nWhat would you like to explore?",
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I encountered an issue. Let's try again! What would you like to learn about?",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!sessionId) return;
    
    try {
      await fetch(`/api/mentor/${sessionId}`, { method: 'DELETE' });
      setMessages([]);
      initSession();
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-400" />
            AI Mentor
          </h2>
          <p className="text-slate-400">Your personal engineering coach</p>
        </div>
        {messages.length > 0 && (
          <Button 
            variant="outline" 
            onClick={clearConversation}
            className="border-slate-600 text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Container */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bot className="w-16 h-16 text-purple-400 mb-4" />
                </motion.div>
                <h3 className="text-white font-semibold mb-2">Hi {studentName}! I'm your AI Mentor</h3>
                <p className="text-slate-400 max-w-md mb-6">
                  I'm here to help you learn, build, and invent. Ask me anything about 
                  programming, systems design, or your projects!
                </p>
                
                {/* Suggested Questions */}
                <div className="w-full max-w-lg">
                  <p className="text-sm text-slate-500 mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.slice(0, 4).map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestion(q)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === 'user' 
                          ? "bg-purple-500 text-white rounded-br-none"
                          : "bg-slate-700 text-slate-200 rounded-bl-none"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          msg.role === 'user' ? "text-purple-200" : "text-slate-500"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {studentName[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="bg-slate-700 rounded-2xl px-4 py-3 rounded-bl-none">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-purple-400"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything about engineering..."
                className="flex-1 bg-slate-700 border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-purple-500 hover:bg-purple-600 px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Topics */}
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Quick Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: BookOpen, label: 'Explain a concept', prompt: 'Can you explain ' },
            { icon: Zap, label: 'Debug help', prompt: 'Help me debug this: ' },
            { icon: Lightbulb, label: 'Invention brainstorm', prompt: 'Help me brainstorm an invention for ' },
            { icon: Sparkles, label: 'Architecture review', prompt: 'Can you review this architecture: ' },
          ].map((topic) => (
            <Button
              key={topic.label}
              variant="outline"
              size="sm"
              onClick={() => setInput(topic.prompt)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <topic.icon className="w-3 h-3 mr-2" />
              {topic.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
