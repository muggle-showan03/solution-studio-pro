import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TestCasePanel } from '@/components/TestCasePanel';
import { WinningCelebration } from '@/components/WinningCelebration';
import { Star } from 'lucide-react';
import { Problem, Language, TestCase } from '@/types/problem';
import { generateTemplate } from '@/lib/codeTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { awardPoints, DIFFICULTY_POINTS, getPoints } from '@/lib/points';
import { 
  Code2, 
  Play, 
  Send, 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CodingEnvironment() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [points, setPoints] = useState(getPoints());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const storedProblem = sessionStorage.getItem('currentProblem');
    if (storedProblem) {
      const parsed = JSON.parse(storedProblem);
      setProblem(parsed);
      setTestCases(parsed.testCases.map((tc: any, i: number) => ({
        id: `tc-${i}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })));
    } else {
      // Redirect to home if no problem
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (problem) {
      const template = generateTemplate(
        language,
        problem.functionName,
        problem.parameters,
        problem.returnType
      );
      setCode(template);
    }
  }, [language, problem]);

  const handleRun = async () => {
    if (!problem || !code.trim()) return;

    setIsRunning(true);
    setExecutionTime(null);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-code', {
        body: {
          code,
          language,
          problem: {
            functionName: problem.functionName,
            parameters: problem.parameters,
            returnType: problem.returnType,
          },
          testCases: testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        },
      });

      if (error) throw error;

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      const results = data.testCases as TestCase[];
      setTestCases(results);

      if (data.allPassed) {
        const { awarded, pointsEarned, totalPoints } = awardPoints(problem.id, problem.difficulty);
        setShowCelebration(true);
        setTimerRunning(false);
        setPoints(totalPoints);
        if (awarded) {
          toast.success(`🎉 All test cases passed! +${pointsEarned} points (Total: ${totalPoints})`);
        } else {
          toast.success('🎉 All test cases passed! (Already solved)');
        }
      } else {
        const passed = results.filter(tc => tc.passed).length;
        toast.info(`${passed}/${results.length} test cases passed`);
      }
    } catch (error) {
      console.error('Error evaluating code:', error);
      toast.error('Failed to evaluate code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (problem) {
      const template = generateTemplate(
        language,
        problem.functionName,
        problem.parameters,
        problem.returnType
      );
      setCode(template);
      setTestCases(testCases.map(tc => ({
        ...tc,
        actualOutput: undefined,
        passed: undefined,
      })));
      setExecutionTime(null);
    }
  };

  const passedCount = testCases.filter(tc => tc.passed === true).length;
  const totalCount = testCases.length;
  const allPassed = passedCount === totalCount && totalCount > 0;

  if (!problem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{problem.title}</h1>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  problem.difficulty === 'easy' && 'difficulty-easy',
                  problem.difficulty === 'medium' && 'difficulty-medium',
                  problem.difficulty === 'hard' && 'difficulty-hard',
                )}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border font-mono">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={cn('text-sm font-semibold', !timerRunning && 'text-success')}>{formatTime(elapsedTime)}</span>
            </div>

            {executionTime !== null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {executionTime}ms
              </span>
            )}
            
            {totalCount > 0 && (
              <span className={cn(
                'text-sm font-medium flex items-center gap-1',
                allPassed ? 'text-success' : 'text-muted-foreground'
              )}>
                {allPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : passedCount > 0 ? (
                  <span>{passedCount}/{totalCount}</span>
                ) : null}
              </span>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm font-semibold text-foreground">{points} pts</span>
            </div>

            <LanguageSelector selected={language} onSelect={setLanguage} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-2/5 border-r border-border overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Problem</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {problem.description}
              </p>
            </div>

            <div className="mt-8">
              <TestCasePanel testCases={testCases} isRunning={isRunning} />
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
            />
          </div>

          {/* Actions */}
          <div className="border-t border-border bg-card/50 p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="run"
                size="lg"
                onClick={handleRun}
                disabled={isRunning}
                className={cn('gap-2', isRunning && 'running-pulse')}
              >
                <Play className="w-5 h-5" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Winning Celebration */}
      <WinningCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        problemTitle={problem.title}
      />
    </div>
  );
}
