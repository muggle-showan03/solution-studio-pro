import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Code2, Sparkles, ArrowRight, Zap, Target, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedProblem {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  functionName: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  testCases: { input: string; expectedOutput: string }[];
}

export default function ProblemInput() {
  const navigate = useNavigate();
  const [problemText, setProblemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!problemText.trim()) {
      toast.error('Please enter a problem description');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-problem', {
        body: { problemText },
      });

      if (error) throw error;

      const parsedProblem = data as ParsedProblem;
      
      // Store in sessionStorage for the coding environment
      sessionStorage.setItem('currentProblem', JSON.stringify({
        ...parsedProblem,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }));

      navigate('/code');
    } catch (error) {
      console.error('Error parsing problem:', error);
      toast.error('Failed to parse problem. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">CodeArena</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Practice Environment
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Master Coding with
              <span className="text-gradient-primary"> Real Challenges</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste any programming problem and get an interactive LeetCode-style
              environment with auto-generated test cases and code templates.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Zap, title: 'Instant Setup', desc: 'Paste problem, start coding' },
              { icon: Target, title: 'Smart Parsing', desc: 'Auto-detect function signatures' },
              { icon: Trophy, title: 'Win Celebrations', desc: 'Pass tests, earn victories' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className="p-4 bg-card/50 border-border hover:bg-card transition-colors">
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Problem Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Enter Your Problem
              </h2>
              
              <Textarea
                placeholder={`Example:

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-secondary border-border resize-none"
              />
              
              <div className="mt-4 flex justify-end">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || !problemText.trim()}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Environment
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
