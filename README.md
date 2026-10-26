<div align="center">
  <a href="https://sport-up.io"><img src=".github/assets/sport-up.png" alt="Sport UP" width="128" /></a>
  <h1>Antd Weekly Calendar</h1>
  <p><strong>Un calendrier hebdomadaire élégant pour Ant Design. 📅</strong></p>
  <p>Le planning des complexes sportifs de <a href="https://pro.sport-up.io">Sport UP Pro</a>, disponible comme composant React réutilisable.</p>
  <p>
    <img src="https://img.shields.io/badge/licence-MIT-green?style=flat-square" alt="Licence MIT" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Ant_Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white" alt="Ant Design 6" />
    <img src="https://img.shields.io/badge/TypeScript-typé-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-build-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Vitest-tests-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
  </p>
  <p>
    <a href="https://pro.sport-up.io"><b>🏟️ L'Espace pour les pros</b></a> ·
    <a href="https://sport-up.io"><b>🌐 L'Application pour les joueurs</b></a>
  </p>
</div>

---

![Aperçu du calendrier](https://user-images.githubusercontent.com/44646033/131834481-df365615-bd2d-43e0-a817-ae32b9140fd1.png)

## ✨ Points forts

- 🗓️ Vue semaine avec sélecteur de semaine intégré.
- 🎨 Couleurs par évènement ou par défaut, dans le thème Ant Design.
- 🌙 Évènements sur plusieurs jours découpés automatiquement jour par jour.
- 🔍 Filtres personnalisés et affichage d'un sous-ensemble d'évènements.
- 📌 En-tête fixe, week-ends optionnels, semaine au format européen ou américain.
- 🧩 Typé de bout en bout : vos propres champs d'évènement sont conservés dans les callbacks.

## 📦 Installation

```bash
npm install @sportup/antd-weekly-calendar
```

Dépendances à installer à côté : `react`, `react-dom`, `antd` et `@ant-design/icons`.

## 🚀 Exemple

```tsx
import { WeeklyCalendar } from '@sportup/antd-weekly-calendar';

const events = [
  {
    eventId: '1',
    startTime: new Date(2026, 3, 21, 12, 0),
    endTime: new Date(2026, 3, 21, 14, 30),
    title: 'Foot à 5 · Terrain 1',
    backgroundColor: '#E53935',
  },
  {
    eventId: '2',
    startTime: new Date(2026, 3, 23, 18, 0),
    endTime: new Date(2026, 3, 23, 19, 30),
    title: 'Padel · Court 2',
  },
];

export function MyCalendar() {
  return (
    <WeeklyCalendar
      events={events}
      onEventClick={(event) => console.log(event)}
      onSelectDate={(date) => console.log(date)}
    />
  );
}
```

## 📖 API

### `<WeeklyCalendar />`

| Propriété | Type | Défaut | Description |
| --- | --- | --- | --- |
| `events` | `T[]` | – | Évènements à afficher. |
| `onEventClick?` | `(event: T) => void` | – | Appelé au clic sur un évènement. |
| `onSelectDate?` | `(date: Date) => void` | – | Appelé avec le premier jour de la semaine affichée, à chaque changement. |
| `currentDate?` | `Date` | aujourd'hui | Semaine à afficher, suivie à chaque changement. |
| `value?` | `Date` | – | Déprécié : utiliser `currentDate`. |
| `filterComponent?` | `ReactNode` | – | Filtres affichés à côté du sélecteur de semaine. |
| `filteredEventIds?` | `(string \| number)[]` | – | N'affiche que ces évènements quand la liste n'est pas vide. |
| `weekends?` | `boolean` | `false` | Affiche le samedi et le dimanche. |
| `headerSticky?` | `boolean` | `false` | Fixe l'en-tête au défilement. |
| `usaCalendar?` | `boolean` | `false` | Fait commencer la semaine le dimanche. |
| `eventTextColor?` | `string` | `white` | Couleur de texte par défaut des évènements. |
| `eventBackgroundColor?` | `string` | `#36CFC9` | Couleur de fond par défaut des évènements. |

### Évènement

| Champ | Type | Description |
| --- | --- | --- |
| `eventId` | `string` | Identifiant unique. |
| `startTime` | `Date` | Début. |
| `endTime` | `Date` | Fin. |
| `title?` | `string \| null` | Titre. |
| `location?` | `string \| null` | Lieu. |
| `textColor?` | `string` | Couleur du texte, tout format CSS (`#f00`, `rgb(255,0,0)`, `red`…). |
| `backgroundColor?` | `string` | Couleur de fond, tout format CSS. |

Tout champ supplémentaire de votre type `T` est transmis tel quel à `onEventClick`.

## 🛠️ Développement local

```bash
npm install
npm run test:watch    # tests Vitest en continu
npm run build:watch   # build Vite en continu
```

Pour essayer une modification dans le back-office [Sport UP Pro](https://gitlab.com/sport-up-group/front/sportup-pro) avant publication :

```bash
npm run build
cd ../sportup-pro
rm -rf node_modules/@sportup/antd-weekly-calendar/dist
cp -r ../antd-weekly-calendar/dist node_modules/@sportup/antd-weekly-calendar/dist
npm run dev
```

| Commande | Rôle |
| --- | --- |
| `npm run build` | Build ES, UMD et types dans `dist/`. |
| `npm test` | Tests Vitest avec couverture. |
| `npm run typecheck` | Vérification TypeScript. |
| `npm run lint` | ESLint. |

## 🤝 Contribuer

Voir le [guide de contribution](CONTRIBUTING.md). Pour une faille de sécurité : [SECURITY.md](SECURITY.md).

## 👥 Contributeurs

<table>
  <tr>
    <td align="center" width="220">
      <a href="https://github.com/william-donnette"><img src="https://github.com/william-donnette.png?size=200" width="100" alt="William Donnette" /></a><br />
      <b>William Donnette</b><br />
      <sub>
        <a href="https://github.com/william-donnette">GitHub</a> ·
        <a href="https://gitlab.com/william-donnette">GitLab</a> ·
        <a href="https://fr.linkedin.com/in/william-donnette-a997a4192">LinkedIn</a>
      </sub>
    </td>
    <td align="center" width="220">
      <a href="https://github.com/samuelpeybernes-dev"><img src="https://github.com/samuelpeybernes-dev.png?size=200" width="100" alt="Samuel Peybernes" /></a><br />
      <b>Samuel Peybernes</b><br />
      <sub>
        <a href="https://github.com/samuelpeybernes-dev">GitHub</a> ·
        <a href="https://gitlab.com/samuelpeybernes-dev">GitLab</a> ·
        <a href="https://fr.linkedin.com/in/samuel-peybernes-152192196">LinkedIn</a>
      </sub>
    </td>
  </tr>
</table>

Basé sur le projet original [antd-weekly-calendar](https://github.com/yoavweber/antd-weekly-calendar) de [yoavweber](https://github.com/yoavweber).

## 📄 Licence

[MIT](LICENSE).

<div align="center">
  <br />
  <sub>Fait avec ❤️ en France par l'équipe <a href="https://sport-up.io">Sport UP</a></sub>
</div>
