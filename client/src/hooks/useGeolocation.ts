import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { findCityByCoordinates } from "../features/weather/apis/reverseGeo";
import { useGetWeatherQuery } from "../features/weather/weatherQuery";
import {
  cacheCityData,
  getCachedCityData,
  getWithExpiry,
  setWithExpiry,
} from "../services/localStorage";
import { hasLocationChanged } from "../utils/weatherUtils";

type GeoLocation = {
  lat: number;
  lon: number;
};

type UseGeolocationResult = {
  location: GeoLocation | null;
  city: string | null;
  weather: WeatherData | null;
  error: string | null;
  isLoading: boolean;
};

type Forecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
};

type WeatherData = {
  temp: number;
  weatherCode: number;
  description: string;
  city?: string | null;
  forecast: Forecast[];
};
const CACHE_KEY = "weatherData";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds
const LOCATION_THRESHOLD = 0.05; // Threshold for lat/lon change to invalidate city cache

const geoFind = (): Promise<GeoLocation | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const errorMessage = "Geolocation is not supported by your browser";
      console.error(errorMessage);
      reject(new Error(errorMessage));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lon: longitude });
        },
        (error: GeolocationPositionError) => {
          console.error("Error retrieving geolocation:", error.message);
          reject(new Error("Error retrieving geolocation: " + error.message));
        }
      );
    }
  });
};

const ipFind = async (): Promise<GeoLocation> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch IP-based location: ${response.statusText}`
      );
    }
    const data = await response.json();
    return { lat: data.latitude, lon: data.longitude };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error retrieving IP-based location:", error.message);
      throw new Error("Error retrieving IP-based location: " + error.message);
    } else {
      console.error(
        "Unknown error occurred during IP-based location retrieval"
      );
      throw new Error(
        "Unknown error occurred during IP-based location retrieval"
      );
    }
  }
};

export const useGeolocation = (
  autoLocate: "gps" | "ip" | null
): UseGeolocationResult => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Effect 1: Fetch User Location
   */
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (autoLocate === "gps") {
          const res = await geoFind();
          if (res === null) {
            setError("GPS location not found, trying IP-based location...");
            const ipRes = await ipFind();
            setLocation(ipRes);
          } else {
            setLocation(res);
          }
        } else if (autoLocate === "ip") {
          const ipRes = await ipFind();
          setLocation(ipRes);
        } else {
          setError("No valid location method provided");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    fetchLocation();
  }, [autoLocate]);

  /**
   * Effect 2: Fetch City Based on Location
   */
  useEffect(() => {
    const fetchCity = async () => {
      if (!location) return;

      try {
        // Step 1: Retrieve city from cache, check if location has changed
        const cachedCityData = getCachedCityData();

        if (
          cachedCityData &&
          !hasLocationChanged(
            location.lat,
            location.lon,
            cachedCityData.lat,
            cachedCityData.lon,
            LOCATION_THRESHOLD
          )
        ) {
          // If location hasn't changed significantly, use cached city
          setCity(cachedCityData.city);
        } else {
          // Step 2: Fetch city from server (server handles finding or reverse geocoding)
          try {
            const { city: serverCity } = await findCityByCoordinates(
              location.lat,
              location.lon
            );
            setCity(serverCity);
            // Cache the new city data
            cacheCityData(location.lat, location.lon, serverCity);
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              if (axiosError.response?.status === 404) {
                setError("City not found, please try again later.");
              } else {
                throw new Error("Error retrieving city from server");
              }
            } else {
              throw new Error("Unexpected error occurred during city lookup");
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while fetching city");
        }
      }
    };

    fetchCity();
  }, [location]);

  /**
   * Step 3: Fetch weather data
   */
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location || !city) return;

      try {
        const cachedWeather = getWithExpiry(CACHE_KEY);

        if (cachedWeather && cachedWeather.city === city) {
          setWeather(cachedWeather);
          setIsLoading(false);
        } else {
          // Fetch weather using RTK Query
          // Note: RTK Query will handle the fetching and caching in Redux store
          // We'll leverage its data here without replacing the manual cache
          // We'll fetch the data using RTK Query's hook below
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while fetching weather data");
        }
      }
    };

    fetchWeather();
  }, [city, location]);

  /**
   * Use RTK Query to fetch weather data if not cached
   */
  const {
    data: apiData,
    error: apiError,
    isFetching,
  } = useGetWeatherQuery(
    location && city
      ? { latitude: location.lat, longitude: location.lon }
      : { latitude: 0, longitude: 0 }, // Provide default values or handle appropriately
    {
      skip: !location || !city || getWithExpiry(CACHE_KEY)?.city === city, // Skip if cached
    }
  );

  /**
   * Effect 4: Process Weather Data from RTK Query
   */
  useEffect(() => {
    const processWeather = () => {
      if (apiData && city) {
        const weatherData: WeatherData = {
          temp: apiData.current_weather.temperature,
          weatherCode: apiData.current_weather.weathercode,
          description: apiData.current_weather.weathercode.toString(),
          city: city,
          forecast: apiData.daily.time.map((date: string, index: number) => ({
            date: date,
            maxTemp: apiData.daily.temperature_2m_max[index],
            minTemp: apiData.daily.temperature_2m_min[index],
            weatherCode: apiData.daily.weathercode[index],
          })),
        };

        // Cache weather data with expiry
        setWithExpiry(CACHE_KEY, weatherData, CACHE_TTL);
        setWeather(weatherData);
        setIsLoading(false);
      }
    };

    if (apiData) {
      processWeather();
    }

    if (apiError) {
      if (apiError instanceof Error) {
        setError(apiError.message);
      } else {
        setError("An unexpected error occurred while fetching weather data");
      }
      setIsLoading(false);
    }

    if (isFetching) {
      setIsLoading(true);
    }
  }, [apiData, apiError, city, isFetching]);

  return { location, city, weather, error, isLoading };
};
