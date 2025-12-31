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
      <label>Certificación</label>
      <select [(ngModel)]="certificationId" (ngModelChange)="onCertificationChange()">
        <option value="gh300">GH-300 - GitHub Copilot</option>
        <option value="togaf10">TOGAF 10 - Foundation</option>
      </select>
      <p>Sube tu archivo de preguntas en texto plano. Marca la respuesta correcta con un *. Usa #BLOCK n para indicar el bloque/dominio.</p>
      <input type="file" (change)="onFile($event)" accept=".txt,.md,.text" />
      <div *ngIf="totalQuestions > 0" class="badge">{{ totalQuestions }} preguntas cargadas</div>
    </div>

    <div class="card">
      <div class="row">
        <div>
          <label>Bloque/Dominio</label>
          <select [(ngModel)]="block">
            <option [ngValue]="'all'">0. Todos (aleatorio)</option>
            <ng-container *ngFor="let b of currentBlocks">
              <option [ngValue]="b.id">{{ b.id }}. {{ b.name }}</option>
            </ng-container>
          </select>
        </div>
        <div>
          <label>Nºde preguntas</label>
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
  certifications = [
    {
      id: 'gh300',
      blocks: [
        { id: 1, name: 'Responsible AI (7%)' },
        { id: 2, name: 'GitHub Copilot plans and features (31%)' },
        { id: 3, name: 'How GitHub Copilot works and handles data (15%)' },
        { id: 4, name: 'Prompt Crafting and Prompt Engineering (9%)' },
        { id: 5, name: 'Developer use cases for AI (14%)' },
        { id: 6, name: 'Testing with GitHub Copilot (9%)' },
        { id: 7, name: 'Privacy fundamentals and context exclusions (15%)' },
        { id: 8, name: 'Koenig Questions (100%)' }
      ]
    },
    {
      id: 'togaf10',
      blocks: [
        { id: 1, name: 'Concepts' },
        { id: 2, name: 'Introduction to the ADM' },
        { id: 3, name: 'Introduction to ADM Techniques' },
        { id: 4, name: 'Introduction to Applying the ADM' },
        { id: 5, name: 'Introduction to Architecture Governance' },
        { id: 6, name: 'Architecture Content' }
      ]
    }
  ];
  certificationId = 'gh300';
  block: number | 'all' = 'all';
  count = 10;
  mode: 'immediate' | 'end' = 'immediate';
  totalQuestions = 0;
  currentBlocks = this.certifications[0].blocks;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parser: QuestionParserService,
    private quiz: QuizService
  ) {
    const qp = this.route.snapshot.queryParamMap;
    this.certificationId = qp.get('certificationId') || 'gh300';
    this.onCertificationChange();
  }

  onCertificationChange() {
    const cert = this.certifications.find(c => c.id === this.certificationId);
    this.currentBlocks = cert ? cert.blocks : [];
    this.block = 'all';
    this.totalQuestions = 0;
    this.quiz.setQuestionBank([]);
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
