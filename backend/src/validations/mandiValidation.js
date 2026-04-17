import { z } from "zod";

export const mandiQuerySchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  state: z.string().optional(),
  district: z.string().optional(),
  mandi: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20")
});

export const mandiTrendsQuerySchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  state: z.string().min(1, "State is required for trends"),
  days: z.string().regex(/^\d+$/).transform(Number).optional().default("7")
});

export const mandiBestQuerySchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  state: z.string().optional()
});

export const mandiCompareSchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  state: z.string().optional(),
  mandis: z.array(z.string()).min(2, "At least two mandis are required for comparison")
});

export const communityPriceBodySchema = z.object({
  crop: z.string().min(1, "Crop is required"),
  price: z.number().positive("Price must be a positive number"),
  location: z.string().min(1, "Location is required"),
  state: z.string().optional()
});
