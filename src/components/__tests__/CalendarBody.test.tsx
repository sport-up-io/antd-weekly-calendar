import { fireEvent, render, screen } from '@testing-library/react';
import { startOfWeek } from 'date-fns';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CalendarBody } from '../CalendarBody';
import type { GenericEvent, WeekObject } from '../types';

const weekDatesRange = {
  startDate: new Date(2023, 0, 1),
  endDate: new Date(2023, 0, 7),
};

const mondayEvent: GenericEvent = {
  eventId: '1',
  startTime: new Date(2023, 0, 2, 10),
  endTime: new Date(2023, 0, 2, 11),
  title: 'Test Event 1',
};
const tuesdayEvent: GenericEvent = {
  eventId: '2',
  startTime: new Date(2023, 0, 3, 14),
  endTime: new Date(2023, 0, 3, 15),
  title: 'Test Event 2',
};

const weekObject: WeekObject<GenericEvent> = {
  sunday: [],
  monday: [mondayEvent],
  tuesday: [tuesdayEvent],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
};

describe('CalendarBody', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hour column and the working days by default', () => {
    render(
      <CalendarBody
        weekDatesRange={{
          startDate: new Date(2023, 0, 2),
          endDate: new Date(2023, 0, 8),
        }}
        getDayEvents={weekObject}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('lun. 02')).toBeInTheDocument();
    expect(screen.getByText('ven. 06')).toBeInTheDocument();
    expect(screen.queryByText('dim. 08')).not.toBeInTheDocument();
  });

  it('renders the whole USA week', () => {
    render(
      <CalendarBody
        weekDatesRange={weekDatesRange}
        getDayEvents={weekObject}
        weekends
        usaCalendar
      />
    );

    for (const label of ['Sun 01', 'Mon 02', 'Wed 04', 'Sat 07']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders the events and calls onEventClick', () => {
    const onEventClick = vi.fn();
    render(
      <CalendarBody
        weekDatesRange={weekDatesRange}
        getDayEvents={weekObject}
        onEventClick={onEventClick}
        usaCalendar
      />
    );

    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Test Event 1'));

    expect(onEventClick).toHaveBeenCalledWith(mondayEvent);
  });

  it('makes the header sticky when asked', () => {
    const { container } = render(
      <CalendarBody weekDatesRange={weekDatesRange} headerSticky />
    );

    expect(container.querySelector('style')).toHaveTextContent(
      'position: sticky'
    );
  });

  it('highlights the current hour', () => {
    const today = startOfWeek(new Date());
    const { container } = render(
      <CalendarBody
        weekDatesRange={{ startDate: today, endDate: today }}
        usaCalendar
      />
    );

    const highlightedRows = [
      ...container.querySelectorAll<HTMLElement>('tbody tr'),
    ].filter((row) => row.style.boxShadow !== '');
    expect(highlightedRows).toHaveLength(1);
  });

  it('scrolls to the morning on mount', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });

    render(<CalendarBody weekDatesRange={weekDatesRange} />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
  });

  it('adapts the sizes to extra small screens', () => {
    vi.spyOn(globalThis, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('max-width: 575'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<CalendarBody weekDatesRange={weekDatesRange} />);

    expect(screen.getByText('Hours')).toHaveStyle({ fontSize: '14px' });
  });
});
