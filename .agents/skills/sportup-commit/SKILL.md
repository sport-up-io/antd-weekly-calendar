---
name: sportup-commit
description: Use when writing a git commit message, creating a branch, or preparing a merge request in any Sport Up repository. Defines the Conventional Commits + gitmoji format in French and the branch flow develop → staging → main.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Commits, branches et merge requests

## Format du message

```
<type>(<scope optionnel>): <gitmoji> <description en français, à l'impératif, sans point final>

- <modification concrète et sa raison, en français>
- <2 à 6 puces, une idée par puce, lignes de 100 caractères max>
```

Le hook git `commit-msg` installé par `agents:sync` (`.agents/scripts/commit-msg.mjs`) réécrit chaque message dans ce format à partir du diff, quel que soit l'outil qui commite. Le désactiver ponctuellement : `SPORTUP_COMMIT_AI=0 git commit …`.

**Agents : déléguer la rédaction au hook.** Le hook génère le message avec Haiku, sans outils ni contexte de projet : c'est la voie la moins coûteuse. Un agent qui commite écrit seulement la première ligne (`fix(games): 🐛 …`), sans corps, sans relire le diff pour le décrire et sans sous-agent dédié. Le message d'origine sert d'indice au hook : le choix du type et du scope reste utile.

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
fix(bookings): 🐛 empêche l'annulation d'une réservation déjà commencée

- ajoute la vérification de la date de début dans l'activity `verifyBookingCancelable`
- renvoie l'erreur `BOOKING_ALREADY_STARTED` traduite dans l'app et le back-office
```

Autres premières lignes : `feat(nominations): ✨ ajoute le workflow d'ajout de nomination`, `feat(db): 🗃️ ajoute la colonne canNominate à la vue bookingScore`, `build: 📦️ monte @sportup/core en 1.6.61`.

## Règles

- Un commit = un changement cohérent. Une migration Hasura et sa metadata vont dans le même commit.
- Ne jamais committer `.env`, `.env.*` sauf `.env.example`, ni `dist/`, `coverage/`, `node_modules/`, ni les dossiers `generated/`.
- Ne jamais committer sans que `npm run check` ou `npm run typecheck` et les tests passent (skill `sportup-quality-check`).
- Ne jamais committer ni pousser sans demande explicite de l'utilisateur.

## Branches

- `develop` : intégration. `staging` : recette. `main` : production. Les tags sont créés par la CI.
- Branche de travail depuis `develop` : `feat/<sujet-kebab-case>` ou `fix/<sujet-kebab-case>`.
- Merge request vers `develop`, avec : le résumé du changement, les commandes lancées (`npm run check`, `npm test`), et la mention d'une migration ou d'une montée de version de `@sportup/core` le cas échéant.
