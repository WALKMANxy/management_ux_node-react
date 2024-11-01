

// src/utils/deviceUtils.ts

import { v4 as uuidv4 } from 'uuid';

export const getUserAgent = (): string => {
  return navigator.userAgent;
};

export const generateId = () => uuidv4();
