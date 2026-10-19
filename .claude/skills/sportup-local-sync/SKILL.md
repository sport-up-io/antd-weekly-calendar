---
name: sportup-local-sync
description: Use when setting up, starting or resynchronizing the Sport Up localhost environment, when types from @sportup/core look outdated, when a service does not respond locally, or when switching .env between localhost and develop.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Synchroniser l'environnement local

Les repos sont des dossiers frères dans le même workspace. Les scripts partagés vivent dans `sportup-core/scripts/`.

## Diagnostic

```bash
npm run doctor:local   # depuis n'importe quel repo Node : services qui répondent et commande pour lancer les autres
```

| Service | Port | Lancer |
| --- | --- | --- |
| Postgres et Hasura | 5432, 8080 | `hasura` : `npm run sync:local` |
| Temporal, Temporal UI, Elasticsearch | 7233, 8082, 9200 | `lockerflow` : `npm run infra:up` |
| Lockerflow API, recherche | 3001, 3200 | `lockerflow` : `npm run dev` |
| sport-up-ai | 5001 | `sport-up-ai` : `docker compose up -d` |
| Back-office | 3000 | `sportup-pro` : `npm run dev` |
| App mobile (web) | 3100 | `sport-up` : `npm start`, ou `npm run clear` pour vider le cache Metro |

## Séquences

Premier setup d'un poste :

```bash
cd hasura && npm run sync:local
cd ../sportup-core && npm run setup:local       # install, toutes les générations, build, copie dans les apps
cd ../lockerflow && npm install && npm run infra:up
cd ../sport-up && npm install && npm run core:local
cd ../sportup-pro && npm install && npm run core:local
```

Après un `git pull`, ou quand les types de core semblent faux :

```bash
cd hasura && npm run sync:local          # migrations et metadata
cd ../sportup-core && npm run sync:local # régénère genql et hasuguard, build, copie dans les 3 apps
```

Puis relancer les apps. Pour le mobile, `npm run clear`.

## Pièges connus

- `npm install` dans une app réinstalle `@sportup/core` depuis le registre et **écrase** la copie locale : relancer `npm run core:local`.
- `hasura-gen` interroge `http://localhost:8080` avec le secret `admin` : Hasura local doit tourner.
- Les dossiers `generated/` de core sont ignorés par git : un clone neuf ne compile pas avant `npm run setup:local`.
- Sur un device physique, l'URL Hasura du mobile doit être l'IP LAN de la machine, pas `localhost`.
- Le port webhook de lockerflow vaut 3100 par défaut, comme Expo : fixer `APP_PORT_WEBHOOK` à une autre valeur dans `.env.localhost` si les deux tournent.
- Hasura appelle lockerflow via `LOCKERFLOW_URL=http://host.docker.internal:3001` : lockerflow doit écouter sur ce port.

## Profils d'environnement

```bash
npm run env:localhost   # copie .env.localhost vers .env (sauvegarde dans .env.bak)
npm run env:develop     # copie .env.develop vers .env
```

Si `.env.localhost` n'existe pas, il est créé depuis `.env.example` et les secrets sont à compléter. Le profil production est refusé. Ne jamais afficher ni committer le contenu d'un `.env`.

## Actions destructives

`npm run reset:local` dans `hasura` supprime la base locale. Ne le lancer que sur demande explicite de l'utilisateur.
