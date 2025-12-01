import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

/**
 * Format date as "time ago" (e.g., "2 hours ago")
 */
export const timeAgo = (date: Date, language: string = 'en'): string => {
  const locale = language === 'ar' ?  ar : enUS;
  return formatDistanceToNow(date, { addSuffix: true, locale });
};

/**
 * Get last N days as array of dates
 */
export const getLastNDays = (n: number): Date[] => {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }
  return days;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get N days starting from a specific date (for goal cycles)
 * @param startDate The date to start from (e.g., subscription date)
 * @param n Number of days in the cycle
 * @returns Array of dates from startDate to startDate + (n-1) days
 */
export const getDaysFromStart = (startDate: Date, n: number): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < n; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};

/**
 * Get the day number since a start date (1-indexed)
 * @param startDate The start date
 * @param currentDate The current date (defaults to today)
 * @returns Day number (1 for start date, 2 for next day, etc.)
 */
export const getDaysSinceStart = (startDate: Date, currentDate: Date = new Date()): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // 1-indexed (day 1, day 2, etc.)
};