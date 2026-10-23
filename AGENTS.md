# @sportup/antd-weekly-calendar — Guide agents

> Vue d'ensemble de l'écosystème : `../AGENTS.md`. Rules et skills : `.agents/`.

Fork maintenu par Sport Up d'un calendrier hebdomadaire pour Ant Design, publié sur le registre GitLab et consommé par `sportup-pro` (agenda et calendrier des complexes). C'est le modèle des librairies UI partagées entre projets web.
Stack : React 19, antd 6 et `@ant-design/icons` (peer dependencies), date-fns 4 et `@rc-component/picker` (dependencies), Vite 8 (mode librairie, formats `es` et `umd`), vite-plugin-dts, Vitest 5 et Testing Library, ESLint 10.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run build` | `tsc` (vérification des types) puis bundle et déclarations dans `dist/`. |
| `npm run build:watch` | Bundle en continu, pour tester dans `sportup-pro`. |
| `npm test` | Tests et couverture (`coverage/lcov.info`, lu par SonarQube). |
| `npm run test:watch` | Tests en mode watch. |
| `npm run typecheck` | Types seuls. |
| `npm run lint` | ESLint. |

Le bundle n'embarque aucun paquet npm : peer dependencies et dependencies sont externalisées par `vite.config.ts`.

## Structure

```
src/index.ts                        API publique : WeeklyCalendar et types publics
src/WeeklyCalendar.tsx              Conteneur : semaine courante, filtrage
src/components/CalendarHeader.tsx   Mois, semaine, navigation, filtres
src/components/CalendarBody.tsx     Grille horaire (Table antd)
src/components/columns.tsx          Colonnes de jour
src/components/Event.tsx            Évènement dans sa cellule
src/components/use*.ts              Hooks : semaine affichée, dépliage d'un évènement
src/components/utils.ts             Calculs purs : semaine, lignes, placement
src/components/localeConfig.ts      Ordre des jours et formats FR / USA
src/components/types.tsx            Types publics et partagés
src/**/__tests__/                   Tests Vitest (couverture 100 %)
```

## Skills et rules

Skill : `calendar-change-and-publish`. Rules : `calendar-library`, `shared-react`, `shared-typescript`, `shared-sonarqube`, `shared-code-placement`.
