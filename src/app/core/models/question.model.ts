export type Category =
  | 'java_spring'
  | 'angular_typescript'
  | 'postgresql_jpa'
  | 'rest_http'
  | 'docker_git'
  | 'tests_maven_bigo'
  | 'cicd';

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  code?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

/** État runtime d'une question dans la session courante. */
export interface QuestionState {
  question: Question;
  /** Poids de répétition espacée (valeur brute persistée). */
  weight: number;
  selectedIndex: number | null;
  isCorrect: boolean | null;
  /** Reflète UserProgress.bookmarked — utilisé par le composant quiz pour le toggle. */
  markedForReview: boolean;
}
