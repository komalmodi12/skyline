import { NextResponse, type NextRequest } from "next/server";
import properties from "./data/properties.json";

// Cache Components mein page ke andar notFound() se status 200 hi rehta hai.
// Isliye galat slug ka 404 yahan decide hota hai, page render hone se pehle.
const VALID_SLUGS = new Set(properties.map((p) => p.slug));

let notFoundHtml: string | null = null;

const FALLBACK_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Not found | Skyline</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0e1320;color:#f3efe6;font-family:system-ui,sans-serif"><main style="padding:2rem"><h1>We could not find that page</h1><p>The home may have been removed, or the link may be wrong.</p><a href="/properties" style="color:#c9a66b">Browse all homes</a></main></body></html>`;

async function getNotFoundHtml(origin: string) {
  if (notFoundHtml) return notFoundHtml;
  try {
    const res = await fetch(new URL("/_not-found", origin));
    const text = await res.text();
    if (text.includes("<html")) {
      notFoundHtml = text;
      return text;
    }
  } catch {
    // fetch fail ho toh neeche ka built-in HTML use hoga
  }
  return FALLBACK_HTML;
}

export async function proxy(request: NextRequest) {
  const raw = request.nextUrl.pathname.split("/")[2] ?? "";
  let slug = "";
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // kharab URL encoding: slug khaali rahega, aur 404 milega
  }

  if (VALID_SLUGS.has(slug)) return NextResponse.next();

  const html = await getNotFoundHtml(request.nextUrl.origin);
  return new NextResponse(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// Sirf /properties/<ek-slug> par chalta hai. Listing aur API par nahi.
export const config = { matcher: "/properties/:slug" };
