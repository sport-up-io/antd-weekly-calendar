import { describe, expect, it } from 'vitest';

import { getLocaleFormatter } from '../localeConfig';
import type { GenericEvent, WeekObject } from '../types';
import {
  calculateScrollOffset,
  daysToWeekObject,
  getDayHoursEvents,
  getEventBoxLayout,
  getWeekMonthLabel,
  isCurrentHour,
  MIN_BOX_SIZE,
  sizeEventBox,
} from '../utils';

const createEvent = (
  eventId: string,
  startTime: Date,
  endTime: Date
): GenericEvent => ({ eventId, startTime, endTime, title: `Event ${eventId}` });

const createWeekObject = (
  days: Partial<WeekObject<GenericEvent>>
): WeekObject<GenericEvent> => ({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  ...days,
});

describe('daysToWeekObject', () => {
  const sundayStartWeek = new Date(2024, 7, 18);

  it('places single-day events on their day', () => {
    const wednesday = createEvent(
      '1',
      new Date(2024, 7, 21, 9),
      new Date(2024, 7, 21, 10)
    );
    const thursday = createEvent(
      '2',
      new Date(2024, 7, 22, 11),
      new Date(2024, 7, 22, 12)
    );

    const result = daysToWeekObject([wednesday, thursday], sundayStartWeek, 0);

    expect(result.wednesday).toEqual([wednesday]);
    expect(result.thursday).toEqual([thursday]);
    expect(result.monday).toHaveLength(0);
  });

  it('keeps several events of the same day in order', () => {
    const events = [9, 11, 13].map((hour) =>
      createEvent(
        `${hour}`,
        new Date(2024, 7, 22, hour),
        new Date(2024, 7, 22, hour + 1)
      )
    );

    const result = daysToWeekObject(events, sundayStartWeek, 0);

    expect(result.thursday).toEqual(events);
  });

  it('ignores events that start outside of the week', () => {
    const events = [
      createEvent('1', new Date(2024, 7, 25, 8), new Date(2024, 7, 25, 9)),
      createEvent('2', new Date(2024, 7, 26, 9), new Date(2024, 7, 26, 10)),
    ];

    const result = daysToWeekObject(events, sundayStartWeek, 0);

    expect(result).toEqual(createWeekObject({}));
  });

  it('splits a multi-day event into one part per day', () => {
    const event = createEvent(
      '1',
      new Date(2024, 7, 21, 9),
      new Date(2024, 7, 23, 10)
    );

    const result = daysToWeekObject([event], sundayStartWeek, 0);

    expect(result.wednesday).toEqual([
      {
        ...event,
        originalStartTime: event.startTime,
        originalEndTime: event.endTime,
        endTime: new Date(2024, 7, 21, 23, 59, 59, 999),
      },
    ]);
    expect(result.thursday[0]).toMatchObject({
      startTime: new Date(2024, 7, 22),
      endTime: new Date(2024, 7, 22, 23, 59, 59, 999),
    });
    expect(result.friday[0]).toMatchObject({
      startTime: new Date(2024, 7, 23),
      endTime: event.endTime,
      originalStartTime: event.startTime,
    });
  });

  it('drops the parts of a multi-day event that overflow the week', () => {
    const event = createEvent(
      '1',
      new Date(2024, 7, 24, 20),
      new Date(2024, 7, 25, 2)
    );

    const result = daysToWeekObject([event], sundayStartWeek, 0);

    expect(result.saturday).toHaveLength(1);
    expect(result.sunday).toHaveLength(0);
  });

  it('starts weeks on monday by default', () => {
    const sunday = createEvent(
      '1',
      new Date(2024, 7, 25, 9),
      new Date(2024, 7, 25, 10)
    );

    const result = daysToWeekObject([sunday], new Date(2024, 7, 19));

    expect(result.sunday).toEqual([sunday]);
  });
});

describe('getDayHoursEvents', () => {
  const event = createEvent(
    '1',
    new Date(2024, 7, 21, 9, 30),
    new Date(2024, 7, 21, 10)
  );
  const weekObject = createWeekObject({ wednesday: [event] });

  it('creates one row per hour with the french hour format', () => {
    const rows = getDayHoursEvents({
      weekRange: {
        startDate: new Date(2024, 7, 19),
        endDate: new Date(2024, 7, 25),
      },
      weekObject,
    });

    expect(rows).toHaveLength(24);
    expect(rows[9]).toMatchObject({ id: 9, hour: '09:00' });
    expect(rows[9].hourObject).toEqual(new Date(2024, 7, 19, 9));
    expect(rows[9].Wednesday).toEqual([event]);
    expect(rows[8].Wednesday).toEqual([]);
    expect(rows[9].Sunday).toEqual([]);
  });

  it('uses the USA hour format and skips weekends when asked', () => {
    const rows = getDayHoursEvents({
      weekRange: {
        startDate: new Date(2024, 7, 18),
        endDate: new Date(2024, 7, 24),
      },
      weekObject,
      usaCalendar: true,
      includeWeekends: false,
    });

    expect(rows[9].hour).toBe('09 AM');
    expect(rows[9].Wednesday).toEqual([event]);
    expect(rows[9]).not.toHaveProperty('Sunday');
    expect(rows[9]).not.toHaveProperty('Saturday');
  });

  it('leaves days empty without week object', () => {
    const rows = getDayHoursEvents({
      weekRange: {
        startDate: new Date(2024, 7, 19),
        endDate: new Date(2024, 7, 25),
      },
    });

    expect(rows[0].Monday).toBeUndefined();
  });
});

describe('sizeEventBox', () => {
  const cellHour = new Date(2024, 7, 21, 9);

  it('fills the cell with a one hour event', () => {
    const event = createEvent('1', cellHour, new Date(2024, 7, 21, 10));

    expect(sizeEventBox(event, cellHour)).toEqual({
      boxPosition: 0,
      boxSize: 100,
    });
  });

  it('never goes below the minimal size', () => {
    const event = createEvent('1', cellHour, new Date(2024, 7, 21, 9, 15));

    expect(sizeEventBox(event, cellHour).boxSize).toBe(MIN_BOX_SIZE);
  });

  it('offsets an event that starts during the hour', () => {
    const event = createEvent(
      '1',
      new Date(2024, 7, 21, 9, 30),
      new Date(2024, 7, 21, 10, 30)
    );

    expect(sizeEventBox(event, cellHour).boxPosition).toBeCloseTo(50);
  });

  it('sticks to the top an event started long before the hour', () => {
    const event = createEvent(
      '1',
      new Date(2024, 7, 21, 7),
      new Date(2024, 7, 21, 10)
    );

    expect(sizeEventBox(event, cellHour).boxPosition).toBe(0);
  });

  describe('after 23:00', () => {
    const lateHour = new Date(2024, 7, 21, 23);

    it('keeps an event that fits in the cell', () => {
      const event = createEvent(
        '1',
        lateHour,
        new Date(2024, 7, 21, 23, 30)
      );

      expect(sizeEventBox(event, lateHour)).toEqual({
        boxPosition: 0,
        boxSize: 50,
      });
    });

    it('shrinks an overflowing event to the remaining space', () => {
      const event = createEvent(
        '1',
        new Date(2024, 7, 21, 23, 30),
        new Date(2024, 7, 22, 0, 30)
      );

      const box = sizeEventBox(event, lateHour);

      expect(box.boxPosition).toBeCloseTo(50);
      expect(box.boxSize).toBeCloseTo(50);
    });

    it('moves up an event with too little remaining space', () => {
      const event = createEvent(
        '1',
        new Date(2024, 7, 21, 23, 50),
        new Date(2024, 7, 22, 0, 50)
      );

      expect(sizeEventBox(event, lateHour)).toEqual({
        boxPosition: 75,
        boxSize: 25,
      });
    });
  });
});

describe('getEventBoxLayout', () => {
  it('uses the whole width when expanded', () => {
    expect(
      getEventBoxLayout({ index: 2, eventCount: 3, isExpanded: true })
    ).toEqual({ left: 0, width: 93 });
  });

  it('stacks up to three events', () => {
    expect(
      getEventBoxLayout({ index: 1, eventCount: 2, isExpanded: false })
    ).toEqual({ left: 26, width: 67 });
  });

  it('shares the width from four events', () => {
    expect(
      getEventBoxLayout({ index: 2, eventCount: 4, isExpanded: false })
    ).toEqual({ left: 46.5, width: 46.5 });
  });
});

describe('getWeekMonthLabel', () => {
  const locale = getLocaleFormatter(true);

  it('shows one month when the week stays in it', () => {
    expect(getWeekMonthLabel(new Date(2024, 7, 5), 1, locale)).toBe('Aug');
  });

  it('shows both months when the week overlaps them', () => {
    expect(getWeekMonthLabel(new Date(2024, 7, 26), 1, locale)).toBe(
      'Aug-Sep'
    );
  });
});

describe('calculateScrollOffset', () => {
  const createElementAt = (top: number): HTMLElement => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => DOMRect.fromRect({ y: top });
    return element;
  };

  it('returns the distance between the container and the row', () => {
    expect(
      calculateScrollOffset(createElementAt(100), createElementAt(340))
    ).toBe(240);
  });
});

describe('isCurrentHour', () => {
  const now = new Date(2024, 7, 21, 9, 45);

  it('is false without hour', () => {
    expect(isCurrentHour(undefined, now)).toBe(false);
  });

  it('is true for the same hour of the same week', () => {
    expect(isCurrentHour(new Date(2024, 7, 19, 9), now)).toBe(true);
  });

  it('is false for another hour', () => {
    expect(isCurrentHour(new Date(2024, 7, 21, 10), now)).toBe(false);
  });

  it('is false for another week', () => {
    expect(isCurrentHour(new Date(2024, 7, 28, 9), now)).toBe(false);
  });
});
