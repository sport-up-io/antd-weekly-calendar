# Contribuer à Antd Weekly Calendar

## Avant de commencer

- Le [README](README.md) explique comment lancer le projet en local.
- Les conventions du dépôt (architecture, nommage, règles métier) sont dans [`AGENTS.md`](AGENTS.md) et le dossier `.agents/`.
- Une faille de sécurité ne se signale pas dans une issue : voir [SECURITY.md](SECURITY.md).

## Proposer un changement

1. Partez de `main` et créez une branche `feat/<sujet>` ou `fix/<sujet>`.
2. Vérifiez votre changement en local :

   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

3. Ouvrez une merge request (GitLab) ou une pull request (GitHub) vers `main` en remplissant le modèle.

Les versions et les tags sont créés par la CI : ne modifiez pas la version à la main.

## Messages de commit

[Conventional Commits](https://www.conventionalcommits.org/fr/) en français, avec un [gitmoji](https://gitmoji.dev) après les deux-points :

```text
feat(bookings): ✨ ajoute l'annulation d'une réservation
fix(games): 🐛 corrige le calcul du score d'équipe
```

`feat` ✨ · `fix` 🐛 · `refactor` ♻️ · `perf` ⚡️ · `test` ✅ · `docs` 📝 · `style` 🎨 · `chore` 🔧 · `build` 📦️ · `ci` 👷

## Avant de demander une revue

- Les vérifications ci-dessus passent et SonarQube ne remonte aucun nouveau signal.
- Aucun texte visible en dur dans les interfaces : clés de traduction en `fr` et en `en`.
- Aucun secret, `.env` ni fichier généré dans le commit.
