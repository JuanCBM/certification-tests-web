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
      <div class="question">
        {{ question.text }}
        <span *ngIf="question.isMultiSelect" class="multiselect-badge">(Multiselección)</span>
      </div>
      <div class="images" *ngIf="question.imageUrls?.length">
        <img *ngFor="let url of question.imageUrls" [src]="url" alt="Referencia" style="max-width: 100%; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px;" />
      </div>
      <div class="answers">
        <div
          class="answer"
          [ngClass]="{
            'correct': showImmediate && revealed && isCorrect(opt.id),
            'incorrect': showImmediate && revealed && isSelected(opt.id) && !isCorrect(opt.id),
            'selected': isSelected(opt.id) && (!showImmediate || !revealed)
          }"
          *ngFor="let opt of question.options"
          (click)="select(opt.id)"
        >
          <span *ngIf="question.isMultiSelect" class="checkbox">
            <input type="checkbox" [checked]="isSelected(opt.id)" [disabled]="locked || (showImmediate && revealed)" />
          </span>
          <strong>{{ opt.id }})</strong> {{ opt.text }}
        </div>
      </div>

      <div class="actions">
        <button class="button secondary" (click)="prev()" [disabled]="index === 0">Anterior</button>
        <button class="button" (click)="next()" *ngIf="index < total - 1">Siguiente</button>
        <button class="button" (click)="finish()" *ngIf="index === total - 1">Finalizar</button>
        <button class="button warning" (click)="finishEarly()" *ngIf="index < total - 1" style="margin-left: auto;">Terminar Examen</button>
      </div>
    </div>

    <ng-template #empty>
      <div class="card">
        <h2>No hay preguntas cargadas.</h2>
        <p>Vuelve al inicio y selecciona una certificación para empezar.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .multiselect-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      background-color: #4CAF50;
      color: white;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: bold;
    }
    .checkbox {
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }
    .checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  `]
})
export class QuizComponent {
  showImmediate = false;
  question: Question | null = null;
  index = 0;
  total = 0;
  selectedId: string | null = null; // For single-select questions
  selectedIds: Set<string> = new Set(); // For multi-select questions
  revealed = false; // show feedback only after pressing Siguiente/Finalizar in immediate mode
  locked = false;

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

    if (this.question?.isMultiSelect) {
      this.selectedIds = new Set(ua?.selectedAnswerIds || []);
      this.selectedId = null;
    } else {
      this.selectedId = ua?.selectedAnswerId || null;
      this.selectedIds.clear();
    }

    this.revealed = this.showImmediate && !!ua; // reveal if this question was already answered
    this.locked = this.question ? this.quiz.isQuestionLocked(this.question.id) : false;
  }

  select(id: string) {
    // Prevent changes if locked or already revealed in immediate mode
    if (this.locked || (this.showImmediate && this.revealed)) {
      return;
    }

    if (this.question?.isMultiSelect) {
      // Toggle selection for multi-select
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    } else {
      // Single selection
      this.selectedId = id;
    }
  }

  isSelected(id: string): boolean {
    if (this.question?.isMultiSelect) {
      return this.selectedIds.has(id);
    }
    return this.selectedId === id;
  }

  isCorrect(id: string): boolean {
    if (this.question?.isMultiSelect) {
      return this.question.correctAnswerIds?.includes(id) || false;
    }
    return this.question?.correctAnswerId === id;
  }

  next() {
    const state = this.quiz.getState();
    if (!state) return;

    if (this.showImmediate) {
      if (!this.revealed) {
        // Save answer before revealing
        if (this.question?.isMultiSelect) {
          if (this.selectedIds.size > 0) {
            this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
          }
        } else {
          if (this.selectedId) {
            this.quiz.answerCurrentQuestion(this.selectedId);
          }
        }
        this.revealed = true; // show feedback, stay on current question
        return;
      }
    } else {
      // end mode: record answer when moving forward
      if (this.question?.isMultiSelect) {
        if (this.selectedIds.size > 0) {
          this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
        }
      } else {
        if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
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
        // Save answer before revealing
        if (this.question?.isMultiSelect) {
          if (this.selectedIds.size > 0) {
            this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
          }
        } else {
          if (this.selectedId) {
            this.quiz.answerCurrentQuestion(this.selectedId);
          }
        }
        this.revealed = true; // show feedback before finishing
        return;
      }
    } else {
      if (this.question?.isMultiSelect) {
        if (this.selectedIds.size > 0) {
          this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
        }
      } else {
        if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
      }
    }

    this.quiz.finish();
    this.router.navigate(['/results']);
  }

  finishEarly() {
    const answeredCount = this.quiz.getState()?.answers.length || 0;
    const totalQuestions = this.total;
    const unansweredCount = totalQuestions - answeredCount;

    const message = unansweredCount > 0
      ? `¿Estás seguro de que quieres terminar el examen?\n\nHas respondido ${answeredCount} de ${totalQuestions} preguntas.\nQuedan ${unansweredCount} preguntas sin responder.`
      : `¿Estás seguro de que quieres terminar el examen?\n\nHas respondido todas las ${answeredCount} preguntas.`;

    if (confirm(message)) {
      // Save current answer if there is one selected and not yet saved
      const hasSelection = this.question?.isMultiSelect
        ? this.selectedIds.size > 0
        : !!this.selectedId;

      if (hasSelection && !this.showImmediate) {
        if (this.question?.isMultiSelect) {
          this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
        } else if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
      } else if (hasSelection && this.showImmediate && !this.revealed) {
        if (this.question?.isMultiSelect) {
          this.quiz.answerCurrentQuestion(Array.from(this.selectedIds));
        } else if (this.selectedId) {
          this.quiz.answerCurrentQuestion(this.selectedId);
        }
      }

      this.quiz.finish();
      this.router.navigate(['/results']);
    }
  }
}
