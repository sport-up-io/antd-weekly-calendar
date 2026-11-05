import { getHatchedPatternStyle } from './getHatchedPatternStyle';
import type { HatchedZone } from './types';
import { getHatchedCellBoxes } from './utils';

interface HatchedCellOverlayProps {
  zones: HatchedZone[];
  /** Début de l'heure affichée par la cellule, au jour de la colonne. */
  cellStart: Date;
}

/** Zones hachurées d'une cellule horaire, placées sous les évènements. */
export function HatchedCellOverlay({
  zones,
  cellStart,
}: Readonly<HatchedCellOverlayProps>) {
  return zones.flatMap((zone) =>
    getHatchedCellBoxes(zone.periods, cellStart).map(
      ({ boxPosition, boxSize }) => (
        <div
          key={`${zone.key}-${boxPosition}`}
          aria-hidden
          data-testid={`hatched-zone-${zone.key}`}
          style={{
            ...getHatchedPatternStyle(zone.color),
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${boxPosition}%`,
            height: `${boxSize}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )
    )
  );
}
