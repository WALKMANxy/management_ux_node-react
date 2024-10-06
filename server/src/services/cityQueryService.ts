import { City } from "../models/City";

export class CityService {
  // Method to find a nearby city by checking for ranges first, then fallback to threshold
  async findNearbyCity(
    lat: number,
    lon: number,
    threshold: number = 2
  ): Promise<string | null> {
    try {
      console.log(
        `Finding nearby city for lat: ${lat}, lon: ${lon}, threshold: ${threshold}`
      );
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

      if (nearbyCity && nearbyCity.name) {
        console.log(`Found nearby city: ${nearbyCity.name}`);
        return nearbyCity.name;
      }

      console.log("No nearby city found");
      return null;
    } catch (error) {
      console.error("Error finding nearby city:", error);
      throw new Error("Error finding nearby city");
    }
  }
  // Simplified method to store a city without latitude and longitude ranges
  async storeCity(name: string, lat: number, lon: number): Promise<void> {
    try {
      // Check if a city with the same name and location already exists
      const existingCity = await City.findOne({
        location: {
          $geoWithin: {
            $centerSphere: [[lon, lat], 0.009], // About a kilometer radius to match nearby points
          },
        },
      });

      if (!existingCity) {
        // Create a new city document and store it in the database
        const newCity = new City({
          name: name.trim(),
          location: {
            type: "Point",
            coordinates: [lon, lat],
          },
        });
        await newCity.save();
      }
    } catch (error) {
      throw new Error("Error storing city in the database");
    }
  }
}
