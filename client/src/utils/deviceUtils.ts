

// utils/deviceUtils.ts

import { v4 as uuidv4 } from 'uuid';

export const getUserAgent = (): string => {
  return navigator.userAgent;
};


// Generates a unique localId using UUID
export const generateId = () => uuidv4();
