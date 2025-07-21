import { ColumnProps } from 'antd/es/table';
import { add } from 'date-fns';
import React from 'react';

import { EventBlock } from './Event';
import { createLocaleFormatter } from './localeConfig';
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
  const locale = createLocaleFormatter(usaCalendar);
  const dayIndices = locale.getDayIndices(includeWeekends);

  return dayIndices.map((dayIndex) => {
    const dateOffset = locale.getDateOffset(dayIndex);
    const columnDate = add(weekDates.startDate, { days: dateOffset });
    const dayName = locale.formatDate(columnDate, 'iii');
    const formattedDay = `${dayName} ${locale.formatDate(columnDate, 'dd')}`;

    return {
      title: formattedDay,
      dataIndex: locale.dayNames[dayIndex],
      key: locale.dayNames[dayIndex],
      width: 2,
      render: (
        events: T[],
        row: EventsObject<T>
      ): React.ReactNode | undefined => {
        if (events?.length > 0) {
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
