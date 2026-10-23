import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Durée pendant laquelle un évènement reste déplié. */
export const EXPANSION_DURATION_MS = 1500;

interface UseEventExpansionResult {
  isExpanded: boolean;
  expand: () => void;
}

/**
 * Dépliage temporaire d'un évènement : il se replie après
 * `EXPANSION_DURATION_MS` ou au premier clic hors de `eventRef`.
 */
export const useEventExpansion = (
  eventRef: RefObject<HTMLElement | null>
): UseEventExpansionResult => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      const element = eventRef.current;
      if (
        element &&
        event.target instanceof Node &&
        !element.contains(event.target)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const timer = setTimeout(
      () => setIsExpanded(false),
      EXPANSION_DURATION_MS
    );

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, [isExpanded, eventRef]);

  return { isExpanded, expand: () => setIsExpanded(true) };
};
