import {
  default as clearDay,
  default as defaultClearDay,
} from "../assets/weather/clear-day.svg";
import {
  default as clearNight,
  default as defaultClearNight,
} from "../assets/weather/clear-night.svg";
import drizzle from "../assets/weather/drizzle.svg";
import fogDay from "../assets/weather/fog-day.svg";
import fogNight from "../assets/weather/fog-night.svg";
import overcastDay from "../assets/weather/overcast-day.svg";
import overcastNight from "../assets/weather/overcast-night.svg";
import partlyCloudyDayRain from "../assets/weather/partly-cloudy-day-rain.svg";
import partlyCloudyDaySleet from "../assets/weather/partly-cloudy-day-sleet.svg";
import partlyCloudyDaySnow from "../assets/weather/partly-cloudy-day-snow.svg";
import partlyCloudyDay from "../assets/weather/partly-cloudy-day.svg";
import partlyCloudyNightRain from "../assets/weather/partly-cloudy-night-rain.svg";
import partlyCloudyNightSleet from "../assets/weather/partly-cloudy-night-sleet.svg";
import partlyCloudyNightSnow from "../assets/weather/partly-cloudy-night-snow.svg";
import partlyCloudyNight from "../assets/weather/partly-cloudy-night.svg";
import thunderstormsDayRain from "../assets/weather/thunderstorms-day-rain.svg";
import thunderstormsDaySnow from "../assets/weather/thunderstorms-day-snow.svg";
import thunderstormsDay from "../assets/weather/thunderstorms-day.svg";
import thunderstormsNightRain from "../assets/weather/thunderstorms-night-rain.svg";
import thunderstormsNightSnow from "../assets/weather/thunderstorms-night-snow.svg";
import thunderstormsNight from "../assets/weather/thunderstorms-night.svg";

interface WeatherIcon {
  day: string;
  night: string;
}

interface WeatherIcons {
  [key: number]: WeatherIcon;
}

const weatherIcons: WeatherIcons = {
  0: { day: clearDay, night: clearNight },
  1: { day: clearDay, night: clearNight },
  2: { day: partlyCloudyDay, night: partlyCloudyNight },
  3: { day: overcastDay, night: overcastNight },
  45: { day: fogDay, night: fogNight },
  48: { day: fogDay, night: fogNight },
  51: { day: drizzle, night: drizzle },
  53: { day: drizzle, night: drizzle },
  55: { day: drizzle, night: drizzle },
  61: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  63: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  65: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  66: { day: partlyCloudyDaySleet, night: partlyCloudyNightSleet },
  67: { day: partlyCloudyDaySleet, night: partlyCloudyNightSleet },
  71: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  73: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  75: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  77: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  80: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  81: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  82: { day: partlyCloudyDayRain, night: partlyCloudyNightRain },
  85: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  86: { day: partlyCloudyDaySnow, night: partlyCloudyNightSnow },
  95: { day: thunderstormsDay, night: thunderstormsNight },
  96: { day: thunderstormsDayRain, night: thunderstormsNightRain },
  99: { day: thunderstormsDaySnow, night: thunderstormsNightSnow },
};

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
