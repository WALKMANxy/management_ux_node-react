//src/utils/landingUtils.ts

export const setRegistered = (value: boolean): void => {
    try {
      const stored = localStorage.getItem('registered');
      if (stored !== null) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed === value) {
            // The desired value is already set; no need to update.
            return;
          }
        } catch (parseError) {
          console.warn('Malformed registered flag detected. Resetting to desired value.'+ parseError);
          localStorage.removeItem('registered');
        }
      }
      // Set the 'registered' flag to the desired value
      localStorage.setItem('registered', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set registered flag in localStorage:', error);
    }
  };
/**
 * Retrieves the 'registered' flag from localStorage.
 * @returns A boolean indicating registration status. Defaults to false if not set.
 */
export const isRegistered = (): boolean => {
  try {
    const stored = localStorage.getItem("registered");
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error(
      "Failed to retrieve registered flag from localStorage:",
      error
    );
    return false;
  }
};
