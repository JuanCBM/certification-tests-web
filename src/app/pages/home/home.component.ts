import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Certification, QuizConfig } from '../../models';
import { QuestionParserService } from '../../services/question-parser.service';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h1>Elige la certificación</h1>
      <p>Selecciona una certificación para practicar tests.</p>
      <div class="row">
        <div class="card" *ngFor="let cert of certifications">
          <h2>{{ cert.title }}</h2>
          <div class="badge">{{ cert.blocks.length }} bloques</div>
          <p>
            <button class="button" (click)="selectCertification(cert.id)">Seleccionar</button>
          </p>
        </div>
      </div>
    </div>

    <div class="card" *ngIf="selectedCertId">
      <h2>Configurar examen</h2>
      <p class="badge" *ngIf="availableQuestions > 0">{{ availableQuestions }} preguntas disponibles</p>

      <div class="row">
        <div>
          <label>Bloque/Dominio</label>
          <select [(ngModel)]="block" (ngModelChange)="onBlockChange()">
            <option [ngValue]="'all'">0. Todos (aleatorio)</option>
            <ng-container *ngFor="let b of currentBlocks">
              <option [ngValue]="b.id">{{ b.id }}. {{ b.name }}</option>
            </ng-container>
          </select>
          <div class="info-message" *ngIf="block === 'all'">
            <small>ℹ️ El bloque "Todos" puede contener más preguntas que la suma de los bloques individuales, ya que incluye preguntas sin categorizar.</small>
          </div>
        </div>
        <div *ngIf="mode !== 'review'">
          <label>Nº de preguntas</label>
          <input type="number" [(ngModel)]="count" min="1" [max]="maxCount" />
          <div class="badge question-count-badge">Máx: {{ maxCount }}</div>
        </div>
        <div *ngIf="mode === 'review'">
          <label>Modo Revisión</label>
          <div class="badge question-count-badge">Se mostrarán todas las {{ maxCount }} preguntas</div>
        </div>
        <div>
          <label>Modo de feedback</label>
          <select [(ngModel)]="mode">
            <option value="immediate">Mostrar al responder</option>
            <option value="end">Mostrar al final</option>
            <option value="review">Modo Revisión</option>
          </select>
        </div>
      </div>
      <hr />
      <button class="button" (click)="start()" [disabled]="totalQuestions === 0">Comenzar</button>
    </div>
  `,
  styles: [`
    .info-message {
      margin-top: 8px;
      padding: 10px;
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      border-radius: 4px;
    }
    
    .info-message small {
      color: #1565c0;
      line-height: 1.5;
      display: block;
    }
    
    .question-count-badge {
      margin-top: 8px;
    }
  `]
})
export class HomeComponent {
  certifications: Certification[] = [
    {
      id: 'gh300',
      title: 'GH-300 - GitHub Copilot',
      blocks: [
        { id: 1, name: 'Responsible AI (7%)' },
        { id: 2, name: 'GitHub Copilot plans and features (31%)' },
        { id: 3, name: 'How GitHub Copilot works and handles data (15%)' },
        { id: 4, name: 'Prompt Crafting and Prompt Engineering (9%)' },
        { id: 5, name: 'Developer use cases for AI (14%)' },
        { id: 6, name: 'Testing with GitHub Copilot (9%)' },
        { id: 7, name: 'Privacy fundamentals and context exclusions (15%)' }
      ]
    },
    {
      id: 'togaf10',
      title: 'TOGAF 10 - Foundation',
      blocks: [
        { id: 1, name: 'Concepts', questionCountHint: 8 },
        { id: 2, name: 'Introduction to the ADM', questionCountHint: 14 },
        { id: 3, name: 'Introduction to ADM Techniques', questionCountHint: 6 },
        { id: 4, name: 'Introduction to Applying the ADM', questionCountHint: 4 },
        { id: 5, name: 'Introduction to Architecture Governance', questionCountHint: 3 },
        { id: 6, name: 'Architecture Content', questionCountHint: 5 }
      ]
    }
  ];

  selectedCertId: string | null = null;
  currentBlocks: any[] = [];
  block: number | 'all' = 'all';
  count = 10;
  mode: 'immediate' | 'end' | 'review' = 'immediate';
  totalQuestions = 0;

  constructor(
    private http: HttpClient,
    private parser: QuestionParserService,
    private quiz: QuizService,
    private router: Router
  ) {}

  selectCertification(certId: string) {
    this.selectedCertId = certId;
    const cert = this.certifications.find(c => c.id === certId);
    this.currentBlocks = cert ? cert.blocks : [];
    this.block = 'all';
    this.loadQuestionsForCertification(certId);
  }

  private getAssetPath(certId: string): string {
    switch (certId) {
      case 'gh300':
        return 'assets/examples/gh300-sample.txt';
      case 'togaf10':
        return 'assets/examples/togaf-sample.txt';
      default:
        return 'assets/examples/gh300-sample.txt';
    }
  }

  private loadQuestionsForCertification(certId: string) {
    const path = this.getAssetPath(certId);
    this.http.get(path, { responseType: 'text' as 'json' }).subscribe({
      next: (text: any) => {
        const questions = this.parser.parse(String(text));
        this.quiz.setQuestionBank(questions);
        this.totalQuestions = questions.length;
      },
      error: () => {
        this.quiz.setQuestionBank([]);
        this.totalQuestions = 0;
      }
    });
  }

  get maxCount() {
    if (this.block === 'all') return this.totalQuestions;
    const byBlock = this.quiz.getQuestionBank().filter(q => q.blockId === this.block).length;
    return byBlock || this.totalQuestions;
  }

  get availableQuestions() {
    return this.maxCount;
  }

  onBlockChange() {
    // Clamp count to new max when block changes
    if (this.count > this.maxCount) {
      this.count = this.maxCount || 1;
    }
  }

  start() {
    if (!this.selectedCertId) return;

    // Si es modo revisión, ir a la página de revisión con todas las preguntas
    if (this.mode === 'review') {
      this.startReview();
      return;
    }

    // Modo normal (immediate o end)
    const cfg: QuizConfig = {
      certificationId: this.selectedCertId,
      blockId: this.block,
      numberOfQuestions: Math.max(1, Math.min(this.count, this.maxCount)),
      feedbackMode: this.mode
    };
    this.quiz.startQuiz(cfg);
    this.router.navigate(['/quiz']);
  }

  startReview() {
    if (!this.selectedCertId) return;
    const allQuestions = this.quiz.getQuestionBank();
    const filteredCount = this.block === 'all'
      ? allQuestions.length
      : allQuestions.filter(q => q.blockId === this.block).length;

    const cfg: QuizConfig = {
      certificationId: this.selectedCertId,
      blockId: this.block,
      numberOfQuestions: filteredCount,
      feedbackMode: 'immediate'
    };
    this.quiz.startQuiz(cfg);
    this.router.navigate(['/review']);
  }
}
