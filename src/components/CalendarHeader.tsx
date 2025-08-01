import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tag } from 'antd';
import { addWeeks, endOfWeek, getMonth, getWeek, startOfWeek } from 'date-fns';
import React from 'react';

import DatePicker from './DatePicker';
import { createLocaleFormatter } from './localeConfig';
import { CalendarHeaderProps } from './types';

interface MonthNameProps {
  startWeek: Date;
  weekStartsOn?: 0 | 1;
  usaCalendar?: boolean;
}

const MonthName: React.FunctionComponent<MonthNameProps> = ({
  startWeek,
  weekStartsOn = 1,
  usaCalendar = false,
}) => {
  const locale = createLocaleFormatter(usaCalendar);

  const getMonthName = () => {
    const endOfWeekDate = endOfWeek(startWeek, { weekStartsOn });

    if (getMonth(endOfWeekDate) == getMonth(startWeek)) {
      return locale.formatDate(startWeek, 'MMM');
    }

    return (
      locale.formatDate(startWeek, 'MMM') +
      '-' +
      locale.formatDate(endOfWeekDate, 'MMM')
    );
  };

  const belowButtonPadding = '4px 15px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', maxHeight: '25px' }}>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 500,
          marginBottom: 0,
          marginRight: '10px',
          padding: belowButtonPadding,
        }}
      >
        {getMonthName()}
      </div>
      <Tag>Week {getWeek(startWeek, { weekStartsOn })}</Tag>
    </div>
  );
};

export const CalendarHeader: React.FunctionComponent<CalendarHeaderProps> = ({
  startWeek,
  setStartWeek,
  weekStartsOn = 1,
  usaCalendar = false,
  filterComponent,
}) => {
  return (
    <>
      <Row
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ alignSelf: 'center' }}>
          <MonthName
            startWeek={startWeek}
            weekStartsOn={weekStartsOn}
            usaCalendar={usaCalendar}
          />
        </div>
      </Row>

      <Row
        justify="space-between"
        style={{
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <Col
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Button
            onClick={() =>
              setStartWeek(startOfWeek(new Date(), { weekStartsOn }))
            }
          >
            Aujourd'hui
          </Button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => setStartWeek(addWeeks(startWeek, -1))}>
              <LeftOutlined />
            </Button>
            <Button onClick={() => setStartWeek(addWeeks(startWeek, 1))}>
              <RightOutlined />
            </Button>
          </div>
        </Col>

        <Col
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {filterComponent && filterComponent}
          <DatePicker
            onChange={(date) => {
              if (date) {
                setStartWeek(startOfWeek(new Date(date), { weekStartsOn }));
              }
            }}
            picker="week"
            defaultValue={startOfWeek(new Date(), { weekStartsOn })}
            style={{ minWidth: '150px' }}
          />
        </Col>
      </Row>
    </>
  );
};
