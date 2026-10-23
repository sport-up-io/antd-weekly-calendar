import { fireEvent, render, screen } from '@testing-library/react';
import { startOfWeek } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { CalendarHeader } from '../CalendarHeader';

vi.mock('../DatePicker', () => ({
  DatePicker: ({
    onChange,
  }: {
    onChange: (date: Date | null) => void;
  }) => (
    <>
      <button type="button" onClick={() => onChange(null)}>
        clear
      </button>
      <button type="button" onClick={() => onChange(new Date(2024, 9, 10))}>
        pick
      </button>
    </>
  ),
}));

const startWeek = new Date(2024, 7, 19);

const renderHeader = (setStartWeek = vi.fn()) => {
  render(
    <CalendarHeader
      startWeek={startWeek}
      setStartWeek={setStartWeek}
      filterComponent={<span>filters</span>}
    />
  );
  return setStartWeek;
};

describe('CalendarHeader', () => {
  it('shows the month, the week number and the filters', () => {
    renderHeader();

    expect(screen.getByText('août')).toBeInTheDocument();
    expect(screen.getByText('Semaine 34')).toBeInTheDocument();
    expect(screen.getByText('filters')).toBeInTheDocument();
  });

  it('shows both months of an overlapping USA week', () => {
    render(
      <CalendarHeader
        startWeek={new Date(2024, 8, 29)}
        setStartWeek={vi.fn()}
        weekStartsOn={0}
        usaCalendar
      />
    );

    expect(screen.getByText('Sep-Oct')).toBeInTheDocument();
  });

  it('goes back to the current week', () => {
    const setStartWeek = renderHeader();

    fireEvent.click(screen.getByText("Aujourd'hui"));

    expect(setStartWeek).toHaveBeenCalledWith(
      startOfWeek(new Date(), { weekStartsOn: 1 })
    );
  });

  it('goes to the previous and the next week', () => {
    const setStartWeek = renderHeader();
    const [, previous, next] = screen.getAllByRole('button');

    fireEvent.click(previous);
    fireEvent.click(next);

    expect(setStartWeek).toHaveBeenNthCalledWith(1, new Date(2024, 7, 12));
    expect(setStartWeek).toHaveBeenNthCalledWith(2, new Date(2024, 7, 26));
  });

  it('goes to the week picked in the date picker', () => {
    const setStartWeek = renderHeader();

    fireEvent.click(screen.getByText('clear'));
    expect(setStartWeek).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('pick'));
    expect(setStartWeek).toHaveBeenCalledWith(new Date(2024, 9, 7));
  });
});
