import { Card } from 'antd';
import { endOfWeek } from 'date-fns';

import { CalendarBody } from './components/CalendarBody';
import { CalendarHeader } from './components/CalendarHeader';
import type {
  CalendarContainerProps,
  GenericEvent,
  WeekStartsOn,
} from './components/types';
import { useCurrentWeek } from './components/useCurrentWeek';
import { daysToWeekObject } from './components/utils';

interface LegacyDateProps {
  value?: Date;
}

/** Date de l'ancienne prop `value`, lue via un type qui n'est pas déprécié. */
const getLegacyDate = ({ value }: LegacyDateProps): Date | undefined => value;

/**
 * Calendrier hebdomadaire : en-tête de navigation et grille horaire des
 * évènements de la semaine affichée.
 */
export function WeeklyCalendar<T extends GenericEvent>(
  props: Readonly<CalendarContainerProps<T>>
) {
  const {
    events,
    onEventClick,
    onSelectDate,
    weekends = false,
    currentDate,
    headerSticky = false,
    usaCalendar = false,
    filterComponent,
    filteredEventIds,
  } = props;
  const weekStartsOn: WeekStartsOn = usaCalendar ? 0 : 1;
  const { startWeek, setStartWeek } = useCurrentWeek({
    date: currentDate ?? getLegacyDate(props),
    weekStartsOn,
    onWeekChange: onSelectDate,
  });

  const filteredEvents = filteredEventIds?.length
    ? events.filter((event) => filteredEventIds.includes(event.eventId))
    : events;

  return (
    <Card>
      <CalendarHeader
        startWeek={startWeek}
        setStartWeek={setStartWeek}
        weekStartsOn={weekStartsOn}
        usaCalendar={usaCalendar}
        filterComponent={filterComponent}
      />
      <CalendarBody
        weekDatesRange={{
          startDate: startWeek,
          endDate: endOfWeek(startWeek, { weekStartsOn }),
        }}
        getDayEvents={daysToWeekObject(filteredEvents, startWeek, weekStartsOn)}
        onEventClick={onEventClick}
        weekends={weekends}
        headerSticky={headerSticky}
        usaCalendar={usaCalendar}
      />
    </Card>
  );
}
