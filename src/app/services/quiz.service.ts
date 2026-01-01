import { Injectable } from '@angular/core';
import { QuizConfig, QuizState, Question, UserAnswer } from '../models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private state: QuizState | null = null;
  private questionBank: Question[] = [];
  private lockedQuestions = new Set<string>();

  setQuestionBank(questions: Question[]) {
    this.questionBank = questions;
  }

  getQuestionBank(): Question[] {
    return this.questionBank;
  }

  startQuiz(config: QuizConfig) {
    // Filter by block
    let pool = this.questionBank;
    // reset locks
    this.lockedQuestions.clear();
    if (config.blockId !== 'all') {
      pool = pool.filter(q => q.blockId === config.blockId);
    }
    // Randomize
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(config.numberOfQuestions, shuffled.length));

    this.state = {
      config,
      questions: selected,
      currentIndex: 0,
      answers: [],
      startedAt: new Date()
    };
  }

  startQuizWithQuestions(config: QuizConfig, questions: Question[]) {
    // Start a quiz with specific questions (e.g., incorrect ones)
    this.lockedQuestions.clear();
    this.state = {
      config,
      questions,
      currentIndex: 0,
      answers: [],
      startedAt: new Date()
    };
  }

  getState(): QuizState | null { return this.state; }

  getCurrentQuestion(): Question | null {
    if (!this.state) return null;
    return this.state.questions[this.state.currentIndex] || null;
  }

  isQuestionLocked(questionId: string): boolean {
    return this.lockedQuestions.has(questionId);
  }

  isCurrentQuestionLocked(): boolean {
    const q = this.getCurrentQuestion();
    return !!(q && this.isQuestionLocked(q.id));
  }

  answerCurrentQuestion(answerId: string): UserAnswer | null {
    if (!this.state) return null;
    const q = this.getCurrentQuestion();
    if (!q) return null;
    // If question is locked, do not allow changes
    if (this.lockedQuestions.has(q.id)) {
      const existing = this.state.answers.find(a => a.questionId === q.id) || null;
      return existing;
    }
    const isCorrect = q.correctAnswerId === answerId;
    const ua: UserAnswer = { questionId: q.id, selectedAnswerId: answerId, isCorrect };
    // Record or update
    const idx = this.state.answers.findIndex(a => a.questionId === q.id);
    if (idx >= 0) this.state.answers[idx] = ua; else this.state.answers.push(ua);
    // Lock after answering so it cannot be changed later
    this.lockedQuestions.add(q.id);
    return ua;
  }

  next(): boolean {
    if (!this.state) return false;
    if (this.state.currentIndex < this.state.questions.length - 1) {
      this.state.currentIndex++;
      return true;
    }
    return false;
  }

  prev(): boolean {
    if (!this.state) return false;
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      return true;
    }
    return false;
  }

  finish() {
    if (!this.state) return;
    this.state.finishedAt = new Date();
  }

  getScore() {
    if (!this.state) return { correct: 0, total: 0 };
    const correct = this.state.answers.filter(a => a.isCorrect).length;
    return { correct, total: this.state.questions.length };
  }
}
