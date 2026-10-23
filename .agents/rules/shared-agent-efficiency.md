---
trigger: always_on
description: Économie de contexte, rapidité, délégation aux sous-agents et vérification des faits, pour tout agent travaillant sur Sport Up.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Efficacité des agents : contexte, vitesse, exactitude

## Lire peu, lire juste

- Localiser avant de lire : Grep/Glob, puis lire la seule plage utile (`offset`/`limit`). Un fichier entier ne se lit que s'il va être réécrit.
- Ne jamais lire : `generated/`, `dist/`, `coverage/`, `node_modules/`, lockfiles, ni un fichier marqué « GÉNÉRÉ » (lire sa source). Seule exception : grep ciblé dans `schema.graphql` de `@sportup/core` (voir ci-dessous).
- Ne pas relire un fichier qu'on vient d'éditer, ni re-vérifier un fait déjà établi dans la conversation.
- Filtrer toute sortie longue : `| tail -n 40`, `| grep -E "passing|failing|error"`. Les tests Temporal de lockerflow écrivent des centaines de lignes de logs.
- Pour un échec, lancer d'abord le seul fichier de test concerné, la suite complète ensuite.

## Aller vite

- Appels d'outils indépendants : tous dans le même message.
- Dès qu'on a de quoi agir, agir : pas d'exploration « pour être sûr » au-delà du besoin.
- Commande longue (suite complète, build) : en arrière-plan si on peut avancer à côté.

## Sous-agents : uniquement pour un gain sûr

Un sous-agent démarre sans contexte et relit ce qu'il lui faut : au total il coûte **plus** de tokens. Il n'est justifié que si l'une de ces conditions est vraie :

1. au moins deux recherches **indépendantes et longues** peuvent tourner en parallèle (typiquement une par repo) ;
2. une sortie **volumineuse** doit être condensée (suite de tests complète d'un repo, gros diff) ;
3. un **regard indépendant** est utile avant de rendre la main sur un changement important.

Jamais pour : 1 à 3 greps, un fichier déjà connu, un contexte déjà chargé, ni pour éditer du code (l'agent principal édite). Agents Claude Code : `sportup-explorer`, `sportup-test-runner`, `sportup-verifier`. Mode d'emploi : skill `sportup-parallel-work`.

## Ne rien inventer

- Aucune affirmation sur le code sans l'avoir lue ou greppée dans la session : champ, root field Hasura, activity, clé i18n, code `SportUpErrorEnum`, script npm, variable d'environnement.
- API d'une librairie récente ou incertaine (Expo, React Native, Next, Refine, antd, Temporal, Hasura) : `context7` avant d'écrire l'appel.
- Schéma, par grep ciblé : root fields, relationships et permissions dans `hasura/metadata/databases/Sport'Up/tables/public_<table>.yaml` ; Actions dans `hasura/metadata/actions.graphql` ; colonnes et types dans `sportup-core/src/swagger/generated/hasura/schema.graphql`. Détails : section « Schéma de données » de la carte du workspace.
- Citer `fichier:ligne` ; écrire « non vérifié » quand c'est le cas ; demander plutôt que deviner.
- Le retour d'un sous-agent est une piste : revérifier le point clé avant d'agir dessus.
- Rapporter tel quel : test en échec avec sa sortie, étape sautée signalée.

## MCP

- Un outil MCP seulement quand les fichiers ne répondent pas : `context7` pour une API de librairie, `sonarqube` pour les issues et le quality gate.
- Serveur qui ne répond pas : le signaler une fois, ne pas réessayer en boucle.

## Répondre court

Résultat, changements (`fichier:ligne`), reste à faire. Pas de récapitulatif de ce qui a déjà été dit, pas d'option écartée.

## Commits

Écrire un message court (`fix(games): 🐛 …`) : le hook `commit-msg` le réécrit avec Haiku à partir du diff (skill `sportup-commit`). Ne pas rédiger de corps détaillé à la main.
