import { Grid, Table } from 'antd';
import React, { useEffect, useRef } from 'react';

import { createDayColumns, SCROLL_TO_ROW } from './columns';
import { CalendarBodyProps, GenericEvent } from './types';
import {
  calculateScrollOffset,
  getDayHoursEvents,
  isCurentHour,
} from './utils';
import { ColumnsType, ColumnType } from 'antd/es/table';

const { useBreakpoint } = Grid;

function Calendar<T extends GenericEvent>({
  weekDatesRange,
  getDayEvents,
  onEventClick,
  weekends,
  headerSticky,
  usaCalendar,
}: CalendarBodyProps<T>) {
  const rowRef = useRef<null | HTMLDivElement>(null);
  const tableContainerRef = useRef<null | HTMLDivElement>(null);

  const screens = useBreakpoint();

  useEffect(() => {
    if (
      rowRef.current &&
      tableContainerRef.current &&
      'scrollTo' in tableContainerRef.current
    ) {
      const scrollOffset = calculateScrollOffset(
        tableContainerRef.current,
        rowRef.current
      );
      tableContainerRef.current.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
    }
  }, [SCROLL_TO_ROW]);

  const fontSize = screens.xs ? '12px' : '14px';
  const hourColumn = {
    title: (
      <div
        style={{
          fontSize: screens.xs ? '14px' : '16px',
          textAlign: 'center',
          padding: '8px 0',
        }}
      >
        Hours
      </div>
    ),
    dataIndex: 'hour',
    key: 'hour',
    width: screens.xs ? 50 : 1,
    onCell: (data: any, index?: number) => ({
      style: {
        width: screens.xs ? '30%' : '10%',
        fontSize: fontSize,
      },
      ref: SCROLL_TO_ROW === index ? rowRef : undefined,
    }),
  };

  const dayColumns = createDayColumns(
    weekDatesRange,
    weekends,
    onEventClick,
    usaCalendar
  ).map((col) => ({
    ...col,
    title: (
      <div
        style={{
          whiteSpace: 'nowrap',
          fontSize: fontSize,
        }}
      >
        {/*  @ts-ignore */}
        {col.title}
      </div>
    ),
  }));

  const tableColumns = [hourColumn, ...dayColumns];

  return (
    <div
      ref={tableContainerRef}
      style={{
        height: '80vh', // Set a fixed height for the container
        overflow: 'auto', // Allow both vertical and horizontal scrolling within the container only
      }}
    >
      {headerSticky && (
        <style>{`
          .ant-table-thead > tr > th {
            position: sticky !important;
            top: 0 !important;
            z-index: 10 !important;
          }
        `}</style>
      )}
      <Table
        rowKey={(record) => record.id}
        dataSource={getDayHoursEvents(
          weekDatesRange,
          getDayEvents,
          usaCalendar,
          weekends
        )}
        columns={tableColumns}
        pagination={false}
        bordered={true}
        showHeader={true}
        onRow={(record) => {
          if (isCurentHour(record.hourObject, new Date())) {
            return {
              style: {
                boxShadow: 'rgba(100, 100, 111, 0.2) 0px 0px 29px 0px',
                padding: '8px 0',
              },
            };
          }
          return {
            style: {
              padding: '8px 0',
            },
          };
        }}
      />
    </div>
  );
}

export default Calendar;
