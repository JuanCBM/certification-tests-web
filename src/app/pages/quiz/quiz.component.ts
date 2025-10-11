import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Question } from '../../models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" *ngIf="question; else empty">
      <div class="badge">Pregunta {{ index + 1 }} / {{ total }}</div>
      <div class="question">{{ question.text }}</div>
      <div class="answers">
        <div
          class="answer"
          [ngClass]="{
            'correct': showImmediate && revealed && isCorrect(opt.id),
            'incorrect': showImmediate && revealed && selectedId === opt.id && !isCorrect(opt.id),
            'selected': selectedId === opt.id && (!showImmediate || !revealed)
          }"
          *ngFor="let opt of question.options"
          (click)="select(opt.id)"
        >
          <strong>{{ opt.id }})</strong> {{ opt.text }}
        </div>
      </div>

      <div class="actions">
        <button class="button secondary" (click)="prev()" [disabled]="index === 0">Anterior</button>
        <button class="button" (click)="next()" *ngIf="index < total - 1">Siguiente</button>
        <button class="button" (click)="finish()" *ngIf="index === total - 1">Finalizar</button>
      </div>
    </div>

    <ng-template #empty>
      <div class="card">
        <h2>No hay preguntas cargadas.</h2>
        <p>Vuelve al inicio y selecciona una certificaci�n para empezar.</p>
      </div>
    </ng-template>
  `
})
export class QuizComponent {
  showImmediate = false;
  question: Question | null = null;
  index = 0;
  total = 0;
  selectedId: string | null = null;
  revealed = false; // show feedback only after pressing Siguiente/Finalizar in immediate mode

  constructor(private quiz: QuizService, private router: Router) {
    const state = this.quiz.getState();
    if (!state) {
      this.router.navigate(['/']);
      return;
    }
    this.showImmediate = state.config.feedbackMode === 'immediate';
    this.refresh();
  }

  refresh() {
    const state = this.quiz.getState();
    if (!state) return;
    this.question = this.quiz.getCurrentQuestion();
    this.index = state.currentIndex;
    this.total = state.questions.length;
    const ua = state.answers.find(a => a.questionId === this.question?.id);
    this.selectedId = ua?.selectedAnswerId || null;
    this.revealed = this.showImmediate && !!ua; // reveal if this question was already answered
  }

  select(id: string) {
    // Only select; do not answer/evaluate until pressing Siguiente/Finalizar
    this.selectedId = id;
  }

  isCorrect(id: string) {
    return this.question?.correctAnswerId === id;
  }

  next() {
    const state = this.quiz.getState();
    if (!state) return;

    if (this.showImmediate) {
      if (!this.revealed) {
        if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
        this.revealed = true; // show feedback, stay on current question
        return;
      }
    } else {
      // end mode: record answer when moving forward
      if (this.selectedId) {
        this.quiz.answerCurrentQuestion(this.selectedId);
      }
    }

    // advance to next
    const moved = this.quiz.next();
    if (!moved) {
      this.finish();
      return;
    }
    this.revealed = false;
    this.refresh();
  }

  prev() {
    this.quiz.prev();
    this.refresh();
  }

  finish() {
    const state = this.quiz.getState();
    if (!state) return;

    if (this.showImmediate) {
      if (!this.revealed) {
        if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
        this.revealed = true; // show feedback before finishing
        return;
      }
    } else {
      if (this.selectedId) {
        this.quiz.answerCurrentQuestion(this.selectedId);
      }
    }

    this.quiz.finish();
    this.router.navigate(['/results']);
  }
}
