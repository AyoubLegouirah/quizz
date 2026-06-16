import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { QuizService } from '../../core/services/quiz.service';
import { Category, DifficultyFilter } from '../../core/models/question.model';
import { UserProgress } from '../../core/models/progress.model';

interface CategoryOption {
  key: Category | 'random';
  label: string;
  icon: string;
}

interface DifficultyOption {
  key: DifficultyFilter;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: 'random',             label: 'Aléatoire',            icon: '🎲' },
  { key: 'java_spring',        label: 'Java / Spring Boot',   icon: '☕' },
  { key: 'angular_typescript', label: 'Angular / TypeScript', icon: '🔺' },
  { key: 'postgresql_jpa',     label: 'PostgreSQL / JPA',     icon: '🐘' },
  { key: 'rest_http',          label: 'REST / HTTP',          icon: '🌐' },
  { key: 'docker_git',         label: 'Docker / Git',         icon: '🐳' },
  { key: 'tests_maven_bigo',   label: 'Tests / Maven / Big O',icon: '🧪' },
  { key: 'cicd',               label: 'CI/CD',                icon: '⚙️' },
];

const DIFFICULTIES: DifficultyOption[] = [
  { key: 'toutes',   label: 'Toutes' },
  { key: 'facile',   label: 'Facile' },
  { key: 'moyen',    label: 'Moyen' },
  { key: 'difficile',label: 'Difficile' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly difficulties = DIFFICULTIES;
  readonly selected = signal<Category | 'random'>('random');
  readonly selectedDifficulty = signal<DifficultyFilter>('toutes');

  // Chargé une fois au rendu — synchrone (localStorage)
  readonly userProgress: UserProgress | null = (() => {
    const p = this.quizService.getUserProgress();
    return p.totalAnswered > 0 ? p : null;
  })();

  select(key: Category | 'random'): void {
    this.selected.set(key);
  }

  selectDifficulty(key: DifficultyFilter): void {
    this.selectedDifficulty.set(key);
  }

  start(): void {
    this.router.navigate(['/quiz'], {
      queryParams: { category: this.selected(), difficulty: this.selectedDifficulty() },
    });
  }

  get globalAccuracy(): number {
    const p = this.userProgress;
    if (!p || p.totalAnswered === 0) return 0;
    return Math.round((p.totalCorrect / p.totalAnswered) * 100);
  }
}
