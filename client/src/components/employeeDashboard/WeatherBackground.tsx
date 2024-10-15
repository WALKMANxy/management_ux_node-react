import { Box } from "@mui/material";

// Define a type for the background styles
interface BackgroundStyles {
  backgroundColor: string;
  shapes: JSX.Element[];
}

// Function to get background styles based on weather code and time of day
export const getBackgroundStyles = (
  weatherCode: number,
  isDay: boolean
): BackgroundStyles => {
  let backgroundColor = "#87CEEB"; // Default sky blue
  let shapes: JSX.Element[] = [];

  // Define color mappings based on weather types
  const weatherType = getWeatherType(weatherCode);

  switch (weatherType) {
    case "Clear":
      backgroundColor = isDay ? "#87CEEB" : "#2C3E50"; // Sky blue or dark blue for night
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: 100,
            height: 100,
            background: isDay
              ? "linear-gradient(45deg, #a0c4ff, #cdb4db)"
              : "linear-gradient(45deg, #34495e, #2c3e50)",
            borderRadius: "50%",
            opacity: 0.3,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    case "Cloudy":
      backgroundColor = isDay ? "#B0C4DE" : "#34495e"; // Light steel blue or darker blue
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "30%",
            left: "10%",
            width: 150,
            height: 80,
            background: "linear-gradient(135deg, #d3d3d3, #a9a9a9)",
            borderRadius: "50% 50% 50% 50%",
            opacity: 0.2,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    case "Fog":
      backgroundColor = "#778899"; // Light slate gray
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "50%",
            left: "70%",
            width: 120,
            height: 60,
            background: "linear-gradient(90deg, #dcdcdc, #a9a9a9)",
            borderRadius: "20%",
            opacity: 0.25,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    case "Rain":
      backgroundColor = isDay ? "#87CEFA" : "#5D6D7E"; // Sky blue or slate gray
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "20%",
            left: "80%",
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #bdc3c7, #95a5a6)",
            borderRadius: "50%",
            opacity: 0.2,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    case "Snow":
      backgroundColor = isDay ? "#E0FFFF" : "#2C3E50"; // Light cyan or dark blue
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "40%",
            left: "50%",
            width: 100,
            height: 100,
            background: "linear-gradient(45deg, #ffffff, #d3d3d3)",
            borderRadius: "50%",
            opacity: 0.3,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    case "Thunderstorm":
      backgroundColor = isDay ? "#708090" : "#34495e"; // Slate gray or darker blue
      shapes = [
        <Box
          key="shape1"
          sx={{
            position: "absolute",
            top: "60%",
            left: "30%",
            width: 90,
            height: 90,
            background: "linear-gradient(135deg, #2c3e50, #34495e)",
            borderRadius: "50%",
            opacity: 0.25,
            zIndex: -1,
          }}
        />,
        // Add more shapes as needed
      ];
      break;

    default:
      backgroundColor = "#87CEEB"; // Default sky blue
      break;
  }

  return { backgroundColor, shapes };
};

// Helper function to determine weather type based on code
const getWeatherType = (weatherCode: number): string => {
  const clearCodes = [0, 1];
  const partlyCloudyCodes = [2];
  const overcastCodes = [3];
  const fogCodes = [45, 48];
  const drizzleCodes = [51, 53, 55];
  const rainCodes = [61, 63, 65, 80, 81, 82];
  const sleetCodes = [66, 67];
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const thunderstormsCodes = [95, 96, 99];

  if (clearCodes.includes(weatherCode)) return "Clear";
  if (partlyCloudyCodes.includes(weatherCode)) return "Cloudy";
  if (overcastCodes.includes(weatherCode)) return "Cloudy";
  if (fogCodes.includes(weatherCode)) return "Fog";
  if (drizzleCodes.includes(weatherCode)) return "Rain";
  if (rainCodes.includes(weatherCode)) return "Rain";
  if (sleetCodes.includes(weatherCode)) return "Rain";
  if (snowCodes.includes(weatherCode)) return "Snow";
  if (thunderstormsCodes.includes(weatherCode)) return "Thunderstorm";

  return "Clear"; // Default type
};
