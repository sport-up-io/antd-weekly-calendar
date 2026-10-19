---
trigger: model_decision
description: À appliquer avant de créer un fichier, une fonction, un hook ou un composant, ou quand du code semble dupliqué : décide où placer le code dans l'écosystème Sport Up.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Où placer le code

Appliquer cet arbre **avant** de créer un fichier.

1. **Utilisé par plusieurs repos, sans dépendance UI ?** Va dans `@sportup/core` (`sportup-core`) : types, règles métier pures, utilitaires, providers de services externes, erreurs, permissions. Skill : `core-add-business-rule` ou `core-add-provider`.
2. **Composant UI antd réutilisable entre projets web ?** Va dans une librairie UI dédiée publiée sous `@sportup/*`, sur le modèle de `antd-weekly-calendar`.
3. **Utilisé par plusieurs features d'une même app ?**
   - visuel et sans type métier : `src/ui/` ;
   - non visuel (config, accès aux données, hooks techniques, providers globaux, utilitaires techniques) : `src/core/`.
4. **Sinon** : dans la feature, `src/features/<domaine>/`, au plus près de son usage.

## Rappels

- `@sportup/core` est consommé par React Native, Next.js et Node. Il ne dépend ni de React, ni d'un module Node seul (`fs`, `path`, `crypto`), ni du DOM. Un helper React (`useContextSafe`, un HOC) vit donc dans le `src/core/` de chaque app.
- Avant d'écrire un utilitaire, chercher s'il existe déjà dans `@sportup/core` (`src/core/`, `src/permissions/`, `src/interfaces/`) puis dans `src/core` et `src/ui` de l'app. Des copies existent déjà entre apps (`getNameInitials`, `getRandomColor`, `tryFor`, `translateError`, `session`) : ne pas en ajouter.
- Dans une app, factoriser à la deuxième vraie duplication de logique. Entre repos, factoriser dès la première, dans `@sportup/core`.
- Interdits : dossiers fourre-tout (`misc/`, `helpers/`, `common/`, `utils/` géant sans domaine), fichiers ou dossiers « copie », code mort.
- Une feature n'importe pas les fichiers internes d'une autre feature. Si deux features partagent du code, il remonte dans `src/core` ou `src/ui`.
- Sens des dépendances : `app/` (routes) → `features/` → `core/`, `ui/`, `theme/`. Jamais l'inverse.
