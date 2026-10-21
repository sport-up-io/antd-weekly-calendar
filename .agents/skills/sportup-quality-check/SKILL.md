---
name: sportup-quality-check
description: Use before declaring any coding task done in a Sport Up TypeScript repository (sportup-core, sport-up, sportup-pro, lockerflow, antd-weekly-calendar). Runs the right verification commands for the repo and reviews the diff against the TypeScript, SonarQube and placement rules.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Vérifier avant de rendre la main

## 1. Lancer les commandes du repo

| Repo | Commandes obligatoires |
| --- | --- |
| `sportup-core` | `npm run typecheck && npm test && npm run build` |
| `sport-up` | `npm run check && npm test` (`check` inclut `tsc`, version de core, expo-doctor et les scripts de `checks/` : traductions, textes en dur, architecture, tailles, contrats de plateforme, métadonnées, enums). `npm test` exige `jest-expo` : s'il n'est pas installé, le signaler sans contourner. |
| `sportup-pro` | `npm run typecheck && npm run check` |
| `lockerflow` | `npm run check && npm test` |
| `antd-weekly-calendar` | `npm run build && npx vitest run` |

`npm run check` vérifie aussi que `@sportup/core` installé est la dernière version publiée. En développement local avec une copie de core non publiée, cette étape échoue : le signaler sans la contourner.

Si une commande échoue, corriger puis relancer. Ne jamais déclarer la tâche terminée avec une commande en échec : rapporter l'échec tel quel.

## 2. Relire le diff

Pour chaque fichier modifié, vérifier :

- **Placement** : le fichier est au bon endroit selon la rule `shared-code-placement`. Aucune fonction n'a été copiée depuis un autre repo.
- **Types** : aucun `any`, `as` ou `!` ajouté sans commentaire justificatif. Types d'entités issus de `@sportup/core`.
- **Sonar** : complexité ≤ 15, pas de ternaire imbriqué, imbrication ≤ 3, pas de chaîne répétée 3 fois, pas de code commenté, pas de `console.log`, pas de `TODO` sans ticket.
- **Tailles** : aucun composant au-delà de 250 lignes, aucun hook au-delà de 150, aucune fonction au-delà de 60.
- **i18n** (fronts) : aucun texte visible en dur. Les clés existent en `fr` et `en`.
- **Tests** : toute fonction pure, activity ou workflow ajouté a son test.
- **Secrets** : aucun secret, token ou URL privée en dur. Nouvelle variable d'environnement ajoutée à `.env.example`.
- **Code généré** : rien d'édité à la main dans un dossier `generated/`.

## 3. Rapporter

Dire ce qui a été vérifié et le résultat de chaque commande. Si une étape n'a pas pu être lancée (service local arrêté, dépendance manquante), le dire explicitement.
