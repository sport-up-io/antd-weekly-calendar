---
trigger: glob
globs: **/*.{ts,tsx}
description: Seuils SonarQube, tailles maximales et nommage communs à tous les repos TypeScript Sport Up.
paths:
  - "**/*.{ts,tsx}"
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# Qualité : SonarQube, tailles et nommage

Le quality gate SonarQube est bloquant (`sonar.qualitygate.wait=true`). Un code est terminé quand il n'ajoute **aucune nouvelle issue**.

## Règles Sonar à respecter dès l'écriture

| Règle | Seuil | Sonar | Correction type |
| --- | --- | --- | --- |
| Complexité cognitive par fonction | ≤ 15 | S3776 | Extraire des fonctions, retours anticipés, table de correspondance. |
| Ternaires imbriqués | interdits | S3358 | Variable intermédiaire, `if` précoce ou `Record<Clé, Valeur>`. |
| Imbrication `if` / `for` / `try` | ≤ 3 niveaux | S134 | Retours anticipés, extraction de fonction. |
| Paramètres | ≤ 7, viser ≤ 3 | S107 | Objet nommé. |
| Chaîne littérale dupliquée | dès 3 occurrences | S1192 | Constante nommée. |
| Code commenté | interdit | S125 | Supprimer. |
| Fonction vide | interdite sans commentaire | S1186 | Commentaire explicite ou suppression. |
| `TODO`, `FIXME` | seulement avec ticket | S1135 | `// TODO(SU-123): ...` |
| `console.log` | interdit | S106, S2228 | Logger du repo. |
| Chaînage optionnel | `a?.b` plutôt que `a && a.b` | S6582 | |
| Variable inutilisée, import inutilisé | interdit | S1481, S1128 | Supprimer. |
| `forEach` avec `await` | interdit | S4123 | `for...of` ou `Promise.all`. |
| Couverture du nouveau code | ≥ 80 % dans `sportup-core` et `lockerflow` | gate | Tests à côté du fichier. |
| Duplication du nouveau code | < 3 % | gate | Factoriser selon `shared-code-placement`. |

Exemple de ternaires imbriqués à remplacer :

```ts
// Interdit
const where = type === 'futures' ? futuresWhere : type === 'past' ? pastWhere : {};

// Attendu
const WHERE_BY_TYPE: Record<BookingListType, Booking_bool_exp> = {futures: futuresWhere, past: pastWhere, all: {}};
const where = WHERE_BY_TYPE[type];
```

## Tailles maximales

| Élément | Cible | Maximum : découper au-delà |
| --- | --- | --- |
| Composant React | 150 lignes | 250 lignes |
| Hook | 80 lignes | 150 lignes |
| Fonction | 30 lignes | 60 lignes |
| Activity, workflow, utilitaire | 100 lignes | 200 lignes |

Découper quand : le maximum est dépassé, plus de 4 `useState` ou 2 `useEffect`, ou un fichier mélange accès aux données, logique et rendu.
Ne pas découper : un sous-composant privé de moins de 40 lignes utilisé une seule fois reste dans le même fichier, sous le composant principal. Pas de fichier de 10 lignes « pour la forme ».

## Nommage

- `PascalCase` : types, interfaces, classes, composants.
- `camelCase` : fonctions, variables, hooks `useXxx`.
- `SCREAMING_SNAKE_CASE` : constantes de configuration et constantes de module.
- Booléens : `is`, `has`, `can`, `should`. Fonctions : verbe d'abord (`get`, `create`, `update`, `delete`, `verify`, `calculate`, `map`, `format`).
- Dossiers de domaine : pluriel kebab-case (`sports-complexes`, `time-slots`).
- Noms de fichiers : convention du repo (voir son `AGENTS.md`). Un fichier porte le nom de ce qu'il exporte.

## Configuration Sonar d'un repo TypeScript

```properties
sonar.projectKey=<clé existante, ne jamais la changer>
sonar.qualitygate.wait=true
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=src/**/*.spec.ts,src/**/*.test.ts,src/**/*.test.tsx
sonar.exclusions=**/generated/**,**/node_modules/**,dist/**,coverage/**
sonar.coverage.exclusions=src/**/*.spec.ts,src/**/*.test.ts*,src/config.ts,src/index.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

`sonar.exclusions` retire un fichier de l'analyse ; `sonar.coverage.exclusions` le retire seulement du calcul de couverture. Ne jamais exclure du code métier de l'analyse.
