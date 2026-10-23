import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tag } from 'antd';
import { addWeeks, getWeek, startOfWeek } from 'date-fns';
import type { CSSProperties, ReactNode } from 'react';

import { DatePicker } from './DatePicker';
import { getLocaleFormatter } from './localeConfig';
import type { WeekStartsOn } from './types';
import { getWeekMonthLabel } from './utils';

const GAP = '10px';
const MARGIN_BOTTOM = '20px';

const MONTH_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: MARGIN_BOTTOM,
  flexWrap: 'wrap',
  gap: GAP,
};
const NAVIGATION_ROW_STYLE: CSSProperties = {
  marginBottom: MARGIN_BOTTOM,
  flexWrap: 'wrap',
  gap: GAP,
};
const NAVIGATION_COL_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: GAP,
};
const ARROWS_STYLE: CSSProperties = { display: 'flex', gap: GAP };
const FILTERS_COL_STYLE: CSSProperties = {
  display: 'flex',
  gap: GAP,
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
};
const DATE_PICKER_STYLE: CSSProperties = { minWidth: '150px' };
const MONTH_NAME_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  maxHeight: '25px',
};
const MONTH_LABEL_STYLE: CSSProperties = {
  fontSize: '16px',
  fontWeight: 500,
  marginBottom: 0,
  marginRight: GAP,
  padding: '4px 15px',
};

export interface CalendarHeaderProps {
  startWeek: Date;
  setStartWeek: (startWeek: Date) => void;
  weekStartsOn?: WeekStartsOn;
  usaCalendar?: boolean;
  filterComponent?: ReactNode;
}

/**
 * En-tête du calendrier : mois et numéro de la semaine affichée, navigation
 * (semaine courante, précédente, suivante, choix d'une semaine) et filtres
 * fournis par le parent.
 */
export function CalendarHeader({
  startWeek,
  setStartWeek,
  weekStartsOn = 1,
  usaCalendar = false,
  filterComponent,
}: Readonly<CalendarHeaderProps>) {
  const getCurrentWeek = () => startOfWeek(new Date(), { weekStartsOn });

  return (
    <>
      <Row style={MONTH_ROW_STYLE}>
        <div style={{ alignSelf: 'center' }}>
          <MonthName
            startWeek={startWeek}
            weekStartsOn={weekStartsOn}
            usaCalendar={usaCalendar}
          />
        </div>
      </Row>

      <Row justify="space-between" style={NAVIGATION_ROW_STYLE}>
        <Col style={NAVIGATION_COL_STYLE}>
          <Button onClick={() => setStartWeek(getCurrentWeek())}>
            Aujourd'hui
          </Button>
          <div style={ARROWS_STYLE}>
            <Button onClick={() => setStartWeek(addWeeks(startWeek, -1))}>
              <LeftOutlined />
            </Button>
            <Button onClick={() => setStartWeek(addWeeks(startWeek, 1))}>
              <RightOutlined />
            </Button>
          </div>
        </Col>

        <Col style={FILTERS_COL_STYLE}>
          {filterComponent}
          <DatePicker
            onChange={(date) => {
              if (date) {
                setStartWeek(startOfWeek(new Date(date), { weekStartsOn }));
              }
            }}
            picker="week"
            defaultValue={getCurrentWeek()}
            style={DATE_PICKER_STYLE}
          />
        </Col>
      </Row>
    </>
  );
}

interface MonthNameProps {
  startWeek: Date;
  weekStartsOn: WeekStartsOn;
  usaCalendar: boolean;
}

function MonthName({
  startWeek,
  weekStartsOn,
  usaCalendar,
}: Readonly<MonthNameProps>) {
  const locale = getLocaleFormatter(usaCalendar);

  return (
    <div style={MONTH_NAME_STYLE}>
      <div style={MONTH_LABEL_STYLE}>
        {getWeekMonthLabel(startWeek, weekStartsOn, locale)}
      </div>
      <Tag>Semaine {getWeek(startWeek, { weekStartsOn })}</Tag>
    </div>
  );
}
