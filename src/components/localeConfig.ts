import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Centralized locale configuration for the calendar
 */
export const createLocaleFormatter = (usaCalendar: boolean = false) => {
  const locale = usaCalendar ? undefined : fr;

  // Data keys for column mapping (always English and capitalized)
  const dayDataKeys = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // WeekObject keys (always English and lowercase)
  const dayObjectKeys: (keyof import('./types').WeekObject<any>)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  return {
    formatDate: (date: Date, formatStr: string) =>
      format(date, formatStr, { locale }),
    formatHour: (date: Date) =>
      usaCalendar ? format(date, 'hh a') : format(date, 'HH:mm', { locale }),
    dayNames: dayDataKeys, // For column headers and data keys
    dayNamesLower: dayObjectKeys, // For WeekObject access
    getDayIndices: (includeWeekends: boolean) =>
      usaCalendar
        ? includeWeekends
          ? [0, 1, 2, 3, 4, 5, 6]
          : [1, 2, 3, 4, 5]
        : includeWeekends
          ? [1, 2, 3, 4, 5, 6, 0]
          : [1, 2, 3, 4, 5],
    getDateOffset: (dayIndex: number) =>
      usaCalendar ? dayIndex : dayIndex === 0 ? 6 : dayIndex - 1,
  };
};
