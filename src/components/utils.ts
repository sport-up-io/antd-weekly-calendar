import {
  add,
  addHours,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  getDay,
  getMonth,
  isSameDay,
  isSameHour,
  isSameWeek,
  startOfDay,
} from 'date-fns';

import { getLocaleFormatter, DAY_NAMES } from './localeConfig';
import type { LocaleFormatter } from './localeConfig';
import type {
  DayColumnKey,
  EventsObject,
  GenericEvent,
  WeekDateRange,
  WeekObject,
  WeekStartsOn,
} from './types';

const HOURS_PER_DAY = 24;
/** Conversion de minutes en pourcentage de la hauteur d'une cellule d'une heure. */
const MINUTES_TO_PERCENT = 1.666666667;
const FULL_CELL_PERCENT = 100;
const MIN_LATE_BOX_SIZE = 25;
const LATE_EVENT_HOUR = 23;
const EVENT_AREA_WIDTH = 93;
const STACKED_EVENT_OFFSET = 26;
const MAX_STACKED_EVENTS = 4;

export const MIN_BOX_SIZE = 40;

interface SplitDayParams<T extends GenericEvent> {
  event: T;
  day: Date;
  isFirstDay: boolean;
  isLastDay: boolean;
}

/** Part d'un évènement sur plusieurs jours qui tombe sur `day`. */
const splitMultiDayEvent = <T extends GenericEvent>({
  event,
  day,
  isFirstDay,
  isLastDay,
}: SplitDayParams<T>): T => ({
  ...event,
  originalStartTime: event.startTime,
  originalEndTime: event.endTime,
  startTime: isFirstDay ? event.startTime : startOfDay(day),
  endTime: isLastDay && !isFirstDay ? event.endTime : endOfDay(day),
});

const createEmptyWeekObject = <T>(): WeekObject<T> => ({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
});

/**
 * Range les évènements par jour de la semaine qui commence à `startWeek`.
 *
 * Un évènement n'est retenu que s'il commence dans cette semaine. Un évènement
 * sur plusieurs jours est découpé en une part par jour, chaque part gardant
 * ses horaires réels dans `originalStartTime` et `originalEndTime` ; les parts
 * qui débordent sur la semaine suivante sont ignorées.
 */
export const daysToWeekObject = <T extends GenericEvent>(
  events: T[],
  startWeek: Date,
  weekStartsOn: WeekStartsOn = 1
): WeekObject<T> => {
  const weekObject = createEmptyWeekObject<T>();

  for (const event of events) {
    if (!isSameWeek(event.startTime, startWeek, { weekStartsOn })) continue;

    if (isSameDay(event.startTime, event.endTime)) {
      weekObject[DAY_NAMES[getDay(event.startTime)]].push(event);
      continue;
    }

    const days = eachDayOfInterval({
      start: startOfDay(event.startTime),
      end: startOfDay(event.endTime),
    });
    days.forEach((day, index) => {
      if (!isSameWeek(startWeek, day, { weekStartsOn })) return;
      weekObject[DAY_NAMES[getDay(day)]].push(
        splitMultiDayEvent({
          event,
          day,
          isFirstDay: index === 0,
          isLastDay: index === days.length - 1,
        })
      );
    });
  }

  return weekObject;
};

interface DayHoursEventsParams<T extends GenericEvent> {
  weekRange: WeekDateRange;
  weekObject?: WeekObject<T>;
  usaCalendar?: boolean;
  includeWeekends?: boolean;
}

/**
 * Lignes de la table : une par heure de la journée, avec pour chaque jour
 * affiché les évènements qui commencent dans cette heure.
 *
 * @see createDayColumns pour les colonnes qui lisent ces lignes.
 */
export const getDayHoursEvents = <T extends GenericEvent>({
  weekRange,
  weekObject,
  usaCalendar = false,
  includeWeekends = true,
}: DayHoursEventsParams<T>): EventsObject<T>[] => {
  const locale = getLocaleFormatter(usaCalendar);
  const dayIndices = locale.getDayIndices(includeWeekends);
  const startDate = startOfDay(weekRange.startDate);

  return Array.from({ length: HOURS_PER_DAY }, (_, hourIndex) => {
    const hour = addHours(startDate, hourIndex);
    const dayEvents: Partial<Record<DayColumnKey, T[]>> = {};

    for (const dayIndex of dayIndices) {
      const dayHour = add(hour, { days: locale.getDateOffset(dayIndex) });
      dayEvents[locale.dayNames[dayIndex]] = weekObject?.[
        locale.dayNamesLower[dayIndex]
      ].filter((event) => isSameHour(event.startTime, dayHour));
    }

    return {
      id: hourIndex,
      hourObject: hour,
      hour: locale.formatHour(hour),
      ...dayEvents,
    };
  });
};

export interface EventBox {
  /** Décalage depuis le haut de la cellule, en pourcentage. */
  boxPosition: number;
  /** Hauteur, en pourcentage de la cellule. */
  boxSize: number;
}

/**
 * Position verticale et hauteur d'un évènement dans la cellule de l'heure
 * `hour`, qui doit être du même jour que l'évènement. Un évènement commençant
 * après 23 h est raccourci pour ne pas déborder de la dernière cellule.
 */
export const sizeEventBox = <T extends GenericEvent>(
  event: T,
  hour: Date
): EventBox => {
  const eventStartTime = new Date(event.startTime);
  const eventEndTime = new Date(event.endTime);

  const boxSize = Math.max(
    Math.floor(
      differenceInMinutes(eventEndTime, eventStartTime) * MINUTES_TO_PERCENT
    ),
    MIN_BOX_SIZE
  );
  const startsBeforeCell =
    differenceInMinutes(hour, eventStartTime) * MINUTES_TO_PERCENT >
    FULL_CELL_PERCENT;
  const boxPosition = startsBeforeCell
    ? 0
    : differenceInMinutes(eventStartTime, hour) * MINUTES_TO_PERCENT;

  const isLateEvent = eventStartTime.getHours() >= LATE_EVENT_HOUR;
  if (!isLateEvent || boxPosition + boxSize <= FULL_CELL_PERCENT) {
    return { boxPosition, boxSize };
  }

  const remainingSpace = FULL_CELL_PERCENT - boxPosition;
  if (remainingSpace >= MIN_LATE_BOX_SIZE) {
    return { boxPosition, boxSize: remainingSpace };
  }
  return {
    boxPosition: FULL_CELL_PERCENT - MIN_LATE_BOX_SIZE,
    boxSize: MIN_LATE_BOX_SIZE,
  };
};

export interface EventBoxLayout {
  /** Décalage depuis la gauche de la cellule, en pourcentage. */
  left: number;
  /** Largeur, en pourcentage de la cellule. */
  width: number;
}

interface EventBoxLayoutParams {
  index: number;
  eventCount: number;
  isExpanded: boolean;
}

/**
 * Placement horizontal du `index`-ième évènement d'une cellule qui en contient
 * `eventCount`. Les évènements se chevauchent en escalier ; à partir de quatre,
 * ils se partagent la largeur. Un évènement déplié occupe toute la largeur.
 */
export const getEventBoxLayout = ({
  index,
  eventCount,
  isExpanded,
}: EventBoxLayoutParams): EventBoxLayout => {
  if (isExpanded) {
    return { left: 0, width: EVENT_AREA_WIDTH };
  }
  const left =
    eventCount >= MAX_STACKED_EVENTS
      ? (EVENT_AREA_WIDTH / eventCount) * index
      : STACKED_EVENT_OFFSET * index;
  return { left, width: EVENT_AREA_WIDTH - left };
};

/**
 * Libellé du ou des mois couverts par la semaine : `janv.` ou `janv.-févr.`.
 */
export const getWeekMonthLabel = (
  startWeek: Date,
  weekStartsOn: WeekStartsOn,
  locale: LocaleFormatter
): string => {
  const endOfWeekDate = endOfWeek(startWeek, { weekStartsOn });
  const startMonth = locale.formatDate(startWeek, 'MMM');

  if (getMonth(endOfWeekDate) === getMonth(startWeek)) {
    return startMonth;
  }
  return `${startMonth}-${locale.formatDate(endOfWeekDate, 'MMM')}`;
};

/**
 * Distance verticale entre le haut du conteneur scrollable et la ligne
 * `row`, pour faire défiler le conteneur jusqu'à cette ligne.
 */
export function calculateScrollOffset(
  container: HTMLElement,
  row: HTMLElement
): number {
  return row.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

/**
 * Vrai si `hourObject` a la même heure que `currentDate` et tombe dans la
 * même semaine (semaine commençant le dimanche).
 */
export function isCurrentHour(
  hourObject: Date | undefined,
  currentDate: Date
): boolean {
  if (!hourObject) return false;
  return (
    hourObject.getHours() === currentDate.getHours() &&
    isSameWeek(hourObject, currentDate)
  );
}
