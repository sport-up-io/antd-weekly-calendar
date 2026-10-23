import { fireEvent, render, screen } from '@testing-library/react';
import { addWeeks, startOfWeek } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { WeeklyCalendar } from '../index';
import type { GenericEvent } from '../index';

const events: GenericEvent[] = [
  {
    eventId: 'tennis',
    title: 'Tennis',
    startTime: new Date(2024, 7, 20, 10),
    endTime: new Date(2024, 7, 20, 11),
  },
  {
    eventId: 'padel',
    title: 'Padel',
    startTime: new Date(2024, 7, 21, 18),
    endTime: new Date(2024, 7, 21, 19),
  },
];
const currentDate = new Date(2024, 7, 21);
const mondayStartWeek = new Date(2024, 7, 19);

describe('WeeklyCalendar', () => {
  it('shows the events of the week of the current date', () => {
    const onSelectDate = vi.fn();
    render(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
      />
    );

    expect(screen.getByText('Tennis')).toBeInTheDocument();
    expect(screen.getByText('Padel')).toBeInTheDocument();
    expect(onSelectDate).toHaveBeenCalledWith(mondayStartWeek);
  });

  it('starts on the current week without date', () => {
    const onSelectDate = vi.fn();
    render(<WeeklyCalendar events={[]} onSelectDate={onSelectDate} />);

    expect(onSelectDate).toHaveBeenCalledWith(
      startOfWeek(new Date(), { weekStartsOn: 1 })
    );
  });

  it('supports the deprecated value prop', () => {
    const legacyProps = { value: currentDate };
    render(<WeeklyCalendar events={events} {...legacyProps} />);

    expect(screen.getByText('Tennis')).toBeInTheDocument();
  });

  it('shows only the filtered events', () => {
    render(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        filteredEventIds={['padel']}
      />
    );

    expect(screen.queryByText('Tennis')).not.toBeInTheDocument();
    expect(screen.getByText('Padel')).toBeInTheDocument();
  });

  it('notifies the week chosen in the header', () => {
    const onSelectDate = vi.fn();
    render(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
      />
    );
    const [, , next] = screen.getAllByRole('button');

    fireEvent.click(next);

    expect(onSelectDate).toHaveBeenLastCalledWith(
      addWeeks(mondayStartWeek, 1)
    );
    expect(screen.queryByText('Tennis')).not.toBeInTheDocument();
  });

  it('follows a new current date given by the parent', () => {
    const onSelectDate = vi.fn();
    const { rerender } = render(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
      />
    );

    rerender(
      <WeeklyCalendar
        events={events}
        currentDate={new Date(2024, 7, 23)}
        onSelectDate={onSelectDate}
      />
    );
    expect(onSelectDate).toHaveBeenCalledTimes(1);

    rerender(
      <WeeklyCalendar
        events={events}
        currentDate={new Date(2024, 8, 4)}
        onSelectDate={onSelectDate}
      />
    );
    expect(onSelectDate).toHaveBeenLastCalledWith(new Date(2024, 8, 2));
  });

  it('starts the week on sunday for the USA calendar', () => {
    const onSelectDate = vi.fn();
    const { rerender } = render(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
      />
    );

    rerender(
      <WeeklyCalendar
        events={events}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
        usaCalendar
        weekends
      />
    );

    expect(onSelectDate).toHaveBeenLastCalledWith(new Date(2024, 7, 18));
    expect(screen.getByText('Sun 18')).toBeInTheDocument();
  });
});
