//src/models/City.ts
import mongoose, { Document } from "mongoose";

interface ICity extends Document {
  name: string;
  location: {
    type: string; // "Point"
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String, // "Point"
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

// Create a 2dsphere index for geospatial queries
citySchema.index({ location: "2dsphere" });
citySchema.index({ name: 1 });

export const City = mongoose.model<ICity>("City", citySchema);
