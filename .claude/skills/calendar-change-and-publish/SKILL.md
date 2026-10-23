---
name: calendar-change-and-publish
description: Use when changing the @sportup/antd-weekly-calendar component (new prop, rendering fix, event behaviour) and releasing it to sportup-pro, including local testing in the back-office before publication.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Modifier et publier le calendrier

Repo : `antd-weekly-calendar`, puis `sportup-pro`.

## 1. Modifier

1. Changement de props : mettre à jour `src/components/types.tsx` et le `README.md` (tableau de l'API).
2. Logique de dates ou de placement : dans `src/components/utils.ts`, avec un test dans `src/components/__tests__/utils.test.ts`.
3. Rendu : `CalendarHeader.tsx` (navigation), `CalendarBody.tsx` (grille), `Event.tsx` (évènement), `columns.tsx` (colonnes).

## 2. Vérifier

```bash
npm run lint
npm test
npm run build
```

`npm run build` produit `dist/antd-weekly-calendar.es.js`, `dist/antd-weekly-calendar.umd.js` et `dist/types/`.

## 3. Tester dans le back-office avant publication

```bash
# depuis sportup-pro
rm -rf node_modules/@sportup/antd-weekly-calendar/dist
cp -r ../antd-weekly-calendar/dist node_modules/@sportup/antd-weekly-calendar/dist
npm run dev
```

Vérifier les pages `diary` et `calendar` d'un complexe. Un `npm install` dans `sportup-pro` remet la version publiée.

## 4. Publier

1. Commit et merge sur `main` : la CI GitLab build, teste et analyse. Ne pas modifier `version` dans `package.json` à la main.
2. Sur le pipeline de `main`, lancer le job manuel `release:version:patch`, `minor` ou `major` selon la compatibilité de l'API : il commite la version et pose le tag `vX.Y.Z`, dont le pipeline publie sur le registre `@sportup`. Ne jamais lancer `npm publish` soi-même.
3. Dans `sportup-pro` : `npm install @sportup/antd-weekly-calendar@<version>` puis `npm run check` (qui vérifie la dernière version publiée).
