// utils/deviceUtils.ts
export const getUserAgent = (): string => {
  return navigator.userAgent;
};

export const getDeviceId = (): string => {
  // Generate a device ID if not already stored in localStorage
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = `device-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};
