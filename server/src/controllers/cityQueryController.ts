//src/controllers/cityQueryController.ts
import { Request, Response } from "express";
import { CityService } from "../services/cityQueryService";

export class CityController {
  private cityService: CityService;

  constructor() {
    this.cityService = new CityService();
  }

  // API endpoint to find a nearby city by coordinates
  async findCity(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

     /*  console.log(
        `Finding nearby city for lat: ${latitude}, lon: ${longitude}`
      ); */

      const cityName = await this.cityService.findNearbyCity(
        latitude,
        longitude
      );

      if (cityName) {
        // console.log(`Found nearby city: ${cityName}`);
        res.status(200).json({ city: cityName });
      } else {
        // console.log("No nearby city found");
        res.status(404).json({ message: "No nearby city found" });
      }
    } catch (error) {
      console.error("Error finding nearby city:");
      res.status(500).json({ message: "Error finding nearby city" });
    }
    return;
  }
  // API endpoint to store a new city (no latRange/lonRange handling)
  async storeCity(req: Request, res: Response): Promise<void> {
    try {
      const { name, lat, lon } = req.body;

      // Validate required fields
      if (!name || !lat || !lon) {
        res.status(400).json({
          message: "Missing required fields: name, lat, lon are required",
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      // Store the city with just lat/lon (no ranges)
      await this.cityService.storeCity(name, latitude, longitude);

      res.status(201).json({ message: "City stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error storing city" });
    }
    return;
  }
}
