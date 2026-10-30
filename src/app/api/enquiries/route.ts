import { NextRequest, NextResponse } from "next/server";
import { EnquirySchema, toFieldErrors } from "@/lib/enquiry";
import { saveEnquiry } from "@/lib/enquiry-store";
import { checkRateLimit, getClientIp, recordHit } from "@/lib/rate-limit";

function isHoneypotFilled(body: unknown) {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>).website;
  return typeof value === "string" && value.trim() !== "";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Bot ne hidden field bhar diya: chupchaap 201 do, par save mat karo
  if (isHoneypotFilled(body)) {
    recordHit(ip);
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = EnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const saved = await saveEnquiry(parsed.data);
    recordHit(ip);
    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save enquiry. Please try again." },
      { status: 500 }
    );
  }
}