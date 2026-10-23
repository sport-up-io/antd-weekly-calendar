import { Grid, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

import { createDayColumns, SCROLL_TO_ROW } from './columns';
import type {
  BaseCalendarProps,
  EventsObject,
  GenericEvent,
  WeekDateRange,
  WeekObject,
} from './types';
import {
  calculateScrollOffset,
  getDayHoursEvents,
  isCurrentHour,
} from './utils';

const CONTAINER_STYLE: CSSProperties = { height: '80vh', overflow: 'auto' };
const ROW_STYLE: CSSProperties = { padding: '8px 0' };
const CURRENT_HOUR_ROW_STYLE: CSSProperties = {
  ...ROW_STYLE,
  boxShadow: 'rgba(100, 100, 111, 0.2) 0px 0px 29px 0px',
};
const STICKY_HEADER_CSS = `
  .ant-table-thead > tr > th {
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
  }
`;

export interface CalendarBodyProps<T extends GenericEvent = GenericEvent>
  extends BaseCalendarProps<T> {
  weekDatesRange: WeekDateRange;
  getDayEvents?: WeekObject<T>;
}

/**
 * Grille horaire de la semaine. Au montage, elle défile jusqu'à la ligne
 * `SCROLL_TO_ROW` ; la ligne de l'heure courante est mise en relief.
 */
export function CalendarBody<T extends GenericEvent>({
  weekDatesRange,
  getDayEvents,
  onEventClick,
  weekends = false,
  headerSticky = false,
  usaCalendar = false,
}: Readonly<CalendarBodyProps<T>>) {
  const rowRef = useRef<HTMLTableCellElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isExtraSmall = Grid.useBreakpoint().xs ?? false;

  useEffect(() => {
    const container = tableContainerRef.current;
    const row = rowRef.current;
    if (!container || !row || !('scrollTo' in container)) return;

    container.scrollTo({
      top: calculateScrollOffset(container, row),
      behavior: 'smooth',
    });
  }, []);

  const fontSize = isExtraSmall ? '12px' : '14px';
  const hourColumn: ColumnType<EventsObject<T>> = {
    title: (
      <div
        style={{
          fontSize: isExtraSmall ? '14px' : '16px',
          textAlign: 'center',
          padding: '8px 0',
        }}
      >
        Hours
      </div>
    ),
    dataIndex: 'hour',
    key: 'hour',
    width: isExtraSmall ? 50 : 1,
    onCell: (_, index) => ({
      style: { width: isExtraSmall ? '30%' : '10%', fontSize },
      ref: SCROLL_TO_ROW === index ? rowRef : undefined,
    }),
  };
  const dayColumns = createDayColumns({
    weekDates: weekDatesRange,
    includeWeekends: weekends,
    onEventClick,
    usaCalendar,
    fontSize,
  });

  return (
    <div ref={tableContainerRef} style={CONTAINER_STYLE}>
      {headerSticky && <style>{STICKY_HEADER_CSS}</style>}
      <Table
        rowKey="id"
        dataSource={getDayHoursEvents({
          weekRange: weekDatesRange,
          weekObject: getDayEvents,
          usaCalendar,
          includeWeekends: weekends,
        })}
        columns={[hourColumn, ...dayColumns]}
        pagination={false}
        bordered
        onRow={(record) => ({
          style: isCurrentHour(record.hourObject, new Date())
            ? CURRENT_HOUR_ROW_STYLE
            : ROW_STYLE,
        })}
      />
    </div>
  );
}
