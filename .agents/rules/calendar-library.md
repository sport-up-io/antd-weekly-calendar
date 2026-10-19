---
trigger: glob
globs: src/**/*.{ts,tsx}
description: Contraintes de la librairie UI @sportup/antd-weekly-calendar.
paths:
  - "src/**/*.{ts,tsx}"
---

# Librairie @sportup/antd-weekly-calendar

- Librairie publiée, consommée par `sportup-pro`. `react`, `react-dom` et `antd` sont des **peer dependencies** externalisées par `vite.config.ts` : ne jamais les passer en `dependencies`.
- API publique : uniquement ce qu'exporte `src/index.ts` (`WeeklyCalendar` et les types publics de `src/components/types.tsx`). Ajouter une prop est compatible si elle est optionnelle ; renommer ou supprimer est une version majeure. Une prop remplacée reste disponible et marquée `@deprecated`.
- Dates : `date-fns` (seule exception à Luxon dans l'écosystème), objets `Date` natifs dans l'API publique.
- Composants génériques sur `T extends GenericEvent` : garder la généricité de bout en bout, sans cast vers `GenericEvent`.
- Calculs de semaine et de placement dans `src/components/utils.ts`, purs, testés dans `src/components/__tests__/` (Vitest et Testing Library).
- Callbacks publics typés `(event: T) => void`, pas `any`.
- Pas d'effet pour notifier le parent d'un changement que le composant a lui-même déclenché : appeler le callback dans le gestionnaire.
- Prettier de ce repo : 2 espaces, quotes simples, points-virgules, `printWidth` 80.
