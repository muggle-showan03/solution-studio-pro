import { TestCase } from '@/types/problem';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TestCasePanelProps {
  testCases: TestCase[];
  isRunning?: boolean;
}

export function TestCasePanel({ testCases, isRunning = false }: TestCasePanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        Test Cases
        {isRunning && (
          <span className="flex items-center gap-1 text-xs text-accent animate-pulse">
            <Clock className="w-3 h-3" />
            Running...
          </span>
        )}
      </h3>
      
      <div className="space-y-2">
        {testCases.map((testCase, index) => (
          <div
            key={testCase.id}
            className={cn(
              'test-case-panel transition-all duration-200',
              testCase.passed === true && 'test-case-passed',
              testCase.passed === false && 'test-case-failed'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Case {index + 1}
              </span>
              {testCase.passed !== undefined && (
                <span className="flex items-center gap-1">
                  {testCase.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs text-success font-medium">Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-xs text-destructive font-medium">Failed</span>
                    </>
                  )}
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Input: </span>
                <code className="font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
                  {testCase.input}
                </code>
              </div>
              
              <div>
                <span className="text-muted-foreground">Expected: </span>
                <code className="font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
                  {testCase.expectedOutput}
                </code>
              </div>
              
              {testCase.actualOutput !== undefined && (
                <div>
                  <span className="text-muted-foreground">Output: </span>
                  <code className={cn(
                    'font-mono px-2 py-0.5 rounded',
                    testCase.passed ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
                  )}>
                    {testCase.actualOutput}
                  </code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
