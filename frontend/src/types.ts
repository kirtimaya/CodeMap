export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Section {
  heading: string;
  body: string;
  codeSnippet?: CodeSnippet;
}

export interface ConceptContent {
  overview: string;
  sections: Section[];
  keyInsights: string[];
}

export interface ConceptNode {
  id: string;
  parentId: string | null;
  label: string;
  tagline: string;
  depth: number;
  visualizationType: string | null;
  content: ConceptContent;
  estimatedReadMinutes: number;
  tags: string[];
  interviewRelevance: DifficultyLevel;
}

export type PageType = 'java' | 'springboot';

export interface MCQQuestion {
  id: string;
  conceptId: string;
  type: 'mcq';
  level: DifficultyLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodingQuestion {
  id: string;
  conceptId: string;
  type: 'coding';
  level: DifficultyLevel;
  prompt: string;
  starterCode: string;
  rubric: string;
  hints: string[];
}

export type Question = MCQQuestion | CodingQuestion;

export interface ConceptProgress {
  visited: boolean;
  mastery: number;
  levelsCleared: number;
  attemptsCount: number;
}
