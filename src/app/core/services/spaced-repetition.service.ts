import { Injectable } from '@angular/core';
import { SpacedRepetitionEntry, UserProgress } from '../models/progress.model';
import { Question } from '../models/question.model';

const WEIGHT_MULTIPLIER_ON_WRONG = 2;
const WEIGHT_DIVISOR_ON_CORRECT = 2;
const CONSECUTIVE_CORRECT_THRESHOLD = 3;
const MAX_WEIGHT = 10;
const MIN_WEIGHT = 1;

@Injectable({ providedIn: 'root' })
export class SpacedRepetitionService {
  defaultEntry(): SpacedRepetitionEntry {
    return { weight: MIN_WEIGHT, consecutiveCorrect: 0, lastAnsweredAt: null };
  }

  onCorrect(entry: SpacedRepetitionEntry): SpacedRepetitionEntry {
    const consecutiveCorrect = entry.consecutiveCorrect + 1;
    const weight =
      consecutiveCorrect >= CONSECUTIVE_CORRECT_THRESHOLD
        ? Math.max(MIN_WEIGHT, Math.floor(entry.weight / WEIGHT_DIVISOR_ON_CORRECT))
        : entry.weight;
    return { weight, consecutiveCorrect, lastAnsweredAt: new Date().toISOString() };
  }

  onWrong(entry: SpacedRepetitionEntry): SpacedRepetitionEntry {
    return {
      weight: Math.min(MAX_WEIGHT, entry.weight * WEIGHT_MULTIPLIER_ON_WRONG),
      consecutiveCorrect: 0,
      lastAnsweredAt: new Date().toISOString(),
    };
  }

  /**
   * Tirage pondéré : les questions ratées ont un poids plus élevé.
   * Exclut lastQuestionId pour éviter deux fois la même question de suite.
   */
  selectNext(questions: Question[], progress: UserProgress, lastQuestionId?: string): Question {
    const pool = questions.filter(q => q.id !== lastQuestionId);
    // Si la session n'a qu'une question, on ne peut pas exclure
    const source = pool.length > 0 ? pool : questions;

    const weights = source.map(
      q => (progress.spacedRepetition[q.id] ?? this.defaultEntry()).weight
    );
    const total = weights.reduce((sum, w) => sum + w, 0);
    let rand = Math.random() * total;

    for (let i = 0; i < source.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return source[i];
    }
    return source[source.length - 1];
  }
}
