import { ColumnProps } from 'antd/es/table';
import { add, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React from 'react';

import { EventBlock } from './Event';
import { EventsObject, GenericEvent } from './types';

export const SCROLL_TO_ROW = 6;

/**
 * Generates columns for each day of the week to be used in an Ant Design (antd) Table component based on the provided date range and whether
 * weekends should be included. The events displayed in the
 * columns are provided by the `getDayHoursEvents` function and will appear if `dataIndex`, and `key` would be set correctly.
 *
 * @template T - The type of the event objects, extending the GenericEvent interface.
 * @param {WeekDateRange} weekDates - The start and end dates for the week.
 * @param {boolean} includeWeekends - Whether to include weekends in the view.
 * @param {(e: T) => any | undefined} [onEventClick] - Optional callback for handling event clicks.
 * @param {boolean} [usaCalendar=false] - Whether to use USA calendar order (Sunday to Saturday) or French order (Monday to Sunday).
 * @returns {ColumnProps<EventsObject<T>>[]} An array of column properties for the Ant Design Table.
 *
 * @remarks
 * The format of the columns is crucial for the Ant Design Table to render correctly and match data
 * to the appropriate columns. This function works with `getDayHoursEvents` to ensure events are properly
 * aligned with the generated columns.
 *
 * @see getDayHoursEvents
 */
export function createDayColumns<T extends GenericEvent>(
  weekDates: { startDate: Date; endDate: Date },
  includeWeekends: boolean,
  onEventClick?: (e: T) => any | undefined,
  usaCalendar: boolean = false
): ColumnProps<EventsObject<T>>[] {
  // Calendar order depends on usaCalendar prop
  const dayIndices = usaCalendar
    ? includeWeekends
      ? [0, 1, 2, 3, 4, 5, 6] // USA: Sunday to Saturday
      : [1, 2, 3, 4, 5] // USA: Monday to Friday (no weekends)
    : includeWeekends
      ? [1, 2, 3, 4, 5, 6, 0] // European: Monday to Sunday
      : [1, 2, 3, 4, 5]; // European: Monday to Friday (no weekends)

  // Data keys always in English with capital letters (to match utils.ts)
  const dayDataKeys = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return dayIndices.map((dayIndex, columnIndex) => {
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

    const columnDate = add(weekDates.startDate, { days: dateOffset });

    // Use French locale for day names when usaCalendar is false
    const dayName = usaCalendar
      ? format(columnDate, 'iii') // English short day name
      : format(columnDate, 'iii', { locale: fr }); // French short day name

    const formattedDay = `${dayName} ${format(columnDate, 'dd')}`;

    return {
      title: formattedDay,
      dataIndex: dayDataKeys[dayIndex],
      key: dayDataKeys[dayIndex],
      width: 2,
      render: (
        events: T[],
        row: EventsObject<T>
      ): React.ReactNode | undefined => {
        if (events && events.length > 0) {
          return events.map((event: T, index: number) => (
            <EventBlock
              key={event.eventId}
              event={event}
              index={index}
              hour={row.hourObject}
              events={events.length}
              onEventClick={onEventClick}
              usaCalendar={usaCalendar}
            />
          ));
        }
        return undefined;
      },
    } as ColumnProps<EventsObject<T>>;
  });
}
