import { NextRequest, NextResponse } from "next/server";
import { parsePropertyQuery } from "@/lib/property-query";
import { listProperties } from "@/lib/properties";

export function GET(request: NextRequest) {
  const parsed = parsePropertyQuery(request.nextUrl.searchParams);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.errors },
      { status: 400 }
    );
  }

  return NextResponse.json(listProperties(parsed.query));
}