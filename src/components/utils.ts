import {
  add,
  addHours,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  format,
  getDay,
  isSameDay,
  isSameHour,
  isSameWeek,
  startOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  DayName,
  EventsObject,
  GenericEvent,
  WeekDateRange,
  WeekObject,
} from './types';

/**
 * Global format function that applies French locale when usaCalendar is false
 */
export const formatWithLocale = (
  date: Date,
  formatStr: string,
  usaCalendar: boolean = false
) => {
  return usaCalendar
    ? format(date, formatStr)
    : format(date, formatStr, { locale: fr });
};

/**
 * Converts an array of events into a structured object representing the events of a specific week.
 *
 * This function processes a list of events and organizes them into a week object, where each day of the week (Sunday to Saturday)
 * contains an array of events that occur on that day. The function handles events that span multiple days by splitting them
 * into separate events for each day they cover.
 *
 * @template T - The type of the event objects in the events array. This should extend the GenericEvent interface.
 * @param {T[]} events - The array of event objects to be processed. Each event object must have a `startTime` and `endTime`.
 * @param {Date} startWeek - The start date of the week for which the events should be organized.
 * @returns {WeekObject<T>} An object representing the week, where each key is a day of the week ('sunday', 'monday', etc.),
 * and the value is an array of events that occur on that day.
 * // weekObject will contain events organized by day for the specified week
 */
export const daysToWeekObject = <T extends GenericEvent>(
  events: T[],
  startWeek: Date,
  weekStartsOn: 0 | 1 = 1
) => {
  const dayNames: DayName[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const weekObject: WeekObject<T> = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  if (events == null) {
    return weekObject;
  }
  for (const eventListIndex in events) {
    const eventStartTimeDay = events[eventListIndex].startTime;
    const eventEndTimeDay = events[eventListIndex].endTime;

    if (!isSameWeek(eventStartTimeDay, startWeek, { weekStartsOn })) {
      continue;
    }

    if (!isSameDay(eventStartTimeDay, eventEndTimeDay)) {
      const result = eachDayOfInterval({
        start: startOfDay(eventStartTimeDay),
        end: startOfDay(eventEndTimeDay),
      });

      for (
        let dayIntervalIndex = 0;
        dayIntervalIndex < result.length;
        dayIntervalIndex++
      ) {
        const currentDay = result[dayIntervalIndex];
        const isFirstDay = dayIntervalIndex === 0;
        const isLastDay = dayIntervalIndex === result.length - 1;

        const splitedEvent = { ...events[eventListIndex] };

        // Store original times for display purposes
        splitedEvent.originalStartTime = eventStartTimeDay;
        splitedEvent.originalEndTime = eventEndTimeDay;

        if (isFirstDay) {
          // Premier jour : garde l'heure de début originale, termine à minuit
          splitedEvent.startTime = eventStartTimeDay;
          splitedEvent.endTime = endOfDay(currentDay);
        } else if (isLastDay) {
          // Dernier jour : commence à minuit, garde l'heure de fin originale
          splitedEvent.startTime = startOfDay(currentDay);
          splitedEvent.endTime = eventEndTimeDay;
        } else {
          // Jours intermédiaires : toute la journée
          splitedEvent.startTime = startOfDay(currentDay);
          splitedEvent.endTime = endOfDay(currentDay);
        }

        const weekObjectKey: DayName = dayNames[getDay(currentDay)];
        if (isSameWeek(startWeek, currentDay, { weekStartsOn })) {
          weekObject[weekObjectKey].push(splitedEvent);
        }
      }
    } else {
      const weekObjectKey: DayName = dayNames[getDay(eventStartTimeDay)];
      weekObject[weekObjectKey].push(events[eventListIndex]);
    }
  }

  return weekObject;
};

/**
 *
 * This function processes a week's worth of events, grouping them by hour for each day of the week.
 * It creates an array of objects representing each hour slot. Each object contains a list of events that occur within that hour on each day.
 * The first row represents all-day events, followed by 24 hourly rows.
 *
 * @template T - The type of the event objects. This should extend the GenericEvent interface.
 * @param {WeekDateRange} weekRange - The start and end dates for the week being processed.
 * @param {WeekObject<T>} [weekObject] - An object containing arrays of events for each day of the week.
 * @returns {EventsObject<T>[]} An array of event objects, grouped by hour, to be used in a calendar table.
 *
 * @remarks
 * - The function generates 26 rows: 1 for all-day events, 24 for each hour of the day, and 1 header row.
 * - Each day of the week is processed, and events are filtered to determine whether they occur within the
 *   corresponding hour slot. The `isSameHour` function ensures that events are accurately placed.
 * - The generated array can be used to populate an Ant Design Table component, aligning events with their
 *   corresponding hour and day.
 *
 * @see createDayColumns
 */

export const getDayHoursEvents = <T extends GenericEvent>(
  weekRange: WeekDateRange,
  weekObject: WeekObject<T> | undefined,
  usaCalendar: boolean = false,
  includeWeekends: boolean = true
) => {
  const ROW_AMOUNT = 24;

  const events: EventsObject<T>[] = [];

  // Use the same logic as columns.tsx
  const dayIndices = usaCalendar
    ? includeWeekends
      ? [0, 1, 2, 3, 4, 5, 6] // USA: Sunday to Saturday
      : [1, 2, 3, 4, 5] // USA: Monday to Friday (no weekends)
    : includeWeekends
      ? [1, 2, 3, 4, 5, 6, 0] // European: Monday to Sunday
      : [1, 2, 3, 4, 5]; // European: Monday to Friday (no weekends)

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const dayNamesLower = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const;

  for (let i = 0; i < ROW_AMOUNT; i++) {
    const startDate = startOfDay(weekRange.startDate);
    const hour = addHours(startDate, i);

    // Build the event object dynamically
    const eventObj: EventsObject<T> = {
      id: i,
      hourObject: hour,
      hour: usaCalendar
        ? formatWithLocale(hour, 'hh a', true) // USA format: 12 AM, 01 PM, etc.
        : formatWithLocale(hour, 'HH:mm', false), // French format: 00:00, 13:00, etc.
    } as EventsObject<T>; // Add events for each day in the same order as columns
    dayIndices.forEach((dayIndex, columnIndex) => {
      const dayName = dayNames[dayIndex]; // Column key (e.g., 'Sunday')
      const dayNameLower = dayNamesLower[dayIndex]; // WeekObject key (e.g., 'sunday')

      // Calculate date offset based on calendar type
      let dateOffset: number;
      if (usaCalendar) {
        // USA: use dayIndex directly (0=Sunday, 1=Monday, etc.)
        dateOffset = dayIndex;
      } else {
        // European: handle Sunday (dayIndex=0) as last day of week
        if (dayIndex === 0) {
          // Sunday is 6 days after Monday (the start of European week)
          dateOffset = 6;
        } else {
          // Monday(1)=0, Tuesday(2)=1, Wednesday(3)=2, Thursday(4)=3, Friday(5)=4, Saturday(6)=5
          dateOffset = dayIndex - 1;
        }
      }

      const dayHour = add(hour, { days: dateOffset });

      const eventsForThisHour =
        weekObject?.[dayNameLower] &&
        weekObject[dayNameLower].filter((e) => {
          return isSameHour(e.startTime, dayHour);
        });

      (eventObj as any)[dayName] = eventsForThisHour;
    });

    events.push(eventObj);
  }
  return events;
};

const HOUR_TO_DECIMAL = 1.666666667;
export const MIN_BOX_SIZE = 40;

// make sure that the hour and the daya are the same
export const sizeEventBox = <T extends GenericEvent>(event: T, hour: Date) => {
  const eventStartTime = new Date(event.startTime);
  const eventEndTime = new Date(event.endTime);

  const boxSize =
    Math.floor(
      differenceInMinutes(eventEndTime, eventStartTime) * HOUR_TO_DECIMAL
    ) < MIN_BOX_SIZE
      ? MIN_BOX_SIZE
      : Math.floor(
          differenceInMinutes(eventEndTime, eventStartTime) * HOUR_TO_DECIMAL
        );
  const boxPosition =
    differenceInMinutes(hour, eventStartTime) * HOUR_TO_DECIMAL > 100
      ? 0
      : differenceInMinutes(eventStartTime, hour) * HOUR_TO_DECIMAL;
  return { boxPosition: boxPosition, boxSize: boxSize };
};

/**
 * calculateScrollOffset - A  to calculate the scroll offset needed to bring a specific row into view.
 *
 * @param {HTMLDivElement} container - The container element that is scrollable.
 * @param {HTMLDivElement} row - The row element that needs to be scrolled into view.
 * @returns {number} - The calculated scroll offset value.
 *
 * This function calculates how much the container needs to be scrolled to bring the target row into view.
 * It determines the difference between the container's top position and the row's top position, and adjusts
 * the scroll position accordingly, with an extra offset to position the row appropriately in the view.
 */
export function calculateScrollOffset(
  container: HTMLDivElement,
  row: HTMLDivElement
): number {
  const containerTop = container.getBoundingClientRect().top;
  const rowTop = row.getBoundingClientRect().top;
  return rowTop - containerTop; // Adjust to scroll just enough to show the row
}

/**
 * Determines if the provided `hourObject` represents the same hour as the `currentDate` within the same week.
 *
 * @param hourObject - The date object to compare, or `undefined`.
 * @param currentDate - The current date to compare against.
 * @returns `true` if `hourObject` is defined and represents the same hour within the same week as `currentDate`; otherwise, `false`.
 */
export function isCurentHour(
  hourObject: Date | undefined,
  currentDate: Date
): boolean {
  if (!hourObject) return false;
  return (
    hourObject.getHours() === currentDate.getHours() &&
    isSameWeek(hourObject, currentDate)
  );
}
