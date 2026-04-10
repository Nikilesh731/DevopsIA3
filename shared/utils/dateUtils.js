/**
 * Date and Time Utilities
 */

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO 8601 timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Parse date safely
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {Date|null} - Parsed Date or null if invalid
 */
export function parseDate(dateStr) {
  if (dateStr instanceof Date) return dateStr;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Get days difference between two dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number} - Difference in days
 */
export function daysBetween(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 0;

  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 * @param {Date} date - Start date
 * @param {number} days - Days to add
 * @returns {Date} - New date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Include time in output
 * @returns {string} - Formatted date
 */
export function formatDate(date, includeTime = false) {
  const d = parseDate(date);
  if (!d) return 'Invalid date';

  const dateStr = d.toISOString().split('T')[0];
  if (!includeTime) return dateStr;

  const timeStr = d.toISOString().split('T')[1].substring(0, 8);
  return `${dateStr} ${timeStr}`;
}

export default {
  getCurrentTimestamp,
  parseDate,
  daysBetween,
  addDays,
  formatDate,
};
