# @sportup/antd-weekly-calendar — Guide agents

> Vue d'ensemble de l'écosystème : `../AGENTS.md`. Rules et skills : `.agents/`.

Fork maintenu par Sport Up d'un calendrier hebdomadaire pour Ant Design, publié sur le registre GitLab et consommé par `sportup-pro` (agenda et calendrier des complexes). C'est le modèle des librairies UI partagées entre projets web.
Stack : React 19, antd 6 (peer dependencies), date-fns 3, Vite (mode librairie, formats `es` et `umd`), vite-plugin-dts, Vitest et Testing Library.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur Vite. |
| `npm run build` | Types puis bundle dans `dist/`. |
| `npx vitest run` | Tests (le script `npm test` lance Vitest en mode watch). |

Les scripts `storybook`, `size` et la config `husky` (`tsdx lint`) sont des restes du projet d'origine sans dépendance installée.

## Structure

```
src/index.ts                API publique
src/WeeklyCalendar.tsx      Conteneur : semaine courante, filtrage, navigation
src/components/             CalendarHeader, CalendarBody, Event, columns, types, utils, __tests__/
```

## Skills et rules

Skill : `calendar-change-and-publish`. Rules : `calendar-library`, `shared-react`, `shared-typescript`, `shared-sonarqube`, `shared-code-placement`.
