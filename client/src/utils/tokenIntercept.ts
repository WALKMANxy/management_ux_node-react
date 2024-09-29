// src/utils/axiosConfig.ts
import axios from "axios";
import store from "../app/store";
import { handleLogout } from "../features/auth/authSlice";

// Setup an Axios interceptor to catch 401 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      store.dispatch(handleLogout());
    }
    return Promise.reject(error);
  }
);

export default axios;
