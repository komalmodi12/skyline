# Skyline

A showcase site for a fictional luxury residential tower: a scroll-driven 3D landing page, a property listings page, a property detail page and an enquiry form, backed by a small API.

- **Live site:** https://skyline-dun-six.vercel.app
- **Repository:** `https://github.com/komalmodi12/skyline`

## Project status

This README describes what exists today. Sections marked **TODO** are filled in as each part is built.

| Area | Status |
| --- | --- |
| Project setup, deploy | Done |
| Shared types, seed data (60 properties) | Done |
| API: list, detail, similar, enquiries | Done |
| Cache headers | Done |
| Listings page `/properties` | TODO |
| Detail page `/properties/[slug]` and enquiry form UI | TODO |
| Landing page with procedural 3D | TODO |
| Performance measurements and reports | TODO |
| `AI_USAGE.md`, screen recording | TODO |

## Tech stack

- Next.js (App Router) with TypeScript
- Tailwind CSS
- Zod for validation and shared types
- Three.js for the landing page (procedural, no downloaded models) **TODO**
- Deployed on Vercel

## Run locally

Requires Node 20 or newer.

```bash
git clone <your-github-repo-url>
cd skyline
npm install
npm run dev
```

Open http://localhost:3000. The seeded data is committed, so no extra setup is needed. To regenerate it, run `npm run seed`.

Copy `.env.example` to `.env.local` only if you use features that need secrets. No real secrets are committed.

## Folder structure

```
scripts/
  seed.ts                 Generates src/data/properties.json
src/
  app/
    api/
      properties/
        route.ts          GET list with filters, sort, pagination
        [slug]/route.ts   GET one property (404 if unknown)
        [slug]/similar/   GET up to 4 similar properties
      enquiries/route.ts  POST enquiry
  data/properties.json    60 seeded properties
  lib/
    property-query.ts     Query-string schema (shared rules)
    properties.ts         Filter, sort, paginate, lookup (server only)
    enquiry.ts            Enquiry schema (shared rules)
    enquiry-store.ts      Saves enquiries
    rate-limit.ts         In-memory rate limiter
    cache.ts              Cache-Control values
  types/property.ts       Zod PropertySchema and the Property type
```

## Data and shared types

`src/types/property.ts` holds a single Zod `PropertySchema`. The TypeScript `Property` type is inferred from it with `z.infer`, so the schema and the type cannot drift apart. The seed script validates every property against this schema before writing the JSON, and the server validates the JSON again when it loads.

`npm run seed` generates 60 properties across 8 localities in 6 Indian cities (Noida, Gurugram, Bengaluru, Mumbai, Pune, Hyderabad). Prices are stored in ₹ lakh (100 lakh = 1 crore) and derived from area and a per-locality rate. A seeded random generator is used, so every run produces identical data.

`src/lib/properties.ts` must only be imported on the server. Importing it in a client component would ship the full JSON to the browser.

## API

### `GET /api/properties`

| Param | Rule |
| --- | --- |
| `q` | Searches title and locality, max 100 characters |
| `minPrice`, `maxPrice` | In ₹ lakh. `minPrice` must not exceed `maxPrice` |
| `bhk` | 1 to 4 |
| `type` | `Apartment`, `Penthouse` or `Villa` |
| `furnished` | `true` or `false` |
| `sort` | `newest` (default), `price_asc`, `price_desc` |
| `page` | 1 or more, default 1 |
| `limit` | 1 to 24, default 12 |

Returns `{ items, total, page, hasMore }`. Invalid params return `400` with `{ error, details }`. A page past the last one returns `200` with empty `items`. Sorting uses the property id as a tie-breaker, so pagination order is stable.

### `GET /api/properties/:slug`

Returns one property, or `404` with `{ error }`.

### `GET /api/properties/:slug/similar`

Returns `{ items }` with up to 4 properties that share the locality or the BHK. Same locality ranks above same BHK, a match on both ranks first, and ties are broken by closest price. The property itself is never included. Unknown slug returns `404`.

### `POST /api/enquiries`

Body (JSON):

| Field | Rule |
| --- | --- |
| `name` | 2 to 80 characters |
| `phone` | 10-digit Indian mobile number (`^[6-9]\d{9}$`) |
| `email` | Optional, valid email |
| `message` | 10 to 1000 characters |
| `visitDate` | `YYYY-MM-DD`, a real date, today or later (India time) |
| `propertySlug` | Optional |
| `website` | Honeypot. Must stay empty |

Responses:

- `201` with `{ ok: true, id }` when saved
- `400` with `{ error, fieldErrors }` for validation failures, or `{ error }` for a malformed JSON body
- `429` with a `Retry-After` header after 5 accepted enquiries from one IP in 10 minutes
- `500` if saving fails

A filled honeypot field returns `201` but nothing is saved, so a bot gets no signal that it was caught. Only accepted enquiries count towards the rate limit, so a user fixing typos is not locked out.

The same `EnquirySchema` will be imported by the form, so client and server use identical rules.

## Caching

The data only changes when the site is redeployed, so read endpoints are safe to cache for a long time.

Read endpoints send:

```
Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400
```

- `max-age=60`: the browser reuses a response for 1 minute.
- `s-maxage=3600`: the CDN caches for 1 hour.
- `stale-while-revalidate=86400`: the CDN may serve a stale copy while it refreshes in the background.

Errors (`400`, `404`) and the enquiry endpoint send `Cache-Control: no-store`, so a mistake or personal data is never cached.

On Vercel, the CDN consumes `s-maxage` and `stale-while-revalidate`, so the browser only sees `public, max-age=60`. The edge cache is still active: repeat requests return `x-vercel-cache: HIT`. Each distinct query string is cached separately.

If the data later moves to a database, these values should be shortened or the cache revalidated by tag.

**TODO:** how listing and detail pages are cached or revalidated (added when the pages are built).

## 3D landing page

**TODO:** how the 3D scene is loaded and why, the scroll scenes, fallbacks for reduced motion and missing WebGL, and the performance choices.

## Performance

**TODO:** measured results from the deployed site (Lighthouse mobile for `/`, `/properties` and one detail page, bundle analyzer). Reports will be in `/reports`.

## Known issues

- **Enquiry storage is not durable on Vercel.** Enquiries are written to `data/enquiries.json` locally. On Vercel the file system is not persistent, so writes go to `/tmp` and can be lost between invocations. Storage sits behind one `saveEnquiry()` function, so it can be swapped for a hosted database without touching the route.
- **The rate limit is in memory.** On serverless hosting each instance keeps its own counter, so the limit is approximate in production.
- Property images are placeholders until real, optimised images are added. **TODO**

## What I would do with another day

- Store enquiries in a hosted database (for example Neon Postgres).
- Move the rate limit to a shared store (for example Upstash Redis).
- Add unit tests for the query schema and the API validation, plus one Playwright end-to-end test.

## Credits

**TODO:** list every image, font and asset with its source and licence.

## AI usage

See `AI_USAGE.md` **TODO**.
