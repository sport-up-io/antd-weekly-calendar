import {
  add,
  addHours,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  getDay,
  isSameDay,
  isSameHour,
  isSameWeek,
  startOfDay,
} from 'date-fns';

import { createLocaleFormatter } from './localeConfig';
import {
  DayName,
  EventsObject,
  GenericEvent,
  WeekDateRange,
  WeekObject,
} from './types';

/**
 * Splits multi-day events into separate events for each day
 */
const splitMultiDayEvent = <T extends GenericEvent>(
  event: T,
  dayInterval: Date,
  isFirstDay: boolean,
  isLastDay: boolean
): T => {
  const splitEvent = { ...event };

  // Store original times for display
  splitEvent.originalStartTime = event.startTime;
  splitEvent.originalEndTime = event.endTime;

  if (isFirstDay) {
    splitEvent.endTime = endOfDay(dayInterval);
  } else if (isLastDay) {
    splitEvent.startTime = startOfDay(dayInterval);
  } else {
    splitEvent.startTime = startOfDay(dayInterval);
    splitEvent.endTime = endOfDay(dayInterval);
  }

  return splitEvent;
}; /**
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

  if (!events) return weekObject;

  events.forEach((event) => {
    const eventStartDay = event.startTime;
    const eventEndDay = event.endTime;

    if (!isSameWeek(eventStartDay, startWeek, { weekStartsOn })) return;

    if (isSameDay(eventStartDay, eventEndDay)) {
      // Single day event
      const dayKey: DayName = dayNames[getDay(eventStartDay)];
      weekObject[dayKey].push(event);
    } else {
      // Multi-day event - split it
      const days = eachDayOfInterval({
        start: startOfDay(eventStartDay),
        end: startOfDay(eventEndDay),
      });

      days.forEach((day, index) => {
        const isFirstDay = index === 0;
        const isLastDay = index === days.length - 1;
        const splitEvent = splitMultiDayEvent(
          event,
          day,
          isFirstDay,
          isLastDay
        );

        if (isSameWeek(startWeek, day, { weekStartsOn })) {
          const dayKey: DayName = dayNames[getDay(day)];
          weekObject[dayKey].push(splitEvent);
        }
      });
    }
  });

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
  const locale = createLocaleFormatter(usaCalendar);
  const dayIndices = locale.getDayIndices(includeWeekends);
  const ROW_AMOUNT = 24;
  const events: EventsObject<T>[] = [];

  for (let i = 0; i < ROW_AMOUNT; i++) {
    const startDate = startOfDay(weekRange.startDate);
    const hour = addHours(startDate, i);

    const eventObj: EventsObject<T> = {
      id: i,
      hourObject: hour,
      hour: locale.formatHour(hour),
    } as EventsObject<T>;

    // Add events for each day
    dayIndices.forEach((dayIndex) => {
      const dayName = locale.dayNames[dayIndex]; // Column key
      const dayNameLower = locale.dayNamesLower[dayIndex]; // WeekObject key
      const dateOffset = locale.getDateOffset(dayIndex);
      const dayHour = add(hour, { days: dateOffset });

      const eventsForThisHour = weekObject?.[dayNameLower]?.filter((e) =>
        isSameHour(e.startTime, dayHour)
      );

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
