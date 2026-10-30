import { z } from "zod";

export const PROPERTY_TYPES = ["Apartment", "Penthouse", "Villa"] as const;
export const PropertyTypeSchema = z.enum(PROPERTY_TYPES);

export const PropertySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  locality: z.string(),
  city: z.string(),
  priceLakh: z.number().positive(), // ₹ lakh mein (100 lakh = 1 crore)
  bhk: z.number().int().min(1).max(4),
  type: PropertyTypeSchema,
  areaSqFt: z.number().positive(),
  furnished: z.boolean(),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  description: z.string(),
  createdAt: z.string(), // ISO date, "newest" sort ke liye
});

export type Property = z.infer<typeof PropertySchema>;
export type PropertyType = z.infer<typeof PropertyTypeSchema>;