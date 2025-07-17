import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import CalendarBody from '../CalendarBody';
import { CalendarBodyProps, GenericEvent, WeekObject } from '../types';
// import userEvent from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Setup for the tests
beforeAll(() => {
  // Mock matchMedia
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Optional: Mock scrollIntoView if your tests trigger this function
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Calendar Component', () => {
  const mockWeekDates = {
    startDate: new Date('2023-01-01T00:00:00Z'), // This is a Sunday
    endDate: new Date('2023-01-07T23:59:59Z'),
  };

  const mockEvents: GenericEvent[] = [
    {
      eventId: '1',
      startTime: new Date('2023-01-02T10:00:00Z'),
      endTime: new Date('2023-01-02T11:00:00Z'),
      title: 'Test Event 1',
    },
    {
      eventId: '2',
      startTime: new Date('2023-01-03T14:00:00Z'),
      endTime: new Date('2023-01-03T15:00:00Z'),
      title: 'Test Event 2',
    },
  ];

  const mockGetDayEvents: WeekObject<GenericEvent> = {
    sunday: [],
    monday: [mockEvents[0]],
    tuesday: [mockEvents[1]],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  const defaultProps: CalendarBodyProps<GenericEvent> = {
    weekDatesRange: mockWeekDates,
    getDayEvents: mockGetDayEvents,
    onEventClick: vi.fn(),
    weekends: false,
    headerSticky: false,
  };

  it('renders without errors', () => {
    const { getByRole } = render(<CalendarBody {...defaultProps} />);
    expect(getByRole('table')).toBeInTheDocument();
  });

  it('renders correct date labels', () => {
    const { getByText } = render(
      <CalendarBody {...defaultProps} weekends={true} usaCalendar={true} />
    );
    const expectedLabels = [
      'Hours',
      'Sun 01',
      'Mon 02',
      'Tue 03',
      'Wed 04',
      'Thu 05',
      'Fri 06',
      'Sat 07',
    ];
    expectedLabels.forEach((label) => {
      expect(getByText(label)).toBeInTheDocument();
    });
  });
  // // currenly this is test is not catching the error
  it('renders events when provided', () => {
    const { container } = render(<CalendarBody {...defaultProps} />);
    // Use a more flexible approach to find the events
    expect(container).toHaveTextContent('Test Event 1');
    expect(container).toHaveTextContent('Test Event 2');
  });

  it('renders events when provided', () => {
    const { container } = render(<CalendarBody {...defaultProps} />);

    // Check that the events are rendered using container text content
    expect(container).toHaveTextContent('Test Event 1');
    expect(container).toHaveTextContent('Test Event 2');

    // Negative test: Ensure the event elements are not absent
    expect(container).not.toHaveTextContent('Nonexistent Event');
  });

  it('calls onEventClick when an event is clicked', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();

    const { container } = render(
      <CalendarBody {...defaultProps} onEventClick={onEventClick} />
    );

    // Find the event using a more flexible approach
    const eventElement = container.querySelector(
      'div[style*="position: absolute"]'
    );
    expect(eventElement).not.toBeNull();

    // Since we have only one event per column in our test data,
    // it should trigger onEventClick with just one click
    if (eventElement) {
      await user.click(eventElement);
    }

    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });
});
