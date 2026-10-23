import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { DayColumnKey, DayName } from './types';

/** Clés de `WeekObject`, indexées par `Date.getDay()`. */
export const DAY_NAMES: readonly DayName[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/** Clés des colonnes de la table, indexées par `Date.getDay()`. */
export const DAY_COLUMN_KEYS: readonly DayColumnKey[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const WORKING_DAYS = [1, 2, 3, 4, 5];
const USA_WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];
const FRENCH_WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0];

export interface LocaleFormatter {
  formatDate: (date: Date, formatStr: string) => string;
  formatHour: (date: Date) => string;
  dayNames: readonly DayColumnKey[];
  dayNamesLower: readonly DayName[];
  /** Jours affichés, en index `Date.getDay()`, dans l'ordre des colonnes. */
  getDayIndices: (includeWeekends: boolean) => number[];
  /** Nombre de jours entre le début de semaine et le jour `dayIndex`. */
  getDateOffset: (dayIndex: number) => number;
}

/**
 * Formatage et ordre des jours du calendrier : semaine américaine (dimanche
 * en premier, heures sur 12 h, anglais) ou française (lundi en premier,
 * heures sur 24 h, français).
 */
export const createLocaleFormatter = (
  usaCalendar: boolean = false
): LocaleFormatter => {
  const locale = usaCalendar ? undefined : fr;
  const weekDays = usaCalendar ? USA_WEEK_DAYS : FRENCH_WEEK_DAYS;

  return {
    formatDate: (date, formatStr) => format(date, formatStr, { locale }),
    formatHour: (date) =>
      usaCalendar ? format(date, 'hh a') : format(date, 'HH:mm', { locale }),
    dayNames: DAY_COLUMN_KEYS,
    dayNamesLower: DAY_NAMES,
    getDayIndices: (includeWeekends) =>
      includeWeekends ? [...weekDays] : [...WORKING_DAYS],
    getDateOffset: (dayIndex) => (usaCalendar ? dayIndex : (dayIndex + 6) % 7),
  };
};
