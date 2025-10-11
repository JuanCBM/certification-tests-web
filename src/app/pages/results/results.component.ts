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
      <p class="badge">Puntuación: {{ score.correct }} / {{ score.total }}</p>
      <a class="button" routerLink="/">Nuevo examen</a>
    </div>

    <div class="card" *ngFor="let item of review">
      <div class="question">{{ item.q.text }}</div>
      <ul>
        <li *ngFor="let opt of item.q.options"
            [class]="opt.id === item.q.correctAnswerId ? 'badge' : ''">
          <strong>{{ opt.id }})</strong> {{ opt.text }}
          <span *ngIf="opt.id === item.q.correctAnswerId"> (Correcta)</span>
          <span *ngIf="opt.id === item.userAnswer"> (Tu respuesta)</span>
        </li>
      </ul>
    </div>

    <ng-template #empty>
      <div class="card">
        <h2>No hay resultados para mostrar.</h2>
        <a class="button" routerLink="/">Ir al inicio</a>
      </div>
    </ng-template>
  `
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
}
