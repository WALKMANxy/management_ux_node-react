// Define a base path for weather icons in the public folder
const WEATHER_ICON_PATH = "/images/weather/";

interface WeatherIcon {
  day: string;
  night: string;
}

interface WeatherIcons {
  [key: number]: WeatherIcon;
}

const weatherIcons: WeatherIcons = {
  0: { day: `${WEATHER_ICON_PATH}clear-day.svg`, night: `${WEATHER_ICON_PATH}clear-night.svg` },
  1: { day: `${WEATHER_ICON_PATH}clear-day.svg`, night: `${WEATHER_ICON_PATH}clear-night.svg` },
  2: { day: `${WEATHER_ICON_PATH}partly-cloudy-day.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night.svg` },
  3: { day: `${WEATHER_ICON_PATH}overcast-day.svg`, night: `${WEATHER_ICON_PATH}overcast-night.svg` },
  45: { day: `${WEATHER_ICON_PATH}fog-day.svg`, night: `${WEATHER_ICON_PATH}fog-night.svg` },
  48: { day: `${WEATHER_ICON_PATH}fog-day.svg`, night: `${WEATHER_ICON_PATH}fog-night.svg` },
  51: { day: `${WEATHER_ICON_PATH}drizzle.svg`, night: `${WEATHER_ICON_PATH}drizzle.svg` },
  53: { day: `${WEATHER_ICON_PATH}drizzle.svg`, night: `${WEATHER_ICON_PATH}drizzle.svg` },
  55: { day: `${WEATHER_ICON_PATH}drizzle.svg`, night: `${WEATHER_ICON_PATH}drizzle.svg` },
  61: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  63: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  65: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  66: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-sleet.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-sleet.svg` },
  67: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-sleet.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-sleet.svg` },
  71: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  73: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  75: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  77: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  80: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  81: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  82: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-rain.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-rain.svg` },
  85: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  86: { day: `${WEATHER_ICON_PATH}partly-cloudy-day-snow.svg`, night: `${WEATHER_ICON_PATH}partly-cloudy-night-snow.svg` },
  95: { day: `${WEATHER_ICON_PATH}thunderstorms-day.svg`, night: `${WEATHER_ICON_PATH}thunderstorms-night.svg` },
  96: { day: `${WEATHER_ICON_PATH}thunderstorms-day-rain.svg`, night: `${WEATHER_ICON_PATH}thunderstorms-night-rain.svg` },
  99: { day: `${WEATHER_ICON_PATH}thunderstorms-day-snow.svg`, night: `${WEATHER_ICON_PATH}thunderstorms-night-snow.svg` },
};

// Define default icons for fallback
const defaultClearDay = `${WEATHER_ICON_PATH}clear-day.svg`;
const defaultClearNight = `${WEATHER_ICON_PATH}clear-night.svg`;

// Function to determine if it's currently day time
export const isDayTime = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18; // Consider 6 AM to 6 PM as day
};

// Function to get the appropriate icon based on the weather code and time of day
export const getWeatherIcon = (weatherCode: number): string => {
  const isDay = isDayTime();

  // Get the icon mapping for the weather code
  const icon = weatherIcons[weatherCode];

  if (icon) {
    // Return the day or night version based on the current time
    return isDay ? icon.day : icon.night;
  }

  // Fallback to a default icon if the weather code is not found
  return isDay ? defaultClearDay : defaultClearNight;
};

/**
 * Function to check if the location has changed based on latitude and longitude.
 * @param lat1 - Previous latitude
 * @param lon1 - Previous longitude
 * @param lat2 - Current latitude
 * @param lon2 - Current longitude
 * @param threshold - The minimum change required to consider the location as changed (default is 0.01)
 * @returns boolean indicating whether the location has changed
 */
export const hasLocationChanged = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  threshold: number = 0.01
): boolean => {
  // Calculate the absolute difference between latitudes and longitudes
  const latDiff = Math.abs(lat1 - lat2);
  const lonDiff = Math.abs(lon1 - lon2);

  // Check if the difference is greater than the threshold
  return latDiff > threshold || lonDiff > threshold;
};
