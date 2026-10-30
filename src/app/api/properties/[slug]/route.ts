import { NextResponse } from "next/server";
import { getPropertyBySlug } from "@/lib/properties";
import { CACHE_NONE, CACHE_READ } from "@/lib/cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404, headers: { "Cache-Control": CACHE_NONE } }
    );
  }

  return NextResponse.json(property, {
    headers: { "Cache-Control": CACHE_READ },
  });
}
