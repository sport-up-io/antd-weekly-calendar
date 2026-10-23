import { startOfWeek } from 'date-fns';
import { useEffect, useEffectEvent, useState } from 'react';

import type { WeekStartsOn } from './types';

interface UseCurrentWeekParams {
  /** Date imposée par le parent : la semaine affichée la suit à chaque changement. */
  date?: Date;
  weekStartsOn: WeekStartsOn;
  onWeekChange?: (startWeek: Date) => void;
}

interface UseCurrentWeekResult {
  startWeek: Date;
  setStartWeek: (startWeek: Date) => void;
}

/**
 * Premier jour de la semaine affichée.
 *
 * La semaine se recale sur `date` dès que le parent en passe une nouvelle.
 * `onWeekChange` est appelé au montage puis à chaque changement de semaine,
 * quelle qu'en soit l'origine.
 */
export const useCurrentWeek = ({
  date,
  weekStartsOn,
  onWeekChange,
}: UseCurrentWeekParams): UseCurrentWeekResult => {
  const [startWeek, setStartWeek] = useState(() =>
    startOfWeek(date ?? new Date(), { weekStartsOn })
  );
  const [syncedDate, setSyncedDate] = useState(date);
  const [syncedWeekStartsOn, setSyncedWeekStartsOn] = useState(weekStartsOn);

  if (date !== syncedDate || weekStartsOn !== syncedWeekStartsOn) {
    setSyncedDate(date);
    setSyncedWeekStartsOn(weekStartsOn);
    const dateWeek = date && startOfWeek(date, { weekStartsOn });
    if (dateWeek && dateWeek.getTime() !== startWeek.getTime()) {
      setStartWeek(dateWeek);
    }
  }

  const notifyWeekChange = useEffectEvent((week: Date) => {
    onWeekChange?.(week);
  });

  useEffect(() => {
    notifyWeekChange(startWeek);
  }, [startWeek]);

  return { startWeek, setStartWeek };
};
