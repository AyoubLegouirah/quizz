import { TestBed } from '@angular/core/testing';
import { SpacedRepetitionService } from './spaced-repetition.service';
import { SpacedRepetitionEntry, UserProgress } from '../models/progress.model';
import { Question } from '../models/question.model';

const makeEntry = (weight: number, consecutiveCorrect: number): SpacedRepetitionEntry => ({
  weight,
  consecutiveCorrect,
  lastAnsweredAt: null,
});

const makeQuestion = (id: string): Question => ({
  id,
  category: 'java_spring',
  difficulty: 'facile',
  tags: [],
  question: `Question ${id}`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  explanation: '',
});

const makeProgress = (entries: Record<string, SpacedRepetitionEntry>): UserProgress => ({
  spacedRepetition: entries,
  bookmarked: [],
  categoryStats: {},
  totalAnswered: 0,
  totalCorrect: 0,
});

describe('SpacedRepetitionService', () => {
  let service: SpacedRepetitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpacedRepetitionService);
  });

  // ─── onWrong ────────────────────────────────────────────────────────────────

  describe('onWrong()', () => {
    it('cas 1 : double le weight et remet consecutiveCorrect à 0', () => {
      const entry = makeEntry(3, 2);
      const result = service.onWrong(entry);
      expect(result.weight).toBe(6);
      expect(result.consecutiveCorrect).toBe(0);
    });

    it('cas 4 : weight déjà à 10 → reste plafonné à 10', () => {
      const entry = makeEntry(10, 0);
      const result = service.onWrong(entry);
      expect(result.weight).toBe(10);
      expect(result.consecutiveCorrect).toBe(0);
    });

    it('weight 6 raté → plafonné à 10 (6×2=12 > 10)', () => {
      const entry = makeEntry(6, 0);
      const result = service.onWrong(entry);
      expect(result.weight).toBe(10);
    });

    it('met à jour lastAnsweredAt', () => {
      const before = new Date().toISOString();
      const result = service.onWrong(makeEntry(1, 0));
      expect(result.lastAnsweredAt).not.toBeNull();
      expect(result.lastAnsweredAt! >= before).toBe(true);
    });
  });

  // ─── onCorrect ──────────────────────────────────────────────────────────────

  describe('onCorrect()', () => {
    it('cas 2 : 1ère bonne réponse → consecutiveCorrect passe à 1, weight inchangé', () => {
      const entry = makeEntry(4, 0);
      const result = service.onCorrect(entry);
      expect(result.consecutiveCorrect).toBe(1);
      expect(result.weight).toBe(4);
    });

    it('2ème bonne réponse → consecutiveCorrect passe à 2, weight inchangé', () => {
      const entry = makeEntry(4, 1);
      const result = service.onCorrect(entry);
      expect(result.consecutiveCorrect).toBe(2);
      expect(result.weight).toBe(4);
    });

    it('cas 3 : 3ème bonne réponse consécutive → weight divisé par 2', () => {
      const entry = makeEntry(8, 2);
      const result = service.onCorrect(entry);
      expect(result.consecutiveCorrect).toBe(3);
      expect(result.weight).toBe(4);
    });

    it('cas 5 : weight à 1, 3 bonnes réponses → reste planché à 1', () => {
      const entry = makeEntry(1, 2);
      const result = service.onCorrect(entry);
      expect(result.weight).toBe(1);
      expect(result.consecutiveCorrect).toBe(3);
    });

    it('weight 3, 3 bonnes → floor(3/2) = 1', () => {
      const entry = makeEntry(3, 2);
      const result = service.onCorrect(entry);
      expect(result.weight).toBe(1);
    });

    it('met à jour lastAnsweredAt', () => {
      const before = new Date().toISOString();
      const result = service.onCorrect(makeEntry(2, 0));
      expect(result.lastAnsweredAt).not.toBeNull();
      expect(result.lastAnsweredAt! >= before).toBe(true);
    });
  });

  // ─── selectNext ─────────────────────────────────────────────────────────────

  describe('selectNext()', () => {
    it('cas 6 : ne retourne jamais lastQuestionId si le pool contient plusieurs questions', () => {
      const questions = [
        makeQuestion('q1'),
        makeQuestion('q2'),
        makeQuestion('q3'),
      ];
      const progress = makeProgress({});

      for (let i = 0; i < 100; i++) {
        const selected = service.selectNext(questions, progress, 'q1');
        expect(selected.id).not.toBe('q1');
      }
    });

    it('retourne la seule question disponible même si c\'est lastQuestionId (pool = 1)', () => {
      const questions = [makeQuestion('q1')];
      const progress = makeProgress({});
      const selected = service.selectNext(questions, progress, 'q1');
      expect(selected.id).toBe('q1');
    });

    it('favorise statistiquement les questions à weight élevé', () => {
      const questions = [makeQuestion('low'), makeQuestion('high')];
      const progress = makeProgress({
        low: makeEntry(1, 0),
        high: makeEntry(10, 0),
      });

      let highCount = 0;
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        if (service.selectNext(questions, progress).id === 'high') highCount++;
      }

      // high a 10x le poids de low → on s'attend à ~90% de sélections
      expect(highCount).toBeGreaterThan(iterations * 0.75);
    });

    it('utilise le weight par défaut (1) pour les questions sans entrée dans progress', () => {
      const questions = [makeQuestion('new1'), makeQuestion('new2')];
      const progress = makeProgress({});
      // Ne doit pas lever d'erreur
      expect(() => service.selectNext(questions, progress)).not.toThrow();
    });
  });

  // ─── defaultEntry ───────────────────────────────────────────────────────────

  describe('defaultEntry()', () => {
    it('retourne weight=1, consecutiveCorrect=0, lastAnsweredAt=null', () => {
      const entry = service.defaultEntry();
      expect(entry.weight).toBe(1);
      expect(entry.consecutiveCorrect).toBe(0);
      expect(entry.lastAnsweredAt).toBeNull();
    });
  });
});
