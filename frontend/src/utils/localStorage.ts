// utils/localStorage.ts

export const loadAuthState = () => {
    try {
      const serializedState = localStorage.getItem('authState');
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      return undefined;
    }
  };

  export const saveAuthState = (state: any) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('authState', serializedState);
    } catch (err) {
      // Ignore write errors
      console.error("Failed to save auth state to local storage:", err);
    }
  };
