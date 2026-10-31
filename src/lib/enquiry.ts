import { z } from "zod";
import { todayInIST } from "./date";

const isRealDate = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const EnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(1000, "Message is too long."),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a visit date.")
    .refine(isRealDate, "Pick a valid date.")
    .refine((d) => d >= todayInIST(), "Pick today or a future date."),
  propertySlug: z.string().trim().max(200).optional(),
});

export type EnquiryInput = z.infer<typeof EnquirySchema>;

// Zod errors ko { phone: "message" } jaisa simple object banata hai
export function toFieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
