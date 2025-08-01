export interface GenericEvent {
  eventId: string;
  startTime: Date;
  endTime: Date;
  title?: string | undefined | null;
  location?: string | undefined | null;
  textColor?: string | undefined;
  backgroundColor?: string | undefined;
  originalStartTime?: Date; // For multi-day events, stores original start time
  originalEndTime?: Date; // For multi-day events, stores original end time
}

export interface FilterOption {
  label: string;
  value: string | number;
  emoji?: string;
  desc?: string;
  [key: string]: any;
}

export interface FilterComponentProps {
  options: FilterOption[];
  selectedValues?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  defaultValue?: (string | number)[];
}

export interface BaseCalendarProps<T extends GenericEvent = GenericEvent> {
  onEventClick?: (e: T) => any | undefined;
  onSelectDate?: (e: Date) => any | undefined;
  weekends: boolean;
  eventTextColor?: string;
  eventBackgroundColor?: string;
  headerSticky?: boolean;
  usaCalendar?: boolean;
}

export interface CalendarContainerProps<T extends GenericEvent = GenericEvent>
  extends BaseCalendarProps<T> {
  events: T[];
  /**
   * @deprecated Use `currentDate` instead.
   */
  value?: Date;

  currentDate?: Date;
  filterComponent?: React.ReactNode;
  filteredEventIds?: (string | number)[];
}

export interface CalendarBodyProps<T extends GenericEvent = GenericEvent>
  extends BaseCalendarProps<T> {
  weekDatesRange: WeekDateRange;
  getDayEvents?: WeekObject<T>;
}

export type WeekObject<T> = {
  sunday: T[];
  monday: T[];
  tuesday: T[];
  wednesday: T[];
  thursday: T[];
  friday: T[];
  saturday: T[];
};

export interface EventBlockProps<T> {
  event: T;
  index: number;
  hour: Date;
  events: number;
  onEventClick?: (e: T) => any | undefined;
  usaCalendar?: boolean;
}

export type ColumnNode<T> = T[] | string;

export type EventsObject<T> = {
  id: number;
  hourObject: Date;
  hour: string;
  Monday: T[] | undefined;
  Tuesday: T[] | undefined;
  Wednesday: T[] | undefined;
  Thursday: T[] | undefined;
  Friday: T[] | undefined;
  Saturday: T[] | undefined;
  Sunday: T[] | undefined;
};

export interface WeekDateRange {
  startDate: Date;
  endDate: Date;
}

export type DayName =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface CalendarHeaderProps {
  startWeek: Date;
  setStartWeek: React.Dispatch<React.SetStateAction<Date>>;
  weekStartsOn?: 0 | 1;
  usaCalendar?: boolean;
  filterComponent?: React.ReactNode;
}
