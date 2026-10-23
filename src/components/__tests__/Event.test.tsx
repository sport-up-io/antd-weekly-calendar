import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EventBlock } from '../Event';
import type { GenericEvent } from '../types';
import { EXPANSION_DURATION_MS } from '../useEventExpansion';

const sundayNine = new Date(2024, 7, 18, 9);
const event: GenericEvent = {
  eventId: '1',
  title: 'Match',
  startTime: sundayNine,
  endTime: new Date(2024, 7, 18, 10),
};

const renderEvent = (props: {
  events?: number;
  index?: number;
  onEventClick?: (event: GenericEvent) => void;
  calendarEvent?: GenericEvent;
}) =>
  render(
    <EventBlock
      event={props.calendarEvent ?? event}
      index={props.index ?? 0}
      hour={sundayNine}
      events={props.events ?? 1}
      onEventClick={props.onEventClick}
      usaCalendar
    />
  );

const getEventBox = () => screen.getByRole('button');

describe('EventBlock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the title and the times with the default color', () => {
    renderEvent({});

    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(getEventBox()).toHaveTextContent('09:00 - 10:00');
    expect(getEventBox()).toHaveStyle({
      backgroundColor: '#36CFC9',
      top: '0%',
      height: '100%',
    });
  });

  it('shows the original times and the color of a split event', () => {
    renderEvent({
      calendarEvent: {
        ...event,
        backgroundColor: 'red',
        originalStartTime: new Date(2024, 7, 17, 22),
        originalEndTime: new Date(2024, 7, 19, 8),
      },
    });

    expect(getEventBox()).toHaveTextContent('22:00 - 08:00');
    expect(getEventBox().style.backgroundColor).toBe('red');
  });

  it('centers the content of a small event', () => {
    renderEvent({
      calendarEvent: {
        ...event,
        startTime: new Date(2024, 7, 18, 23, 50),
        endTime: new Date(2024, 7, 18, 23, 59),
      },
    });

    expect(screen.getByText('Match').parentElement).toHaveStyle({
      textAlign: 'center',
    });
  });

  it('calls onEventClick at once when alone in its cell', () => {
    const onEventClick = vi.fn();
    renderEvent({ onEventClick });

    fireEvent.click(getEventBox());

    expect(onEventClick).toHaveBeenCalledWith(event);
  });

  it('ignores clicks without onEventClick', () => {
    renderEvent({});

    expect(() => fireEvent.click(getEventBox())).not.toThrow();
  });

  it('expands on first click then calls onEventClick when shared', () => {
    const onEventClick = vi.fn();
    renderEvent({ onEventClick, events: 2, index: 1 });
    expect(getEventBox()).toHaveStyle({ left: '26%', width: '67%' });

    fireEvent.click(getEventBox());

    expect(onEventClick).not.toHaveBeenCalled();
    expect(getEventBox()).toHaveStyle({
      left: '0%',
      width: '93%',
      zIndex: '2',
    });

    fireEvent.click(getEventBox());

    expect(onEventClick).toHaveBeenCalledWith(event);
  });

  it('is a native button reachable with the keyboard', () => {
    renderEvent({});

    expect(getEventBox()).toHaveAttribute('type', 'button');
  });

  it('collapses on a click outside but not inside', () => {
    renderEvent({ events: 2 });
    fireEvent.click(getEventBox());

    fireEvent.mouseDown(getEventBox());
    expect(getEventBox()).toHaveStyle({ width: '93%' });

    fireEvent.mouseDown(document.body);
    expect(getEventBox()).toHaveStyle({ width: '93%', zIndex: '1' });
  });

  it('collapses after a delay', () => {
    vi.useFakeTimers();
    renderEvent({ events: 2, index: 1 });
    fireEvent.click(getEventBox());

    act(() => {
      vi.advanceTimersByTime(EXPANSION_DURATION_MS);
    });

    expect(getEventBox()).toHaveStyle({ width: '67%' });
  });

  it('blocks the context menu', () => {
    renderEvent({});

    expect(fireEvent.contextMenu(getEventBox())).toBe(false);
  });
});
