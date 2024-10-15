// utils/alertUtils.ts

/**
 * Generates a unique key for storing the last alert timestamp based on user ID.
 * @param userId - The ID of the current user.
 * @returns A unique key string.
 */
export const getLastAlertKey = (userId: string): string => `lastOverdueAlert_${userId}`;

/**
 * Retrieves the last alert timestamp for a given user.
 * @param userId - The ID of the current user.
 * @returns The timestamp as a Date object or null if not found.
 */
export const getLastAlertTimestamp = (userId: string): Date | null => {
  const key = getLastAlertKey(userId);
  const timestamp = localStorage.getItem(key);
  return timestamp ? new Date(timestamp) : null;
};

/**
 * Sets the current timestamp as the last alert time for a given user.
 * @param userId - The ID of the current user.
 */
export const setLastAlertTimestamp = (userId: string): void => {
  const key = getLastAlertKey(userId);
  const now = new Date().toISOString();
  localStorage.setItem(key, now);
};
