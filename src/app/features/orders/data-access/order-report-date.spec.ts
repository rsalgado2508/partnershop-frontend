import { reportCalendarDate, reportOpenDays } from './order-report-date';

describe('Order report calendar dates', () => {
  it.each(['2026-09-15', '2026-09-15T00:00:00.000Z', '2026-09-15T05:00:00.000Z'])(
    'preserves the database date %s and counts two days on September 17', value => {
      expect(reportCalendarDate(value)?.toISOString().slice(0, 10)).toBe('2026-09-15');
      expect(reportOpenDays(value, new Date('2026-09-17T17:00:00Z'))).toBe(2);
    },
  );
  it('changes age at midnight in Colombia, not UTC', () => {
    expect(reportOpenDays('2026-09-15', new Date('2026-09-18T04:59:59Z'))).toBe(2);
    expect(reportOpenDays('2026-09-15', new Date('2026-09-18T05:00:00Z'))).toBe(3);
  });
  it.each([null, '', 'invalid', '2026-02-30'])('rejects invalid dates %s', value => {
    expect(reportCalendarDate(value)).toBeNull();
    expect(reportOpenDays(value)).toBeNull();
  });
});
