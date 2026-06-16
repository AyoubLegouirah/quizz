import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';

/**
 * Bloque l'accès à /results si aucune session n'est complète en mémoire.
 * Un refresh de page réinitialise le service → redirection vers /home.
 */
export const sessionGuard: CanActivateFn = () => {
  const quiz = inject(QuizService);
  const router = inject(Router);
  return quiz.isComplete() ? true : router.createUrlTree(['/home']);
};
