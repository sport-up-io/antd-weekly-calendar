import type { ColumnType } from 'antd/es/table';
import { add } from 'date-fns';
import type { CSSProperties } from 'react';

import { EventBlock } from './Event';
import { getLocaleFormatter } from './localeConfig';
import type { EventsObject, GenericEvent, WeekDateRange } from './types';

export const SCROLL_TO_ROW = 6;

const DAY_COLUMN_WIDTH = 2;

interface DayColumnsParams<T extends GenericEvent> {
  weekDates: WeekDateRange;
  includeWeekends: boolean;
  onEventClick?: (event: T) => void;
  usaCalendar?: boolean;
  /** Taille de police des en-têtes de colonne. */
  fontSize: CSSProperties['fontSize'];
}

/**
 * Colonnes de jour de la table antd, dans l'ordre de la semaine choisie.
 *
 * Le `dataIndex` de chaque colonne correspond aux clés des lignes produites par
 * `getDayHoursEvents` : les deux fonctions doivent rester alignées.
 *
 * @see getDayHoursEvents
 */
export function createDayColumns<T extends GenericEvent>({
  weekDates,
  includeWeekends,
  onEventClick,
  usaCalendar = false,
  fontSize,
}: DayColumnsParams<T>): ColumnType<EventsObject<T>>[] {
  const locale = getLocaleFormatter(usaCalendar);

  return locale.getDayIndices(includeWeekends).map((dayIndex) => {
    const columnDate = add(weekDates.startDate, {
      days: locale.getDateOffset(dayIndex),
    });
    const dayKey = locale.dayNames[dayIndex];

    return {
      title: (
        <div style={{ whiteSpace: 'nowrap', fontSize }}>
          {`${locale.formatDate(columnDate, 'iii')} ${locale.formatDate(columnDate, 'dd')}`}
        </div>
      ),
      dataIndex: dayKey,
      key: dayKey,
      width: DAY_COLUMN_WIDTH,
      render: (events: T[] | undefined, row: EventsObject<T>) =>
        events?.map((event, index) => (
          <EventBlock
            key={event.eventId}
            event={event}
            index={index}
            hour={row.hourObject}
            events={events.length}
            onEventClick={onEventClick}
            usaCalendar={usaCalendar}
          />
        )),
    };
  });
}
