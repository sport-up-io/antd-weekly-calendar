import type { CSSProperties } from 'react';

/** Côté du carreau, entier pour que chaque rayure tombe au même endroit dans les pixels. */
const TILE_SIZE = '10px';

/**
 * Rayures diagonales de la couleur donnée. Le motif est fixé à la fenêtre pour
 * que les zones de cellules voisines forment une seule trame continue.
 */
export const getHatchedPatternStyle = (color: string): CSSProperties => ({
  backgroundImage: `linear-gradient(45deg, transparent 45%, ${color} 45%, ${color} 55%, transparent 55%)`,
  backgroundSize: `${TILE_SIZE} ${TILE_SIZE}`,
  backgroundAttachment: 'fixed',
});
