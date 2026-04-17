import { z } from "zod";

export const farmerProfileSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  preferredLanguage: z.string().default("en"),

  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.tuple([z.number(), z.number()]).optional() // Longitude, Latitude
  }).optional(),

  soilType: z.enum(["black", "red", "alluvial", "sandy", "clay"]).optional(),
  irrigationType: z.enum(["drip", "sprinkler", "canal", "rainfed", "manual"]).optional(),
  waterSource: z.enum(["borewell", "canal", "rainfed"]).optional(),
  
  farmingExperience: z.number().min(0).max(100).optional(),
  farmSize: z.number().min(0).optional(),
  soilPH: z.number().min(0).max(14).optional(),
  lastCropSeason: z.enum(["kharif", "rabi", "zaid"]).optional(),
  budgetRange: z.enum(["low", "medium", "high"]).optional(),

  cropHistory: z.array(
    z.object({
      crop: z.string().min(1, "Crop name is required"),
      season: z.enum(["kharif", "rabi", "zaid"]),
      year: z.number().int().min(1900).max(new Date().getFullYear()),
      yield: z.number().min(0)
    })
  ).optional()
});
