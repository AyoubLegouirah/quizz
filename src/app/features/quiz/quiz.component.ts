import { Component, inject, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { Category } from '../../core/models/question.model';

const CATEGORY_LABELS: Record<Category | 'random', string> = {
  java_spring: 'Java / Spring Boot',
  angular_typescript: 'Angular / TypeScript',
  postgresql_jpa: 'PostgreSQL / JPA',
  rest_http: 'REST / HTTP',
  docker_git: 'Docker / Git',
  tests_maven_bigo: 'Tests / Maven / Big O',
  cicd: 'CI/CD',
  random: 'Aléatoire',
};

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly state = this.quizService.currentState;
  readonly score = this.quizService.score;
  readonly streak = this.quizService.streak;
  readonly progress = this.quizService.progress;
  readonly letters = ['A', 'B', 'C', 'D'];

  constructor() {
    const category = (this.route.snapshot.queryParamMap.get('category') ?? 'random') as
      | Category
      | 'random';
    this.quizService.startSession(category);

    effect(() => {
      if (this.quizService.isComplete()) {
        this.router.navigate(['/results']);
      }
    });
  }

  getCategoryLabel(category: Category | 'random'): string {
    return CATEGORY_LABELS[category];
  }

  answer(index: number): void {
    this.quizService.answer(index);
  }

  next(): void {
    this.quizService.next();
  }

  toggleBookmark(): void {
    this.quizService.toggleBookmark();
  }

  getOptionClass(optionIndex: number): string {
    const s = this.state();
    if (!s || s.selectedIndex === null) return '';
    if (optionIndex === s.question.correctIndex) return 'correct';
    if (optionIndex === s.selectedIndex) return 'wrong';
    return 'dimmed';
  }
}
