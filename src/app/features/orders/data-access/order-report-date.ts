// fechaReporte is a calendar date serialized by the API, not an event timestamp.
export function reportCalendarDate(value: string | null): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString().slice(0, 10) === `${year}-${month}-${day}` ? date : null;
}

export function reportOpenDays(value: string | null, now = new Date()): number | null {
  const date = reportCalendarDate(value);
  if (!date) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find(item => item.type === type)!.value);
  const today = Date.UTC(part('year'), part('month') - 1, part('day'));
  return Math.max(0, Math.floor((today - date.getTime()) / 86400000));
}
