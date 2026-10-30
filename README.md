# Skyline

Skyline is a showcase website for a fictional luxury residential tower. It will have a 3D landing page, a page listing homes, a page for each home, and an enquiry form. A small API provides the data.

- Live site: https://skyline-dun-six.vercel.app
- Code: `https://github.com/komalmodi12/skyline`

## What is done and what is not

Done:
- Project setup and deployment
- 60 sample homes and a shared data type
- The API for homes and enquiries
- Caching for the API

Still to do (marked TODO below):
- The listings page and the detail page
- The enquiry form on the page
- The 3D landing page
- Performance reports
- Credits and the AI usage file

## Built with

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Zod, for checking data
- Three.js for the 3D landing page (TODO)
- Vercel for hosting

## Run it on your computer

You need Node 20 or newer.

```bash
git clone <your-github-repo-url>
cd skyline
npm install
npm run dev
```

Then open http://localhost:3000. The sample data is already in the project, so nothing else is needed. To create the data again, run `npm run seed`.

## How the data works

There is one Zod schema for a home, in `src/types/property.ts`. The TypeScript type is made from that schema, so the two always match.

The seed script (`npm run seed`) makes 60 sample homes in 8 localities across 6 Indian cities. Prices are in lakh rupees (100 lakh is 1 crore). The script uses a fixed random seed, so it gives the same data every time.

Only server code should import `src/lib/properties.ts`. If a browser component imported it, all the data would be sent to the browser.

## The API

**GET /api/properties** returns a list of homes. You can use these options in the URL:
- `q` to search the title and locality
- `minPrice` and `maxPrice` in lakh
- `bhk` from 1 to 4
- `type` as Apartment, Penthouse or Villa
- `furnished` as true or false
- `sort` as newest, price_asc or price_desc
- `page` and `limit` (up to 24 per page, 12 by default)

The answer looks like `{ items, total, page, hasMore }`. A wrong option returns status 400 with a message that explains what is wrong.

**GET /api/properties/:slug** returns one home. If the slug does not exist it returns 404.

**GET /api/properties/:slug/similar** returns up to 4 homes with the same locality or the same BHK. It never includes the home itself.

**POST /api/enquiries** saves an enquiry. It needs:
- `name` (2 to 80 characters)
- `phone` (a 10-digit Indian mobile number)
- `email` (optional)
- `message` (at least 10 characters)
- `visitDate` (today or a later date)

It answers with:
- 201 when saved
- 400 when something is invalid, with a message for each field
- 429 when one IP sends more than 5 enquiries in 10 minutes

There is also a hidden field called `website`. Real users leave it empty. If a bot fills it, the API pretends it worked but saves nothing.

## Caching

The home data only changes when the site is deployed, so the API can be cached for a long time. These endpoints send:

`Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`

In simple words:
- The browser keeps the answer for 1 minute.
- The CDN keeps it for 1 hour.
- After that, the CDN can show the old answer for a while and refresh it in the background.

Error answers and the enquiry endpoint use `no-store`, so mistakes and personal data are never cached.

On Vercel, the browser only sees `public, max-age=60`. Vercel uses the other two settings itself and removes them before sending the answer. The cache still works, and repeat requests show `x-vercel-cache: HIT`.

TODO: how the listing and detail pages are cached.

## 3D landing page

TODO: how the 3D scene loads, what each scroll scene does, and what shows when 3D is not available.

## Performance

TODO: results from the deployed site. The reports will be saved in the `reports` folder.

## Known issues

- Enquiries are saved to a file on your computer. On Vercel the file system is not permanent, so saved enquiries can be lost. The saving code is in one function, so it is easy to replace with a database.
- The rate limit is kept in memory. On Vercel each server instance has its own count, so the limit is only approximate.
- Home photos are placeholders for now (TODO).

## With one more day

- Save enquiries in a real database such as Neon Postgres.
- Keep the rate limit in a shared store such as Upstash Redis.
- Add tests for the filters and the API checks, and one Playwright test.

## Credits

TODO: list every image, font and asset with its source and licence.

## AI usage

TODO: see `AI_USAGE.md`.