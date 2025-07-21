import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tag } from 'antd';
import {
  addWeeks,
  endOfWeek,
  format,
  getMonth,
  getWeek,
  startOfWeek,
} from 'date-fns';
import React from 'react';

import DatePicker from './DatePicker';

import { CalendarHeaderProps } from './types';

interface MonthNameProps {
  startWeek: Date;
  weekStartsOn?: 0 | 1;
}

const MonthName: React.FunctionComponent<MonthNameProps> = ({
  startWeek,
  weekStartsOn = 1,
}) => {
  const getMonthName = () => {
    const endOfWeekDate = endOfWeek(startWeek, { weekStartsOn });

    if (getMonth(endOfWeekDate) == getMonth(startWeek)) {
      return format(startWeek, 'MMM');
    }

    return format(startWeek, 'MMM') + '-' + format(endOfWeekDate, 'MMM');
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
}) => {
  return (
    <>
      <Row
        style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}
      >
        <div style={{ alignSelf: 'center' }}>
          <MonthName startWeek={startWeek} weekStartsOn={weekStartsOn} />
        </div>
      </Row>
      <Row justify="space-between" style={{ marginBottom: '20px' }}>
        <Col
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', marginRight: '20px' }}>
            <Button
              onClick={() =>
                setStartWeek(startOfWeek(new Date(), { weekStartsOn }))
              }
            >
              Today
            </Button>
            <div style={{ display: 'flex', padding: '0 10px' }}>
              <Button
                style={{ margin: '0 5px' }}
                onClick={() => setStartWeek(addWeeks(startWeek, -1))}
              >
                <LeftOutlined />
              </Button>
              <Button
                style={{ margin: '0 5px' }}
                onClick={() => setStartWeek(addWeeks(startWeek, 1))}
              >
                <RightOutlined />
              </Button>
            </div>
          </div>
        </Col>
        <Col>
          <DatePicker
            onChange={(date) => {
              if (date) {
                setStartWeek(startOfWeek(new Date(date), { weekStartsOn }));
              }
            }}
            picker="week"
            defaultValue={startOfWeek(new Date(), { weekStartsOn })}
          />
        </Col>
      </Row>
    </>
  );
};
