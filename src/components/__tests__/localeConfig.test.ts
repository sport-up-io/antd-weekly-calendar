import { describe, expect, it } from 'vitest';

import { createLocaleFormatter } from '../localeConfig';

describe('createLocaleFormatter', () => {
  const monday = new Date(2024, 7, 19, 14);

  describe('french calendar', () => {
    const locale = createLocaleFormatter();

    it('lists days from monday', () => {
      expect(locale.getDayIndices(true)).toEqual([1, 2, 3, 4, 5, 6, 0]);
      expect(locale.getDayIndices(false)).toEqual([1, 2, 3, 4, 5]);
    });

    it('puts sunday at the end of the week', () => {
      expect(locale.getDateOffset(1)).toBe(0);
      expect(locale.getDateOffset(0)).toBe(6);
    });

    it('formats in french on 24 hours', () => {
      expect(locale.formatHour(monday)).toBe('14:00');
      expect(locale.formatDate(monday, 'iii')).toBe('lun.');
    });
  });

  describe('USA calendar', () => {
    const locale = createLocaleFormatter(true);

    it('lists days from sunday', () => {
      expect(locale.getDayIndices(true)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(locale.getDayIndices(false)).toEqual([1, 2, 3, 4, 5]);
    });

    it('keeps the day index as offset', () => {
      expect(locale.getDateOffset(0)).toBe(0);
      expect(locale.getDateOffset(6)).toBe(6);
    });

    it('formats in english on 12 hours', () => {
      expect(locale.formatHour(monday)).toBe('02 PM');
      expect(locale.formatDate(monday, 'iii')).toBe('Mon');
    });
  });

  it('exposes the column and week object keys', () => {
    const locale = createLocaleFormatter();

    expect(locale.dayNames[0]).toBe('Sunday');
    expect(locale.dayNamesLower[0]).toBe('sunday');
  });
});
