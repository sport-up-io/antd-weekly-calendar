---
name: sportup-commit
description: Use when writing a git commit message, creating a branch, or preparing a merge request in any Sport Up repository. Defines the Conventional Commits + gitmoji format in French and the branch flow develop → staging → main.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Commits, branches et merge requests

## Format du message

```
<type>(<scope optionnel>): <gitmoji> <description en français, à l'impératif, sans point final>

<corps optionnel : le pourquoi, en français, lignes de 100 caractères max>
```

| Type | Gitmoji | Usage |
| --- | --- | --- |
| `feat` | ✨ | Nouvelle fonctionnalité. |
| `fix` | 🐛 | Correction de bug. |
| `refactor` | ♻️ | Restructuration sans changement de comportement. |
| `perf` | ⚡️ | Performance. |
| `test` | ✅ | Ajout ou correction de tests. |
| `docs` | 📝 | Documentation, guides agents. |
| `style` | 🎨 | Formatage, sans effet sur le code. |
| `chore` | 🔧 | Configuration, scripts, outillage. |
| `build` | 📦️ | Dépendances, build, montée de version d'un paquet. |
| `ci` | 👷 | Pipeline GitLab. |
| `revert` | ⏪️ | Annulation d'un commit. |

Cas particuliers : `feat(db): 🗃️ …` pour une migration Hasura, `fix: 🚑️ …` pour un correctif urgent de production, `chore: 🔖 …` pour une montée de version publiée.

Exemples :

```
feat(nominations): ✨ ajoute le workflow d'ajout de nomination
fix(bookings): 🐛 empêche l'annulation d'une réservation déjà commencée
feat(db): 🗃️ ajoute la colonne canNominate à la vue bookingScore
build: 📦️ monte @sportup/core en 1.6.61
```

## Règles

- Un commit = un changement cohérent. Une migration Hasura et sa metadata vont dans le même commit.
- Ne jamais committer `.env`, `.env.*` sauf `.env.example`, ni `dist/`, `coverage/`, `node_modules/`, ni les dossiers `generated/`.
- Ne jamais committer sans que `npm run check` ou `npm run typecheck` et les tests passent (skill `sportup-quality-check`).
- Ne jamais committer ni pousser sans demande explicite de l'utilisateur.

## Branches

- `develop` : intégration. `staging` : recette. `main` : production. Les tags sont créés par la CI.
- Branche de travail depuis `develop` : `feat/<sujet-kebab-case>` ou `fix/<sujet-kebab-case>`.
- Merge request vers `develop`, avec : le résumé du changement, les commandes lancées (`npm run check`, `npm test`), et la mention d'une migration ou d'une montée de version de `@sportup/core` le cas échéant.
