import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Question } from '../../models';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" *ngIf="questions.length > 0; else empty">
      <div class="badge">Modo Revisión - {{ questions.length }} preguntas totales</div>
      <div class="badge">Mostrando preguntas {{ startIndex + 1 }} - {{ endIndex }} de {{ questions.length }}</div>
      
      <div *ngFor="let question of currentPageQuestions; let i = index" class="review-question">
        <div class="question-header">
          <div class="badge">Pregunta {{ startIndex + i + 1 }}</div>
        </div>
        <div class="question">{{ question.text }}</div>
        
        <div class="images" *ngIf="question.imageUrls?.length">
          <img *ngFor="let url of question.imageUrls" 
               [src]="url" 
               alt="Referencia" 
               style="max-width: 100%; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px;" />
        </div>
        
        <div class="answers">
          <div
            class="answer answer-with-badge"
            *ngFor="let opt of question.options"
            [class.is-correct]="isCorrect(question, opt.id)"
          >
            <span class="answer-text">
              <strong>{{ opt.id }})</strong> {{ opt.text }}
            </span>
            <span class="correct-badge" *ngIf="isCorrect(question, opt.id)">Correcta</span>
          </div>
        </div>
        
        <div class="explanation" *ngIf="question.explanation">
          <strong>Explicacion:</strong> {{ question.explanation }}
        </div>
        
        <hr *ngIf="i < currentPageQuestions.length - 1" style="margin: 32px 0; border: 1px solid #eee;" />
      </div>

      <div class="actions">
        <button class="button secondary" (click)="prevPage()" [disabled]="currentPage === 0">
          &lt; Anterior ({{ pageSize }} preguntas)
        </button>
        <span style="margin: 0 16px; font-weight: 600;">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
        <button class="button" (click)="nextPage()" [disabled]="currentPage === totalPages - 1">
          Siguiente ({{ pageSize }} preguntas) &gt;
        </button>
      </div>
      
      <div class="actions">
        <button class="button secondary" (click)="goHome()">Volver al inicio</button>
      </div>
    </div>

    <ng-template #empty>
      <div class="card">
        <h2>No hay preguntas para revisar</h2>
        <p>Vuelve al inicio y selecciona una certificación para comenzar.</p>
        <button class="button" (click)="goHome()">Volver al inicio</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .review-question {
      margin-bottom: 32px;
      padding-bottom: 16px;
    }
    
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
    
    .answer-with-badge.is-correct {
      background-color: #d4edda !important;
      border-color: #28a745 !important;
      font-weight: 500;
    }
    
    .correct-badge {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background-color: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    
    .answer-with-badge:hover .correct-badge,
    .answer-with-badge:active .correct-badge {
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
    
    .actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
  `]
})
export class ReviewComponent {
  questions: Question[] = [];
  currentPage = 0;
  pageSize = 50;

  constructor(private quiz: QuizService, private router: Router) {
    const state = this.quiz.getState();
    if (!state) {
      // Si no hay un quiz activo, cargar todas las preguntas del banco
      this.questions = this.quiz.getQuestionBank();
    } else {
      // Si hay un quiz activo, usar esas preguntas
      this.questions = state.questions;
    }

    // Si no hay preguntas, intentar cargar del banco
    if (this.questions.length === 0) {
      this.questions = this.quiz.getQuestionBank();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.questions.length / this.pageSize);
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.questions.length);
  }

  get currentPageQuestions(): Question[] {
    return this.questions.slice(this.startIndex, this.endIndex);
  }

  isCorrect(question: Question, optionId: string): boolean {
    return question.correctAnswerId === optionId;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}

