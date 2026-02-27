export const SortType = {
  HOT: 'hot',
  NEW: 'new',
  TOP: 'top',
} as const;

export type SortType = (typeof SortType)[keyof typeof SortType];

export const TimePeriod = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
} as const;

export type TimePeriod = (typeof TimePeriod)[keyof typeof TimePeriod];
