/**
 * Date utility functions for local calendar date handling and past-date validation.
 * Uses the user's local timezone (getFullYear, getMonth, getDate) rather than UTC
 * to avoid any 1-day date-shifting discrepancies.
 */

/**
 * Returns today's date in local calendar timezone formatted as YYYY-MM-DD.
 */
export const getLocalTodayDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

/**
 * Returns tomorrow's date in local calendar timezone formatted as YYYY-MM-DD.
 */
export const getLocalTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalTodayDateString(tomorrow);
};

/**
 * Checks if a given YYYY-MM-DD date string is strictly before today's local date.
 * Returns true if the date is in the past, false if it is today or in the future.
 */
export const isPastDate = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const clean = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return false;
  const todayStr = getLocalTodayDateString();
  return clean < todayStr;
};

/**
 * Validates whether a travel date is valid and not in the past.
 */
export const validateTravelDate = (
  dateStr: string
): { isValid: boolean; errorMessage?: string } => {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, errorMessage: 'Please select a planned travel date.' };
  }
  const clean = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return { isValid: false, errorMessage: 'Invalid date format. Please choose a valid date.' };
  }
  if (isPastDate(clean)) {
    return {
      isValid: false,
      errorMessage: `Planned travel date cannot be in the past. Today is ${getLocalTodayDateString()}. Please select today or a future date.`,
    };
  }
  return { isValid: true };
};

/**
 * Formats a YYYY-MM-DD date into human-readable string (e.g. "Thu, 22 Oct 2026").
 */
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
