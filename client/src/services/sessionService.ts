import axios from 'axios';
import store from '../app/store';
import { saveAuthState } from '../utils/localStorage';
import { login, logout } from '../features/auth/authSlice';
import { getDeviceId } from '../utils/deviceUtils'; // Import the device ID utility function

export const refreshSession = async (): Promise<boolean> => {
  try {
    const userAgent = navigator.userAgent;
    const deviceId = getDeviceId(); // Retrieve the device ID

    const response = await axios.post(
      '/api/auth/refresh-session',
      { userAgent, deviceId }, // Send both userAgent and deviceId
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      const authState = store.getState().auth;

      if (authState.id && authState.userId) {
        store.dispatch(
          login({
            role: authState.userRole,
            id: authState.id,
            userId: authState.userId,
          })
        );
        saveAuthState(store.getState().auth);
        return true;
      } else {
        throw new Error('Missing user id or userId in auth state');
      }
    } else {
      throw new Error('Session refresh failed');
    }
  } catch (error) {
    console.error('Session refresh error:', error);

    // Logout the user and clear auth state on failure
    store.dispatch(logout());
    localStorage.removeItem('authState');
    sessionStorage.clear();

    return false;
  }
};
