---
trigger: glob
globs: **/*.{ts,tsx}
description: Règles TypeScript strictes communes à tous les repos TypeScript Sport Up.
paths:
  - "**/*.{ts,tsx}"
---

<!-- GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs. Ne pas modifier ce fichier : modifier sa source puis relancer `npm run agents:sync` dans sportup-core. -->

# TypeScript : règles strictes

## Types

- Pas de `any`. Utiliser `unknown` puis un type guard (`typeof`, `in`, `instanceof`, fonction `isXxx(value): value is Xxx`). Un `any` inévitable porte le commentaire `// any: <raison>` sur la même ligne.
- Pas de `as` pour faire taire le compilateur. Un cast n'est toléré qu'à une frontière (JSON parsé, SDK mal typé, réponse HTTP), avec un commentaire. Pour vérifier une forme sans perdre l'inférence, utiliser `satisfies`.
- Pas de `!` non-null, sauf invariant prouvé dans les lignes juste au-dessus. Une variable d'environnement obligatoire se lit via un helper qui lève une erreur au démarrage :

```ts
const requireEnv = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Variable d'environnement manquante : ${name}`);
	}
	return value;
};
export const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY');
```

- Types d'entités : toujours ceux de `@sportup/core` (`Game`, `Booking`, `User`…), générés depuis Hasura. Ne jamais redéclarer une entité.
- Précision des sous-ensembles : `Pick<Game, 'timeSlot'>` garde **tout** `timeSlot`, ce n'est pas assez précis. Une fonction déclare exactement les champs qu'elle lit, sous-objets compris :
  - règle de `@sportup/core` : type d'entrée structurel exporté (`BookingCancelableInput`), voir la rule `core-library` ;
  - donnée lue par un front : type déduit de la sélection (`Selected<Game, typeof gameCardSelection>` dans sport-up), jamais l'entité complète.
- Types d'entrée et de sortie des Actions : `XxxInput` et `XxxOutput` de `@sportup/core`. Ne jamais les réécrire.
- Enums métier : types `Xxx_enum` et objets `Xxx_values` de `@sportup/core`. Pas de nouvel `enum` TypeScript ; pour une liste locale, `const XXX = ['a', 'b'] as const` et `type Xxx = (typeof XXX)[number]`.
- États : union discriminée plutôt que booléens combinés.

```ts
type LoadState<T> = {status: 'loading'} | {status: 'error'; error: SportUpError} | {status: 'success'; data: T};
```

- Mapper un enum : table exhaustive `Record<Xxx_enum, Valeur>`, le compilateur signale la valeur oubliée. Un `switch` sur une union se termine par `default: { const exhaustive: never = value; throw new Error(...) }`.
- `interface` pour les props et les contrats extensibles ; `type` pour les unions, intersections et types dérivés. `readonly` sur ce qui ne doit pas muter.

## Fonctions

- Type de retour explicite sur toute fonction exportée.
- Au-delà de 3 paramètres, un objet nommé : `createBooking({userId, timeSlotId, isPrivate})`.
- Une dépendance au temps se passe en paramètre avec une valeur par défaut, pour être testable : `isBookingCancelable(profile, booking, now = DateTime.now())`.
- Pas de paramètre booléen qui change le comportement de la fonction : deux fonctions ou un paramètre d'union nommé.
- `async` seulement si la fonction attend quelque chose. Toujours `await` ou retourner une promesse : pas de promesse flottante.

## Erreurs

- Lever des `SportUpError` via `SportUpFailure.create(SportUpErrorEnum.Xxx, 'description')`. Ne jamais lever une chaîne ni un `new Error` métier.
- Frontière qui sérialise l'erreur (activity Temporal, réponse HTTP) : `throw SportUpFailure.fail(error)`.
- Jamais de `catch` vide. Un `catch` qui ignore volontairement l'erreur porte un commentaire qui explique pourquoi.
- Un nouveau cas d'erreur métier = un nouveau code `SportUpErrorEnum` (skill `sportup-add-error-code`), pas une chaîne libre.

## Imports et exports

- Alias de chemin du repo, jamais `../../..`. Un import relatif n'est accepté que vers le même dossier ou le dossier parent direct.
- `import type` pour un import qui ne sert qu'aux types.
- Exports nommés. `export default` uniquement là où le framework l'impose : routes Expo Router, `page.tsx`, `layout.tsx` et `route.ts` de Next.
- Pas de barrel (`index.ts` qui réexporte) dans une app, sauf l'API publique d'une feature. Les barrels sont la norme dans `@sportup/core` et `lockerflow`.

## Dates et montants

- Dates : Luxon `DateTime`, avec un fuseau explicite pour tout ce qui touche à un créneau (`timeSlot.timezone`). Stockage et transport en ISO UTC (`toUTC().toISO()`).
- Montants : entiers en centimes. Tout calcul de prix passe par `calculateBill` de `@sportup/core`. Affichage via `currencyNumber`.

## Commentaires

- JSDoc en français au-dessus de toute fonction exportée non triviale : ce qu'elle fait, pourquoi, et ses cas limites.
- Commentaire dans le corps seulement pour expliquer un **pourquoi** non évident. Pas de paraphrase du code.
- Pas de code commenté : le supprimer, git le garde.
