import { Category } from './question.model';

/** Statistiques agrégées pour une catégorie. */
export interface CategoryStats {
  category: Category;
  total: number;
  correct: number;
  /** Nombre de bonnes réponses consécutives actuelles. */
  streak: number;
}

/**
 * Entrée de répétition espacée pour une question.
 * Persistée dans le localStorage, indexée par question id.
 */
export interface SpacedRepetitionEntry {
  /** Poids de tirage (plus élevé = plus souvent sélectionnée). Min 1. */
  weight: number;
  /** Nombre de bonnes réponses consécutives depuis la dernière erreur. */
  consecutiveCorrect: number;
  /** Timestamp ISO de la dernière réponse. */
  lastAnsweredAt: string | null;
}

/** Structure complète persistée dans le localStorage. */
export interface UserProgress {
  /** Map question id → entrée de répétition espacée. */
  spacedRepetition: Record<string, SpacedRepetitionEntry>;
  /** Ids des questions marquées "à revoir". */
  bookmarked: string[];
  /** Statistiques par catégorie. */
  categoryStats: Partial<Record<Category, CategoryStats>>;
  /** Nombre total de questions répondues dans toutes les sessions. */
  totalAnswered: number;
  /** Nombre total de bonnes réponses dans toutes les sessions. */
  totalCorrect: number;
}

/** Résumé d'une session de quiz (affiché sur l'écran Results). */
export interface SessionResult {
  category: Category | 'random';
  totalQuestions: number;
  correctAnswers: number;
  /** Meilleur streak de la session. */
  bestStreak: number;
  durationSeconds: number;
  /** Ids des questions ratées dans cette session. */
  missedQuestionIds: string[];
}
