export interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MCQResponse {
  questions: MCQQuestion[];
}

export interface MindMapNode {
  root: string;
  children: MindMapChild[];
}

export interface MindMapChild {
  label: string;
  children: MindMapChild[];
}

export interface CodeExplanation {
  code: string;
  lineByLine: {
    lineRange: string;
    explanation: string;
    analogy: string;
  }[];
  overallSummary: string;
  realWorldAnalogy: string;
}

export interface FlashcardData {
  cards: {
    front: string;
    back: string;
  }[];
}

export interface SummaryResult {
  summary: string;
  keyTakeaways: string[];
  originalWordCount: number;
  summaryWordCount: number;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  createdAt: Date;
}

export interface FlashcardReview {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: Date;
  repetitions: number;
}

export interface StudyPlanDay {
  day: string;
  date: string;
  topics: string[];
  hoursAllocated: number;
  tasks: string[];
  revisionItems: string[];
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  days: StudyPlanDay[];
}

export interface StudyPlanResult {
  subject: string;
  totalDays: number;
  examDate: string;
  dailyHours: number;
  weeklyPlan: StudyPlanWeek[];
  revisionSchedule: {
    day: string;
    topics: string[];
    type: string;
  }[];
  tips: string[];
}

export type ChatMode = 'default' | 'eli5' | 'socratic' | 'exam-prep';
export type SummarizeDepth = 'brief' | 'detailed' | 'bullet-points';
export type Difficulty = 'easy' | 'medium' | 'hard';
