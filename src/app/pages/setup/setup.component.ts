import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionParserService } from '../../services/question-parser.service';
import { QuizService } from '../../services/quiz.service';
import { QuizConfig } from '../../models';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h1>Configurar examen</h1>
      <p>Sube tu archivo de preguntas en texto plano. Marca la respuesta correcta con un *. Opcionalmente usa #BLOCK n para indicar el bloque (incluido #BLOCK 0). Si no indicas bloque, se asigna el bloque 0 por defecto y entra en "Todos".</p>
      <input type="file" (change)="onFile($event)" accept=".txt,.md,.text" />
      <div *ngIf="totalQuestions > 0" class="badge">{{ totalQuestions }} preguntas cargadas</div>
    </div>

    <div class="card">
      <div class="row">
        <div>
          <label>Bloque</label>
          <select [(ngModel)]="block">
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
          <label>N� de preguntas</label>
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
export class SetupComponent {
  certificationId = 'togaf10';
  block: number | 'all' = 'all';
  count = 10;
  mode: 'immediate' | 'end' = 'immediate';
  totalQuestions = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parser: QuestionParserService,
    private quiz: QuizService
  ) {
    const qp = this.route.snapshot.queryParamMap;
    this.certificationId = qp.get('certificationId') || 'togaf10';
  }

  get maxCount() {
    if (this.block === 'all') return this.totalQuestions;
    // estimate based on loaded bank by block
    const byBlock = this.quiz.getQuestionBank().filter(q => q.blockId === this.block).length;
    return byBlock || this.totalQuestions;
  }

  async onFile(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await file.text();
    const questions = this.parser.parse(text);
    this.quiz.setQuestionBank(questions);
    this.totalQuestions = questions.length;
  }

  start() {
    const cfg: QuizConfig = {
      certificationId: this.certificationId,
      blockId: this.block,
      numberOfQuestions: Math.max(1, Math.min(this.count, this.maxCount)),
      feedbackMode: this.mode
    };
    this.quiz.startQuiz(cfg);
    this.router.navigate(['/quiz']);
  }
}
