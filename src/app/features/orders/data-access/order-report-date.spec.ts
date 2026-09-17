import { reportCalendarDate, reportOpenDays, formatReportDate, formatColombiaDateTime } from './order-report-date';

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

describe('Date display across views', () => {
  it('keeps a report date but converts a real event timestamp to Colombia', () => {
    const value = '2026-09-15T00:30:00.000Z';
    expect(formatReportDate(value)).toBe(new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium', timeZone: 'UTC',
    }).format(new Date('2026-09-15T00:00:00Z')));
    expect(formatColombiaDateTime(value)).toContain('14');
    expect(formatColombiaDateTime('invalid')).toBe('—');
  });
  it.each([2, 3, 6, 7, 14, 15, 20, 21])('counts %i calendar days consistently', age => {
    const report = new Date(Date.UTC(2026, 8, 17 - age)).toISOString();
    expect(reportOpenDays(report, new Date('2026-09-17T17:00:00Z'))).toBe(age);
  });
  it.each([
    ['2026-12-31', '2027-01-01T05:00:00Z', 1],
    ['2028-02-28', '2028-03-01T05:00:00Z', 2],
    ['2026-09-18', '2026-09-17T17:00:00Z', 0],
  ] as const)('handles year/month changes and future dates', (date, now, expected) => {
    expect(reportOpenDays(date, new Date(now))).toBe(expected);
  });
});
