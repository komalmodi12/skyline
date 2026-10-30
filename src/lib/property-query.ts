import { z } from "zod";
import { PropertyTypeSchema } from "../types/property";

export const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;

export const PropertyQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(), // ₹ lakh mein
    maxPrice: z.coerce.number().min(0).optional(), // ₹ lakh mein
    bhk: z.coerce.number().int().min(1).max(4).optional(),
    type: PropertyTypeSchema.optional(),
    furnished: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    sort: z.enum(SORT_OPTIONS).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(24).default(12),
  })
  .refine(
    (d) =>
      d.minPrice === undefined ||
      d.maxPrice === undefined ||
      d.minPrice <= d.maxPrice,
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] }
  );

export type PropertyQuery = z.infer<typeof PropertyQuerySchema>;

// URL ke params ko object banata hai. Khaali values ("?bhk=") ignore hoti hain.
export function searchParamsToObject(params: URLSearchParams) {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    if (value.trim() !== "") obj[key] = value;
  });
  return obj;
}

export function parsePropertyQuery(params: URLSearchParams) {
  const result = PropertyQuerySchema.safeParse(searchParamsToObject(params));
  if (result.success) return { ok: true as const, query: result.data };

  const errors = result.error.issues.map(
    (i) => `${i.path.join(".") || "query"}: ${i.message}`
  );
  return { ok: false as const, errors };
}