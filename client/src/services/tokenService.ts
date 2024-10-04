// src/services/tokenService.ts

let accessToken: string | null = null;

/**
 * Gets the current access token from memory.
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Sets the access token in memory.
 * @param token The access token to set.
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
