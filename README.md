# Quiz Full Stack

## Objectif

Permettre aux développeurs de s'entraîner sur les sujets clés : Java/Spring, Angular/TypeScript, PostgreSQL/JPA, REST/HTTP, Docker/Git, Tests/Maven/Big O et CI/CD. Un algorithme de répétition espacée pèse les questions ratées plus lourdement afin de concentrer l'effort sur les lacunes.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Angular 22 (standalone components) |
| Langage | TypeScript 5 |
| Style | SCSS |
| Persistance | `localStorage` (aucun backend) |
| Tests | Jasmine + Karma (via `@angular/build:unit-test`) |
| Build | Angular CLI / `@angular/build:application` |

---

## Structure des dossiers

```
quiz-fullstack/
├── public/
│   └── assets/data/
│       └── questions.json        # Copie statique (Angular 17+ default assets)
├── src/
│   ├── assets/data/
│   │   └── questions.json        # Source de vérité (434 questions)
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── session.guard.ts
│   │   │   ├── models/
│   │   │   │   ├── question.model.ts
│   │   │   │   └── progress.model.ts
│   │   │   └── services/
│   │   │       ├── quiz.service.ts
│   │   │       ├── spaced-repetition.service.ts
│   │   │       └── storage.service.ts
│   │   └── features/
│   │       ├── home/
│   │       ├── quiz/
│   │       ├── results/
│   │       └── progress/
│   ├── styles.scss
│   └── main.ts
├── angular.json
└── package.json
```

---

## Lancer le projet

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur de développement
ng serve
# → http://localhost:4200

# 3. Build de production
ng build
```

> Prérequis : Node.js 18+ et Angular CLI (`npm install -g @angular/cli`)

---

## Fonctionnalités principales

- **7 catégories** de quiz sélectionnables individuellement ou en mode aléatoire
- **Sessions de 10 questions** par défaut, tirées aléatoirement avec pondération
- **Répétition espacée** : une question ratée voit son poids doubler (max 10) ; après 3 bonnes réponses consécutives, le poids est divisé par 2 (min 1)
- **Suivi de progression** persisté dans `localStorage` : score global, streak, statistiques par catégorie
- **Favoris** : marquer des questions à revoir
- **Écran de résultats** : score, durée, streak max, révision des questions ratées
- **3 niveaux de difficulté** : facile, moyen, difficile
- **434 questions** dont 84 questions fondamentales (facile, orientées définitions/concepts)

---

## Structure du JSON et ajouter des questions

Le fichier `src/assets/data/questions.json` est un tableau JSON plat. Chaque question respecte ce schéma :

```json
{
  "id": "java_spring_001",
  "category": "java_spring",
  "difficulty": "moyen",
  "tags": ["spring", "ioc"],
  "question": "Qu'est-ce que l'injection de dépendances ?",
  "code": "// optionnel — snippet affiché avant les options\n@Autowired\nprivate UserService userService;",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctIndex": 1,
  "explanation": "Explication affichée après réponse."
}
```

| Champ | Type | Obligatoire | Détail |
|-------|------|-------------|--------|
| `id` | `string` | oui | Unique dans tout le fichier |
| `category` | `Category` | oui | Voir liste ci-dessous |
| `difficulty` | `"facile"` \| `"moyen"` \| `"difficile"` | oui | |
| `tags` | `string[]` | oui | Tableau libre, au moins un tag |
| `question` | `string` | oui | Texte de la question |
| `code` | `string` | non | Snippet affiché en bloc de code |
| `options` | `[string, string, string, string]` | oui | Exactement 4 options |
| `correctIndex` | `0` \| `1` \| `2` \| `3` | oui | Index de la bonne réponse |
| `explanation` | `string` | oui | Affiché après réponse |

**Catégories disponibles :**

```
java_spring | angular_typescript | postgresql_jpa | rest_http | docker_git | tests_maven_bigo | cicd
```

> Après ajout de questions, copier le fichier dans `public/assets/data/questions.json` et redémarrer `ng serve`.

---

## Lancer les tests

```bash
# Tous les tests (une seule passe, sans watch)
ng test --watch=false

# Tests d'un fichier spécifique
ng test --watch=false --include="**/spaced-repetition.service.spec.ts"
```

Les tests couvrent l'algorithme de répétition espacée (`SpacedRepetitionService`) :
- Plafond du weight à 10 sur erreur
- Plancher du weight à 1 après 3 bonnes réponses consécutives
- Exclusion de la dernière question dans `selectNext`
- Distribution pondérée statistiquement vérifiée (1 000 tirages)

---

## Répartition des 434 questions

### Par catégorie

| Catégorie | Questions | dont fondamentaux |
|-----------|----------:|------------------:|
| Java / Spring Boot | 117 | 12 |
| Angular / TypeScript | 89 | 12 |
| PostgreSQL / JPA | 58 | 12 |
| REST / HTTP | 47 | 12 |
| Docker / Git | 47 | 12 |
| Tests / Maven / Big O | 40 | 12 |
| CI/CD | 36 | 12 |
| **Total** | **434** | **84** |

### Par difficulté

| Difficulté | Questions | % |
|------------|----------:|--:|
| Facile | 178 | 41 % |
| Moyen | 182 | 42 % |
| Difficile | 74 | 17 % |
