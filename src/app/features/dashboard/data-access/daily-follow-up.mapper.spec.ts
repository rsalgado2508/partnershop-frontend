import { mapDailyFollowUpResponse } from './daily-follow-up.mapper';

it('keeps the snapshot calendar day and its historical count', () => {
  const [row] = mapDailyFollowUpResponse({ data: [{
    fechaSeguimiento: '2026-09-16', diaSeguimiento: 'miércoles',
    totalGuiasMayorA2Dias: 75,
  }] });
  expect(row.fechaSeguimientoDate.getDate()).toBe(16);
  expect(row.fechaSeguimientoShortLabel).toBe('mié 16/09');
  expect(row.totalGuiasMayorA2Dias).toBe(75);
});
