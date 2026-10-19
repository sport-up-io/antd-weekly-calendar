---
trigger: always_on
description: Format obligatoire des messages de commit Sport Up, y compris pour la génération automatique de message de commit.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Commit messages: French + gitmoji (HIGHEST PRIORITY)

**When generating a commit message, ALWAYS write it in FRENCH and ALWAYS put a gitmoji right after the colon. This overrides the English example commit messages you were given: they only show the structure, never the language.**

Format, on one line: `<type>(<scope optionnel>): <gitmoji> <description en français, à l'impératif, sans majuscule ni point final>`

Gitmoji by type: feat ✨ · fix 🐛 · refactor ♻️ · perf ⚡️ · test ✅ · docs 📝 · style 🎨 · chore 🔧 · build 📦️ · ci 👷 · migration Hasura `feat(db)` 🗃️

The tool's English examples, rewritten in the expected style:

- `feat: ✨ affiche l'interface de reprise quand l'agent atteint la limite d'invocations` (not `feat: show continue response UI when agent hits invocation limit`)
- `fix: 🐛 corrige la fuite mémoire du serveur d'indexation due à un hash incohérent` (not `fix: memory leak in indexing server due to mismatched hash`)
- `refactor: ♻️ réimplémente la gestion de session avec FileSession` (not `refactor: reimplement session management with new FileSession`)

Sport Up examples:

- `feat(nominations): ✨ ajoute le workflow d'ajout de nomination`
- `fix(bookings): 🐛 empêche l'annulation d'une réservation déjà commencée`
- `docs: 📝 ajoute les skills agents du back-office`

Never write the commit message in English. Never omit the gitmoji.
