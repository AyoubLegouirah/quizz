import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { Category } from '../../core/models/question.model';
import { CategoryStats, UserProgress } from '../../core/models/progress.model';

interface CategoryRow {
  key: Category;
  label: string;
  icon: string;
  stats: CategoryStats | null;
  masteryRate: number;
  colorClass: 'red' | 'orange' | 'green' | 'empty';
}

const CATEGORY_META: Array<{ key: Category; label: string; icon: string }> = [
  { key: 'java_spring',        label: 'Java / Spring Boot',    icon: '☕' },
  { key: 'angular_typescript', label: 'Angular / TypeScript',  icon: '🔺' },
  { key: 'postgresql_jpa',     label: 'PostgreSQL / JPA',      icon: '🐘' },
  { key: 'rest_http',          label: 'REST / HTTP',           icon: '🌐' },
  { key: 'docker_git',         label: 'Docker / Git',          icon: '🐳' },
  { key: 'tests_maven_bigo',   label: 'Tests / Maven / Big O', icon: '🧪' },
  { key: 'cicd',               label: 'CI/CD',                 icon: '⚙️' },
];

function colorClass(rate: number, hasData: boolean): 'red' | 'orange' | 'green' | 'empty' {
  if (!hasData) return 'empty';
  if (rate < 40)  return 'red';
  if (rate < 70)  return 'orange';
  return 'green';
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
})
export class ProgressComponent {
  private readonly quizService = inject(QuizService);

  readonly progress: UserProgress = this.quizService.getUserProgress();

  readonly rows: CategoryRow[] = CATEGORY_META.map(({ key, label, icon }) => {
    const stats = this.progress.categoryStats[key] ?? null;
    const rate = stats && stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0;
    return { key, label, icon, stats, masteryRate: rate, colorClass: colorClass(rate, !!stats) };
  });

  get globalAccuracy(): number {
    const { totalAnswered, totalCorrect } = this.progress;
    return totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  }

  get hasPlayed(): boolean {
    return this.progress.totalAnswered > 0;
  }
}
