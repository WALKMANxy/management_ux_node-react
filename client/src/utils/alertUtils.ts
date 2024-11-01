// utils/alertUtils.ts

export const getLastAlertKey = (userId: string): string =>
  `lastOverdueAlert_${userId}`;

export const getLastAlertTimestamp = (userId: string): Date | null => {
  const key = getLastAlertKey(userId);
  const timestamp = localStorage.getItem(key);
  return timestamp ? new Date(timestamp) : null;
};

export const setLastAlertTimestamp = (userId: string): void => {
  const key = getLastAlertKey(userId);
  const now = new Date().toISOString();
  localStorage.setItem(key, now);
};
