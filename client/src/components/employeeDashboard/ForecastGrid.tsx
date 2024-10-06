// src/components/Weather/ForecastGrid.tsx

import { Box, Grid, useMediaQuery } from "@mui/material";
import React from "react";
import DailyForecast from "./DailyForecast";

type Forecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
};

type ForecastGridProps = {
  forecast: Forecast[];
};

const ForecastGrid: React.FC<ForecastGridProps> = ({ forecast }) => {
  const isDesktop = useMediaQuery("(min-width:786px)");
  const isMobile = useMediaQuery("(min-width:0px) and (max-width:600px)");
  const numberOfDays = isDesktop ? 7 : 2;

  // Slice the forecast array based on the number of days to display
  const displayedForecast = forecast.slice(0, numberOfDays);

  return (
    <Box
      sx={{
        marginTop: 2,
      }}
    >
      <Grid
        container
        spacing={isMobile ? 0.8 : 2}
        justifyContent="space-evenly"
        alignItems="center"
      >
        {displayedForecast.map((day) => (
          <Grid item key={day.date}>
            <DailyForecast
              date={formatDate(day.date)}
              maxTemp={day.maxTemp}
              minTemp={day.minTemp}
              weatherCode={day.weatherCode}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Helper function to format date from "YYYY-MM-DD" to "DD/MM"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export default React.memo(ForecastGrid);
