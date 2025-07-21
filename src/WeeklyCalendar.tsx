import { Card } from 'antd';
import { endOfWeek, startOfWeek } from 'date-fns';
import React, { useEffect, useState } from 'react';

import Calendar from './components/CalendarBody';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarContainerProps, GenericEvent } from './components/types';
import { daysToWeekObject } from './components/utils';

export function WeeklyCalendar<T extends GenericEvent>({
  events,
  onEventClick,
  onSelectDate,
  weekends = false,
  currentDate,
  headerSticky = false,
  usaCalendar = false,
  value,
}: CalendarContainerProps<T>) {
  const dateToUse = currentDate || value;
  const weekStartsOn = usaCalendar ? 0 : 1; // USA: Sunday (0), Europe: Monday (1)

  const [startWeek, setStartWeek] = useState(
    startOfWeek(dateToUse || new Date(), { weekStartsOn })
  );
  const weekPeriod = {
    startDate: startWeek,
    endDate: endOfWeek(startWeek, { weekStartsOn }),
  };

  useEffect(() => {
    if (
      dateToUse &&
      startOfWeek(dateToUse, { weekStartsOn }).getTime() !== startWeek.getTime()
    ) {
      setStartWeek(startOfWeek(dateToUse, { weekStartsOn }));
    }
  }, [dateToUse, weekStartsOn]);

  useEffect(() => {
    onSelectDate && onSelectDate(startWeek);
  }, [startWeek]);

  const weekObject = daysToWeekObject(events, startWeek, weekStartsOn);

  return (
    <Card>
      <CalendarHeader
        startWeek={startWeek}
        setStartWeek={setStartWeek}
        weekStartsOn={weekStartsOn}
      />
      <Calendar
        weekDatesRange={weekPeriod}
        getDayEvents={weekObject}
        onEventClick={onEventClick as (e: GenericEvent) => any}
        weekends={weekends}
        headerSticky={headerSticky}
        usaCalendar={usaCalendar}
      />
    </Card>
  );
}
