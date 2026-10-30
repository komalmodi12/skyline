export type PropertyType = "Apartment" | "Penthouse" | "Villa";

export interface Property {
  id: number;
  slug: string;
  title: string;
  locality: string;
  priceLakh: number;      // price ₹ lakh mein (100 lakh = 1 crore)
  bhk: 1 | 2 | 3 | 4;
  type: PropertyType;
  areaSqFt: number;
  furnished: boolean;
  amenities: string[];
  images: string[];
  description: string;
  createdAt: string;      // ISO date, "newest" sort ke liye
}

//ye shared type file h seed data, api, aur pages sab ise import krenge