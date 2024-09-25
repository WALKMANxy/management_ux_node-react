import { AuthState } from "../models/stateModels";

/**
 * Loads the authentication state from localStorage.
 * @returns The parsed AuthState or undefined if not found or invalid.
 */
export const loadAuthState = (): AuthState | undefined => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState) as unknown;

    // Type guard to ensure the parsed state matches AuthState structure
    if (isAuthState(parsedState)) {
      return parsedState;
    } else {
      console.warn("Invalid auth state structure in localStorage");
      return undefined;
    }
  } catch (err) {
    console.error("Error loading auth state from localStorage:", err);
    return undefined;
  }
};

/**
 * Saves the authentication state to localStorage.
 * @param state - The AuthState to be saved.
 */
export const saveAuthState = (state: AuthState): void => {
  /*   console.debug("Saving auth state to localStorage:", state);
   */ try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("authState", serializedState);
  } catch (err) {
    console.error("Failed to save auth state to localStorage:", err);
  }
};

/**
 * Type guard to check if the given object conforms to the AuthState structure.
 * @param obj - The object to check.
 * @returns True if the object is a valid AuthState, false otherwise.
 */
function isAuthState(obj: unknown): obj is AuthState {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "isLoggedIn" in obj &&
    typeof (obj as AuthState).isLoggedIn === "boolean" &&
    "role" in obj &&
    typeof (obj as AuthState).role === "string" && // Assuming userRole is of string type or validate as per actual enum/type
    "id" in obj &&
    (typeof (obj as AuthState).id === "string" ||
      (obj as AuthState).id === null) &&
    "userId" in obj &&
    (typeof (obj as AuthState).userId === "string" ||
      (obj as AuthState).userId === null)
  );
}
