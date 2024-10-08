import { config } from "../config/config";
import { City } from "../models/City";

export class CityService {
  // Method to find a nearby city, fallback to reverse geocoding if not found
  async findNearbyCity(
    lat: number,
    lon: number,
    threshold: number = 20 // Fixed to 10km
  ): Promise<string | null> {
    try {
      console.log(
        `Finding nearby city for lat: ${lat}, lon: ${lon}, threshold: ${threshold} km`
      );

      // Find nearby city within the 10km range (converted to meters)
      const nearbyCity = await City.findOne({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lon, lat],
            },
            $maxDistance: threshold * 1000, // Convert km to meters
          },
        },
      });

      // If found, return the city name
      if (nearbyCity && nearbyCity.name) {
        console.log(`Found nearby city: ${nearbyCity.name}`);
        return nearbyCity.name;
      }

      // If not found, fallback to reverse geocode using the third-party API
      console.log("No nearby city found, calling reverse geocode API...");
      const cityFromAPI = await reverseGeocodeLocationIQ(lat, lon);

      // Store the city retrieved from the API for future lookups
      if (cityFromAPI && cityFromAPI !== "Unknown location") {
        await this.storeCity(cityFromAPI, lat, lon);
        return cityFromAPI;
      }

      return null;
    } catch (error) {
      console.error("Error finding nearby city:", error);
      throw new Error("Error finding nearby city");
    }
  }

  // Method to store a city in the database if not already stored
  async storeCity(name: string, lat: number, lon: number): Promise<void> {
    try {
      // Check if a city with the same location already exists
      const existingCity = await City.findOne({
        location: {
          $geoWithin: {
            $centerSphere: [[lon, lat], 0.009], // About 1km radius for nearby points
          },
        },
      });

      // If no city exists, create and store a new one
      if (!existingCity) {
        const newCity = new City({
          name: name.trim(),
          location: {
            type: "Point",
            coordinates: [lon, lat],
          },
        });
        await newCity.save();
        console.log(`Stored new city: ${name}`);
      }
    } catch (error) {
      console.error("Error storing city in the database:", error);
      throw new Error("Error storing city in the database");
    }
  }
}

// Third-party reverse geocoding function
export const reverseGeocodeLocationIQ = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${config.reverseGeoToken}&lat=${lat}&lon=${lon}&format=json`
    );
    const data: any = await response.json();
    // Extract city, town, or village from the response
    const city = data.address.city || data.address.town || data.address.village;
    return city || "Unknown location";
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return "Unknown location";
  }
};
