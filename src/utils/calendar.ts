import TimeArray from './TimeArray';

export { TimeArray };

export const currentTime = () => Date.now();

export function ZhouTian(
  n: number,
  limit = 12,
  unit: 'h' | 'm' | 's' = 'h'
): number {
  const msDiff = Date.now() - n;
  let divisor = 3600000;
  if (unit === 'm') divisor = 60000;
  if (unit === 's') divisor = 1000;
  return Math.min(msDiff / divisor, limit);
}

export function getXiuxianCalendar(startAt: number, flow = 1) {
  const base =
    typeof startAt === 'number' && startAt > 0 ? startAt : Date.now();
  const ms = Math.max(0, (Date.now() - base) * Math.max(0.01, flow));
  const dayMs = TimeArray.Map.day;
  const hourMs = TimeArray.Map.hour;
  const totalDays = Math.floor(ms / dayMs);
  const years = Math.floor(totalDays / 360) + 1;
  const months = Math.floor((totalDays % 360) / 30) + 1;
  const days = (totalDays % 30) + 1;
  const hoursToday = Math.floor((ms % dayMs) / hourMs);
  const shichen = Math.min(12, Math.max(1, Math.floor(hoursToday / 2) + 1));
  return { years, months, days, shichen, totalDays, hoursToday };
}

export function formatXiuxianCalendar(startAt: number, flow = 1) {
  const { years, months, days, shichen } = getXiuxianCalendar(startAt, flow);
  return `修仙历 ${years}年${months}月${days}日（第${shichen}时辰）`;
}
