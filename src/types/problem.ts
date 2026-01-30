export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  functionName: string;
  parameters: ParameterDef[];
  returnType: string;
  testCases: TestCase[];
  createdAt: Date;
}

export interface ParameterDef {
  name: string;
  type: string;
}

export type Language = 'python' | 'cpp' | 'java';

export interface CodeTemplate {
  python: string;
  cpp: string;
  java: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
  testCases: TestCase[];
  allPassed: boolean;
}
