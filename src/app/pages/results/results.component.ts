import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card" *ngIf="loaded; else empty">
      <h1>Resultados</h1>
      <p class="badge">Puntuación: {{ score.correct }} / {{ score.total }} ({{ getPercent() }}%)</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a class="button" routerLink="/">Nuevo examen</a>
        <button class="button secondary" (click)="goToReview()">Ver todas las preguntas con respuestas</button>
      </div>
    </div>

    <div class="card" *ngFor="let item of review; let i = index">
      <div class="question-header">
        <div class="badge">Pregunta {{ i + 1 }}</div>
      </div>
      <div class="question">{{ item.q.text }}</div>
      <div class="images" *ngIf="item.q.imageUrls?.length">
        <img *ngFor="let url of item.q.imageUrls" [src]="url" alt="Referencia" style="max-width: 100%; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px;" />
      </div>
      <div class="answers">
        <div
          class="answer answer-with-badge"
          *ngFor="let opt of item.q.options"
          [ngClass]="{
            'correct-answer': opt.id === item.q.correctAnswerId,
            'incorrect-answer': opt.id === item.userAnswer && opt.id !== item.q.correctAnswerId,
            'selected': opt.id === item.userAnswer && opt.id !== item.q.correctAnswerId
          }"
        >
          <span class="answer-text">
            <strong>{{ opt.id }})</strong> {{ opt.text }}
          </span>
          <span class="correct-badge" *ngIf="opt.id === item.q.correctAnswerId">Correcta</span>
          <span class="user-badge" *ngIf="opt.id === item.userAnswer && opt.id !== item.q.correctAnswerId">Tu respuesta</span>
        </div>
      </div>
      <div class="explanation" *ngIf="item.q.explanation">
        <strong>Explicacion:</strong> {{ item.q.explanation }}
      </div>
    </div>

    <ng-template #empty>
      <div class="card">
        <h2>No hay resultados para mostrar.</h2>
        <a class="button" routerLink="/">Ir al inicio</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .question-header {
      margin-bottom: 12px;
    }
    
    .answer-with-badge {
      position: relative;
      padding-right: 120px !important;
    }
    
    .answer-text {
      display: block;
      width: 100%;
    }
    
    .correct-answer {
      background-color: #d4edda !important;
      border-color: #28a745 !important;
      font-weight: 500;
    }
    
    .incorrect-answer {
      background-color: #f8d7da !important;
      border-color: #dc3545 !important;
    }
    
    .correct-badge,
    .user-badge {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    
    .correct-badge {
      background-color: #28a745;
    }
    
    .user-badge {
      background-color: #dc3545;
    }
    
    .answer-with-badge:hover .correct-badge,
    .answer-with-badge:hover .user-badge,
    .answer-with-badge:active .correct-badge,
    .answer-with-badge:active .user-badge {
      opacity: 0;
    }
    
    .explanation {
      margin-top: 16px;
      padding: 16px;
      background-color: #f0f8ff;
      border-left: 4px solid #4a90e2;
      border-radius: 4px;
      font-size: 0.95em;
      line-height: 1.6;
    }
  `]
})
export class ResultsComponent {
  loaded = false;
  score = { correct: 0, total: 0 };
  review: { q: any, userAnswer: string | null }[] = [];

  constructor(private quiz: QuizService, private router: Router) {
    const state = this.quiz.getState();
    if (!state) return;
    this.score = this.quiz.getScore();
    this.review = state.questions.map(q => ({
      q,
      userAnswer: state.answers.find(a => a.questionId === q.id)?.selectedAnswerId || null
    }));
    this.loaded = true;
  }

  getPercent(): string {
    if (!this.score.total) return '0';
    return ((this.score.correct / this.score.total) * 100).toFixed(1);
  }

  goToReview() {
    this.router.navigate(['/review']);
  }
}
