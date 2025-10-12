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
          <label>Bloque</label>
          <select [(ngModel)]="block" (ngModelChange)="onBlockChange()">
            <option [ngValue]="'all'">0. Todos (aleatorio)</option>
            <option [ngValue]="1">1. Concepts</option>
            <option [ngValue]="2">2. Introduction to the ADM</option>
            <option [ngValue]="3">3. Introduction to ADM Techniques</option>
            <option [ngValue]="4">4. Introduction to Applying the ADM</option>
            <option [ngValue]="5">5. Introduction to Architecture Governance</option>
            <option [ngValue]="6">6. Architecture Content</option>
          </select>
        </div>
        <div>
          <label>Nº de preguntas</label>
          <input type="number" [(ngModel)]="count" min="1" [max]="maxCount" />
          <div class="badge">Máx: {{ maxCount }}</div>
        </div>
        <div>
          <label>Modo de feedback</label>
          <select [(ngModel)]="mode">
            <option value="immediate">Mostrar al responder</option>
            <option value="end">Mostrar al final</option>
          </select>
        </div>
      </div>
      <hr />
      <button class="button" (click)="start()" [disabled]="totalQuestions === 0">Comenzar</button>
    </div>
  `
})
export class HomeComponent {
  certifications: Certification[] = [
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
  block: number | 'all' = 'all';
  count = 10;
  mode: 'immediate' | 'end' = 'immediate';
  totalQuestions = 0;

  constructor(
    private http: HttpClient,
    private parser: QuestionParserService,
    private quiz: QuizService,
    private router: Router
  ) {}

  selectCertification(certId: string) {
    this.selectedCertId = certId;
    this.loadQuestionsForCertification(certId);
  }

  private getAssetPath(certId: string): string {
    switch (certId) {
      case 'togaf10':
        return 'assets/examples/togaf-sample.txt';
      case 'whatever':
        // Usa el mismo sample como placeholder; sustituye por el tuyo si procede
        return 'assets/examples/togaf-sample.txt';
      default:
        return 'assets/examples/togaf-sample.txt';
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
    const cfg: QuizConfig = {
      certificationId: this.selectedCertId,
      blockId: this.block,
      numberOfQuestions: Math.max(1, Math.min(this.count, this.maxCount)),
      feedbackMode: this.mode
    };
    this.quiz.startQuiz(cfg);
    this.router.navigate(['/quiz']);
  }
}
