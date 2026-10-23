---
name: sportup-parallel-work
description: Use when a Sport Up task could be split across sub-agents - independent searches in several repos, a full test suite whose output would flood the context, or an independent review before handing back a large change. Decides whether delegating is worth it, and how to brief and merge sub-agents.
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Paralléliser avec des sous-agents

Rule de référence : `shared-agent-efficiency`. Par défaut, **ne pas déléguer**.

## 1. Décider

| Situation | Décision |
| --- | --- |
| Information dans 1 à 3 fichiers ou greps | Faire soi-même. |
| Contexte déjà chargé dans la conversation | Faire soi-même. |
| Modifier du code | Faire soi-même : un seul agent édite. |
| Localiser le même concept dans 2 repos ou plus (propagation de schéma, renommage d'une Action, enum) | Un `sportup-explorer` par repo, **lancés dans le même message**. |
| Suite complète d'un repo à lancer pendant qu'on continue | `sportup-test-runner` en arrière-plan. |
| Tests de plusieurs repos après un changement de `@sportup/core` | Un `sportup-test-runner` par repo, en parallèle. |
| Changement de plus de ~5 fichiers ou multi-repo, avant de rendre la main | Un `sportup-verifier` sur le diff. |

Gain attendu incertain ? Ne pas déléguer.

## 2. Briefer

Le sous-agent ne voit pas la conversation. Le brief tient en 5 à 10 lignes et contient tout ce qu'il faut, rien de plus :

```
Objectif : <une phrase>.
Repo / périmètre : <chemins précis>.
Déjà connu : <faits établis, fichiers déjà lus — pour ne pas les rechercher>.
Cherche : <questions numérotées>.
Retour : au plus <N> lignes, `chemin:ligne — constat`, puis « Non trouvé : … ».
```

- Donner les chemins et noms exacts déjà connus : chaque indice économise des appels.
- Une question précise par sous-agent ; pas de « regarde aussi si… ».
- Ne jamais transmettre de secret ni le contenu d'un `.env`.

## 3. Fusionner

- Attendre la notification de fin : ne jamais présumer d'un résultat.
- Revérifier dans le code le point clé dont dépend l'action suivante (un grep suffit).
- Contradiction entre deux retours : trancher en lisant soi-même, pas en relançant un agent.
- Ne pas recopier les retours bruts dans la réponse : en extraire la conclusion.

## Exemples

- **Propager une colonne ajoutée** (skill `sportup-propagate-schema`) : après `sync:local`, 3 `sportup-explorer` en parallèle sur `lockerflow`, `sport-up`, `sportup-pro` (« où est sélectionnée l'entité `Game` ? »), puis édition par l'agent principal, puis 3 `sportup-test-runner` en parallèle.
- **Un test lockerflow échoue** : ne pas déléguer. Lancer le spec seul, lire le workflow, corriger.
