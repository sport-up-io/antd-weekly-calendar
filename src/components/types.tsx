import type { ReactNode } from 'react';

export interface GenericEvent {
  eventId: string;
  startTime: Date;
  endTime: Date;
  title?: string | null;
  location?: string | null;
  textColor?: string;
  backgroundColor?: string;
  /** Début réel d'un évènement sur plusieurs jours, découpé jour par jour. */
  originalStartTime?: Date;
  /** Fin réelle d'un évènement sur plusieurs jours, découpé jour par jour. */
  originalEndTime?: Date;
}

export interface BaseCalendarProps<T extends GenericEvent = GenericEvent> {
  onEventClick?: (event: T) => void;
  onSelectDate?: (date: Date) => void;
  weekends?: boolean;
  eventTextColor?: string;
  eventBackgroundColor?: string;
  headerSticky?: boolean;
  usaCalendar?: boolean;
}

export interface CalendarContainerProps<T extends GenericEvent = GenericEvent>
  extends BaseCalendarProps<T> {
  events: T[];
  /**
   * @deprecated Use `currentDate` instead.
   */
  value?: Date;
  currentDate?: Date;
  filterComponent?: ReactNode;
  filteredEventIds?: (string | number)[];
}

/** Premier jour de la semaine : 0 pour dimanche (USA), 1 pour lundi. */
export type WeekStartsOn = 0 | 1;

/** Clés de `WeekObject`, dans l'ordre de `Date.getDay()`. */
export type DayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** Clés des colonnes de jour de la table, dans l'ordre de `Date.getDay()`. */
export type DayColumnKey =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type WeekObject<T> = Record<DayName, T[]>;

/** Ligne horaire de la table : l'heure et les évènements de chaque jour affiché. */
export type EventsObject<T> = {
  id: number;
  hourObject: Date;
  hour: string;
} & Partial<Record<DayColumnKey, T[]>>;

export interface WeekDateRange {
  startDate: Date;
  endDate: Date;
}
