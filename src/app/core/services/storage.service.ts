import { Injectable } from '@angular/core';
import { UserProgress } from '../models/progress.model';

const STORAGE_KEY = 'quiz_user_progress';

@Injectable({ providedIn: 'root' })
export class StorageService {
  loadProgress(): UserProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserProgress) : this.defaultProgress();
    } catch {
      return this.defaultProgress();
    }
  }

  saveProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  clearProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  defaultProgress(): UserProgress {
    return {
      spacedRepetition: {},
      bookmarked: [],
      categoryStats: {},
      totalAnswered: 0,
      totalCorrect: 0,
    };
  }
}
