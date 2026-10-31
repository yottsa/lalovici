const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Splits a millisecond difference into whole days/hours/minutes/seconds. */
export function splitRemaining(diffMs: number): Remaining {
  let rest = Math.max(0, diffMs);

  const days = Math.floor(rest / MS_IN_DAY);
  rest %= MS_IN_DAY;

  const hours = Math.floor(rest / MS_IN_HOUR);
  rest %= MS_IN_HOUR;

  const minutes = Math.floor(rest / MS_IN_MINUTE);
  rest %= MS_IN_MINUTE;

  const seconds = Math.floor(rest / MS_IN_SECOND);

  return { days, hours, minutes, seconds };
}

/**
 * Serbian plural form: `one` for 1, 21, 31…; `few` for 2–4, 22–24…;
 * `many` for everything else, including 11–14.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const daysLabel = (n: number): string => plural(n, "dan", "dana", "dana");
export const hoursLabel = (n: number): string => plural(n, "sat", "sata", "sati");
export const minutesLabel = (n: number): string => plural(n, "minut", "minuta", "minuta");
export const secondsLabel = (n: number): string => plural(n, "sekund", "sekunde", "sekundi");

export const pad2 = (n: number): string => String(n).padStart(2, "0");
