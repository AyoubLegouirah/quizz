import { Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./features/quiz/quiz.component').then(m => m.QuizComponent),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results/results.component').then(m => m.ResultsComponent),
    canActivate: [sessionGuard],
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress/progress.component').then(m => m.ProgressComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
