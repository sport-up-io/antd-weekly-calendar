import { getNowIndicatorPosition } from './utils';

const LINE_HEIGHT = 2;
const DOT_SIZE = 8;

interface NowIndicatorProps {
  color: string;
  /** Début de l'heure affichée par la cellule, au jour de la colonne. */
  cellStart: Date;
  now: Date;
}

/** Trait de l'heure actuelle, affiché seulement dans la cellule qui la contient. */
export function NowIndicator({
  color,
  cellStart,
  now,
}: Readonly<NowIndicatorProps>) {
  const position = getNowIndicatorPosition(cellStart, now);
  if (position === null) return null;

  return (
    <div
      aria-hidden
      data-testid="now-indicator"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${position}%`,
        height: LINE_HEIGHT,
        marginTop: -LINE_HEIGHT / 2,
        backgroundColor: color,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: -DOT_SIZE / 2,
          top: (LINE_HEIGHT - DOT_SIZE) / 2,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    </div>
  );
}
