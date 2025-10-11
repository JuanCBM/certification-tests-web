export interface CertificationBlock {
  id: number;
  name: string;
  description?: string;
  questionCountHint?: number;
}

export interface Certification {
  id: string; // e.g., 'togaf10'
  title: string;
  blocks: CertificationBlock[];
}

export interface AnswerOption {
  id: string; // e.g., 'A','B','C','D'
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
  correctAnswerId: string;
  blockId?: number; // 1..6 per TOGAF block
  explanation?: string;
  imageUrls?: string[]; // optional reference images shown with the question
}

export type FeedbackMode = 'immediate' | 'end';

export interface QuizConfig {
  certificationId: string;
  blockId: number | 'all';
  numberOfQuestions: number;
  feedbackMode: FeedbackMode;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
}

export interface QuizState {
  config: QuizConfig;
  questions: Question[];
  currentIndex: number;
  answers: UserAnswer[];
  startedAt: Date;
  finishedAt?: Date;
}
