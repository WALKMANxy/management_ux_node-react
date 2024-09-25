// utils/oauthUtils.ts
export const generateRandomState = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };
