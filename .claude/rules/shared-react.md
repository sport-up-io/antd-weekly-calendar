---
trigger: glob
globs: **/*.tsx
description: Règles React communes à l'app mobile, au back-office et aux librairies UI Sport Up.
paths:
  - "**/*.tsx"
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# React : règles communes

## Composants

- Un composant exporté par fichier. Props dans une `interface XxxProps`, destructurées dans la signature avec leurs valeurs par défaut.
- Le composant **compose et affiche**. La logique va dans un hook `useXxx`, les calculs dans des fonctions pures testées, les données serveur dans un hook de données.
- Un sous-composant privé de moins de 40 lignes reste dans le même fichier, déclaré sous le composant principal. Au-delà, ou s'il est réutilisé, il a son fichier.
- Composition plutôt que props en cascade : `children`, slots (`header`, `footer`, `extra`), composants composés. Au-delà de 2 niveaux de prop drilling, un hook ou un Context.
- Rendu conditionnel lisible : retours anticipés pour les états `loading`, `error` et `empty`, puis le rendu nominal. Pas de ternaire imbriqué dans le JSX.
- `key` stable et métier (`item.id`), jamais l'index pour une liste qui peut changer.
- Aucun texte visible en dur : tout passe par i18n.
- Pas de `console.log`.

## Hooks

- Un hook commence par `use`, fait une chose, et retourne un objet nommé (`{data, isLoading, submit}`), pas un tableau, sauf pour imiter `useState`.
- Respecter les règles des hooks : jamais dans une condition ou une boucle.
- Pas d'effet pour dériver une valeur calculable pendant le rendu : calculer directement, ou `useMemo` si c'est coûteux.
- Un `useEffect` a toutes ses dépendances déclarées. Désactiver `react-hooks/exhaustive-deps` est interdit dans le nouveau code.
- Un effet qui s'abonne (listener, subscription, timer) retourne sa fonction de nettoyage.
- `useMemo` et `useCallback` seulement pour un calcul coûteux, ou une référence passée à un enfant mémoïsé ou à une dépendance d'effet.

## État

- État serveur : uniquement dans le cache de la librairie de données (TanStack Query dans le mobile, Refine dans le pro). Jamais recopié dans un `useState` ou un Context.
- État local : `useState` au plus près de son usage.
- État partagé client (session, préférences, sélection courante, tunnel en cours) : un Context dédié à **une** préoccupation.

## Contexts

- Valeur par défaut `null`. Lecture via un hook `useXxx()` qui lève une erreur hors provider (`useContextSafe` dans le mobile). Pas d'objet par défaut rempli de fonctions vides ni de `{} as Type`.
- `value` du provider mémoïsée avec `useMemo`.
- Un Context « dieu » qui regroupe plusieurs préoccupations est interdit : le découper.
