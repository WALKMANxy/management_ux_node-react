// config.ts

/* console.log("Environment Variables:", import.meta.env);
 */
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiUrl) {
    console.error("API URL is not defined inside config.ts.");
  }

  return apiUrl;
};

export const getTimeMs = () => {
  const apiUrl = import.meta.env.VITE_UPDATE_TIME_MS;

  if (!apiUrl) {
    console.error("API URL is not defined inside config.ts.");
  }

  return apiUrl;
};
