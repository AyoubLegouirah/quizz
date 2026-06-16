import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { Question, Category } from '../../core/models/question.model';
import { SessionResult } from '../../core/models/progress.model';

const CATEGORY_LABELS: Record<Category | 'random', string> = {
  java_spring:        'Java / Spring Boot',
  angular_typescript: 'Angular / TypeScript',
  postgresql_jpa:     'PostgreSQL / JPA',
  rest_http:          'REST / HTTP',
  docker_git:         'Docker / Git',
  tests_maven_bigo:   'Tests / Maven / Big O',
  cicd:               'CI/CD',
  random:             'Aléatoire',
};

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly result: SessionResult = this.quizService.getSessionResult();
  readonly missedQuestions: Question[] = this.quizService.getQuestionsByIds(
    this.result.missedQuestionIds
  );
  readonly expandedIds = signal(new Set<string>());

  get scorePercent(): number {
    if (this.result.totalQuestions === 0) return 0;
    return Math.round((this.result.correctAnswers / this.result.totalQuestions) * 100);
  }

  get categoryLabel(): string {
    return CATEGORY_LABELS[this.result.category];
  }

  get formattedDuration(): string {
    const m = Math.floor(this.result.durationSeconds / 60);
    const s = this.result.durationSeconds % 60;
    return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
  }

  get scoreEmoji(): string {
    const p = this.scorePercent;
    if (p >= 80) return '🏆';
    if (p >= 60) return '👍';
    if (p >= 40) return '💪';
    return '📚';
  }

  toggleExpand(id: string): void {
    const next = new Set(this.expandedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expandedIds.set(next);
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  replayCategory(): void {
    this.router.navigate(['/quiz'], { queryParams: { category: this.result.category } });
  }

  replayMissed(): void {
    // Démarre une session sur la même catégorie — la répétition espacée remontera
    // naturellement les questions ratées (poids × 2 appliqué dans QuizService.answer())
    this.router.navigate(['/quiz'], { queryParams: { category: this.result.category } });
  }

  getCorrectOption(q: Question): string {
    return q.options[q.correctIndex];
  }
}
