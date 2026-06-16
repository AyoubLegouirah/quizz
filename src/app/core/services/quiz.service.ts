import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Category, DifficultyFilter, Question, QuestionState } from '../models/question.model';
import { CategoryStats, SessionResult, UserProgress } from '../models/progress.model';
import { StorageService } from './storage.service';
import { SpacedRepetitionService } from './spaced-repetition.service';

const DEFAULT_SESSION_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly sr = inject(SpacedRepetitionService);

  private allQuestions: Question[] = [];
  private userProgress: UserProgress = this.storage.defaultProgress();
  private sessionPool: Question[] = [];
  private sessionSize = DEFAULT_SESSION_SIZE;
  private sessionStart = 0;
  private missedIds: string[] = [];
  private lastQuestionId: string | undefined;

  private readonly _category = signal<Category | 'random'>('random');
  private readonly _answeredCount = signal(0);
  private readonly _score = signal(0);
  private readonly _streak = signal(0);
  private readonly _bestStreak = signal(0);
  private readonly _isComplete = signal(false);

  readonly currentState = signal<QuestionState | null>(null);
  readonly category = this._category.asReadonly();
  readonly score = this._score.asReadonly();
  readonly streak = this._streak.asReadonly();
  readonly isComplete = this._isComplete.asReadonly();
  readonly progress = computed(() => ({
    current: this._answeredCount(),
    total: this.sessionSize,
  }));

  async loadQuestions(): Promise<void> {
    if (this.allQuestions.length > 0) return;
    this.allQuestions = await firstValueFrom(
      this.http.get<Question[]>('assets/data/questions.json')
    );
  }

  async startSession(
    category: Category | 'random',
    size = DEFAULT_SESSION_SIZE,
    difficulty: DifficultyFilter | null = null,
  ): Promise<void> {
    await this.loadQuestions();
    this.userProgress = this.storage.loadProgress();
    this._category.set(category);
    this.sessionSize = size;
    const byCategory =
      category === 'random'
        ? [...this.allQuestions]
        : this.allQuestions.filter(q => q.category === category);
    this.sessionPool =
      difficulty && difficulty !== 'toutes'
        ? byCategory.filter(q => q.difficulty === difficulty)
        : byCategory;
    this._answeredCount.set(0);
    this._score.set(0);
    this._streak.set(0);
    this._bestStreak.set(0);
    this._isComplete.set(false);
    this.missedIds = [];
    this.lastQuestionId = undefined;
    this.sessionStart = Date.now();
    this.showNextQuestion();
  }

  answer(selectedIndex: number): void {
    const state = this.currentState();
    if (!state || state.selectedIndex !== null) return;

    const { question } = state;
    const isCorrect = selectedIndex === question.correctIndex;

    // Répétition espacée
    const entry = this.userProgress.spacedRepetition[question.id] ?? this.sr.defaultEntry();
    this.userProgress.spacedRepetition[question.id] = isCorrect
      ? this.sr.onCorrect(entry)
      : this.sr.onWrong(entry);

    // Statistiques par catégorie
    const stats: CategoryStats = this.userProgress.categoryStats[question.category] ?? {
      category: question.category,
      total: 0,
      correct: 0,
      streak: 0,
    };
    stats.total++;
    if (isCorrect) {
      stats.correct++;
      stats.streak++;
    } else {
      stats.streak = 0;
    }
    this.userProgress.categoryStats[question.category] = stats;

    // Compteurs globaux
    this.userProgress.totalAnswered++;
    if (isCorrect) this.userProgress.totalCorrect++;

    // Streak et score de session
    if (isCorrect) {
      this._score.update(s => s + 1);
      const newStreak = this._streak() + 1;
      this._streak.set(newStreak);
      if (newStreak > this._bestStreak()) this._bestStreak.set(newStreak);
    } else {
      this._streak.set(0);
      this.missedIds.push(question.id);
    }

    this._answeredCount.update(n => n + 1);
    this.storage.saveProgress(this.userProgress);
    this.currentState.set({ ...state, selectedIndex, isCorrect });
  }

  next(): void {
    this.showNextQuestion();
  }

  toggleBookmark(): void {
    const state = this.currentState();
    if (!state) return;
    const { id } = state.question;
    const idx = this.userProgress.bookmarked.indexOf(id);
    if (idx === -1) {
      this.userProgress.bookmarked.push(id);
    } else {
      this.userProgress.bookmarked.splice(idx, 1);
    }
    this.storage.saveProgress(this.userProgress);
    this.currentState.set({ ...state, markedForReview: idx === -1 });
  }

  getSessionResult(): SessionResult {
    return {
      category: this._category(),
      totalQuestions: this._answeredCount(),
      correctAnswers: this._score(),
      bestStreak: this._bestStreak(),
      durationSeconds: Math.round((Date.now() - this.sessionStart) / 1000),
      missedQuestionIds: [...this.missedIds],
    };
  }

  /** Expose le progrès global pour la page Progress. */
  getUserProgress(): UserProgress {
    return this.storage.loadProgress();
  }

  /** Utilisé par ResultsComponent pour afficher les questions ratées. */
  getQuestionsByIds(ids: string[]): Question[] {
    if (ids.length === 0) return [];
    const idSet = new Set(ids);
    return this.allQuestions.filter(q => idSet.has(q.id));
  }

  private showNextQuestion(): void {
    if (this._answeredCount() >= this.sessionSize || this.sessionPool.length === 0) {
      this._isComplete.set(true);
      return;
    }
    const next = this.sr.selectNext(this.sessionPool, this.userProgress, this.lastQuestionId);
    const entry = this.userProgress.spacedRepetition[next.id] ?? this.sr.defaultEntry();
    this.currentState.set({
      question: next,
      weight: entry.weight,
      selectedIndex: null,
      isCorrect: null,
      markedForReview: this.userProgress.bookmarked.includes(next.id),
    });
    this.lastQuestionId = next.id;
  }
}
