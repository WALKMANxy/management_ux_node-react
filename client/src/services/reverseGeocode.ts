import { getLocationToken } from "../config/config";

const LOCATIONIQ_API_KEY = getLocationToken();

export const reverseGeocodeLocationIQ = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();

    // Extract city, town, or village from the response
    const city = data.address.city || data.address.town || data.address.village;
    return city || "Unknown location";
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return "Unknown location";
  }
};
