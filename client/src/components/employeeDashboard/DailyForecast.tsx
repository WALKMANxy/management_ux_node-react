import { Box, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { getWeatherIcon } from "../../utils/weatherUtils";

type DailyForecastItemProps = {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
};

const DailyForecastItem: React.FC<DailyForecastItemProps> = ({
  date,
  maxTemp,
  minTemp,
  weatherCode,
}) => {
  const isMobile = useMediaQuery("(min-width:0px) and (max-width:600px)");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "4px" : "20px",
        border: "0.5px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "rgba(255,255,255,0.05)",
        "&:hover": {
          transform: "scale(1.05)",
          transition: "transform 0.2s ease-in",
        },
      }}
    >
      {/* Max/Min Temperature */}
      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.8)",
        }}
      >
        {`${Math.floor(maxTemp)}° / ${Math.floor(minTemp)}°`}
      </Typography>
      {/* Weather Icon */}
      <img
        src={getWeatherIcon(weatherCode)}
        alt="Weather Icon"
        width={30}
        height={30}
      />
      {/* Date */}
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {date}
      </Typography>
    </Box>
  );
};

export default React.memo(DailyForecastItem);
