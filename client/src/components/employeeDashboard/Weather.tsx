// src/components/Weather/WeatherComponent.tsx

import {
  Box,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGeolocation } from "../../hooks/useGeolocation";
import { getWeatherIcon, isDayTime } from "../../utils/weatherUtils";
import ForecastGrid from "./ForecastGrid"; // Import the ForecastGrid component
import { getBackgroundStyles } from "./WeatherBackground";

const WeatherComponent: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width:786px)");
  // Optionally, you can define isMobile and other breakpoints if needed

  const { t } = useTranslation(); // React i18n hook for translations
  const { city, weather, isLoading, error } = useGeolocation("gps");

  const isDay = useMemo(() => isDayTime(), []);

  // Memoize background styles to optimize performance
  const backgroundStyles = useMemo(() => {
    if (weather?.weatherCode) {
      return getBackgroundStyles(weather.weatherCode, isDay);
    }
    // Default styles if weatherCode is not available
    return {
      backgroundColor: "#87CEEB",
      shapes: [],
    };
  }, [weather, isDay]);

  if (error) {
    return (
      <Paper elevation={3} sx={{ borderRadius: "12px", padding: 2 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Decorative Shapes */}
      {backgroundStyles.shapes}

      <Box
        sx={{
          padding: 2,
          backgroundColor: backgroundStyles.backgroundColor,
          color: "#fff",
          borderRadius: "12px",
          position: "relative",
          zIndex: 1, // Ensure content is above shapes
          height: "100%",
        }}
      >
        {/* Current Weather Section */}
        <Grid
          container
          direction={isDesktop ? "row" : "column"}
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12} md={6}>
            {/* Temperature and Icon */}
            <Grid
              container
              justifyContent={isDesktop ? "flex-start" : "flex-end"}
              alignItems="center"
            >
              {isLoading ? (
                <>
                  <Skeleton variant="circular" width={50} height={50} />
                  <Skeleton
                    variant="text"
                    width={60}
                    height={40}
                    sx={{ marginLeft: 2 }}
                  />
                </>
              ) : (
                <>
                  <img
                    src={getWeatherIcon(weather?.weatherCode || 0)} // Get the appropriate weather icon
                    alt="Weather Icon"
                    width={50}
                    height={50}
                  />
                  <Typography
                    variant="h4"
                    sx={{ marginLeft: isDesktop ? 2 : 0 }}
                  >
                    {`${weather?.temp}°C`}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* City Name + Weather Description */}
            <Grid
              container
              direction="column"
              alignItems={isDesktop ? "flex-end" : "flex-end"}
            >
              <Typography variant="h6">
                {isLoading ? <Skeleton width={100} /> : city}
              </Typography>
              {/* Translated weather description */}
              <Typography variant="subtitle1">
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  t(`weather.${weather?.weatherCode || 0}`) // Fetch dynamic weather description
                )}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Divider
          sx={{
            backgroundColor: "white",
            width: "95%",
            margin: "0 auto",
            mt: 2,
          }}
        />

        <Box sx={{ pt: 2 }}>
          <Typography
            variant={isDesktop ? "h5" : "subtitle1"}
            sx={{ textAlign: "left" }}
          >
            Forecast:
          </Typography>
          {/* Forecast Section */}
          {!isLoading && weather?.forecast && (
            <ForecastGrid forecast={weather.forecast} />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(WeatherComponent);
