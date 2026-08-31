# Jan Darpan — Next.js Rewrite

_Your Voice. Our Responsibility. Better India._

Civic issue reporting platform for Kanpur, rewritten from the original static
HTML/CSS/JS prototype into Next.js 14 (App Router) + TypeScript + Tailwind +
MongoDB + Clerk auth.

## What's real vs. stubbed in this pass

**Real (backed by MongoDB, not localStorage):**
- Areas and their civic scores
- Issues: create, list, filter, confirm, admin status updates, delete
- Citizen accounts and roles (Clerk)
- Citizen civic points / gamification counters (`CitizenProfile`)
- Admin dashboard: overview stats, issue management, area score editing, user role management

**Now real (added in this pass):**
- **Photo upload** — `/api/upload` uploads to Cloudinary and stores the returned `secure_url` on the `Issue` document. Requires Cloudinary env vars (below) or the upload endpoint will return a clear 500 error rather than silently failing.
- **Ward map** — replaced the stylized SVG with a real Leaflet map (`components/CivicMap.tsx`) using OpenStreetMap tiles and approximate real lat/lng for each ward (`lib/wardCoords.ts`). These are locality-level approximations, not surveyed municipal boundaries.
- **Homepage** — all original sections restored: hero, Kanpur Civic Pulse map + city score gauge, "How it works" civic loop, Leaderboard, and Azadi Civic Challenge (now computed live from real issue/confirm counts instead of hardcoded).
- **Branding** — renamed to Jan Darpan, using the provided logo as both the header logo and site favicon (`public/logo.png`, `app/icon.png`).
- **Mobile responsiveness** — header collapses into a hamburger menu below the `md` breakpoint; all grids/sections reflow to single column on small screens.

**Still stubbed / flagged, not fixed silently:**
- **Notifications, real user-facing leaderboard tied to individual accounts** — not built.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **MongoDB Atlas**
   - Create a free cluster at https://www.mongodb.com/cloud/atlas
   - Create a database user and allow network access from your IP (or `0.0.0.0/0` for local dev)
   - Copy the connection string

3. **Clerk**
   - Create an application at https://dashboard.clerk.com
   - Copy the Publishable Key and Secret Key
   - In Clerk dashboard → **Sessions** → **Customize session token**, add a claim so `publicMetadata` is available in `sessionClaims` (this app's `middleware.ts` reads `sessionClaims.publicMetadata.role`):
     ```json
     { "publicMetadata": "{{user.public_metadata}}" }
     ```
     Without this step, the admin role check in `middleware.ts` and every API route's `requireAdmin()` will always see `undefined` and block you.

4. **Environment variables**
   ```
   cp .env.example .env.local
   ```
   Fill in `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

   **Cloudinary (for real photo uploads on reports):**
   - Sign up free at https://cloudinary.com
   - From your dashboard, copy **Cloud Name**, **API Key**, **API Secret**
   - Fill in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env.local`
   - Without these, `/report`'s photo upload will show an error but the rest of the form still works — photo is optional

5. **Seed the database** with the original Jan Darpan prototype data (ports the exact ward/issue data from the old `data.js`):
   ```
   npm run seed
   ```

6. **Run the dev server**
   ```
   npm run dev
   ```
   Visit http://localhost:3000

7. **Make yourself an admin**
   - Sign up once through the app's `/sign-up` page
   - In the Clerk dashboard → Users → click your user → Metadata → set **Public metadata** to:
     ```json
     { "role": "admin" }
     ```
   - Sign out and back in (or refresh) so the new session token carries the claim
   - You should now see an "Admin" link in the header and be able to visit `/admin`

## Manual test checklist

I haven't run this end-to-end myself (no browser access here), so please verify these paths — this is what should work per the logic, not a confirmed "it works":

**Public browsing (no login required)**
- [ ] `/` loads and shows live counts (active issues, resolved, citizens) — should be `0`/small numbers before seeding, populated after `npm run seed`
- [ ] `/` shows the real Leaflet map with colored circle markers over Kanpur — click a marker to see its popup, click a category filter button above the map to recolor markers
- [ ] `/` shows all sections: hero, civic pulse map + city score ring, six-step "civic loop" cards, leaderboard, Azadi Civic Challenge progress bar
- [ ] Resize the browser to a phone width (or open on your phone) — header collapses to a hamburger icon; tapping it opens/closes the mobile nav; logo and title don't overflow
- [ ] Browser tab shows the Jan Darpan logo as the favicon
- [ ] `/areas` lists all 6 wards sorted by score, highest first
- [ ] Clicking a ward opens `/areas/[id]` with category bars and any active issues for that ward
- [ ] `/issues` lists all seeded issues; unauthenticated users see "Sign in to confirm" instead of a Confirm button

**Auth**
- [ ] `/sign-up` renders Clerk's form inside your custom card styling, not Clerk's default hosted page
- [ ] After signup, header shows your avatar (Clerk `UserButton`) instead of "Log in"
- [ ] Visiting `/admin` while NOT an admin redirects you to `/`

**Citizen report flow (the core thing judges will want to see)**
- [ ] Signed in, go to `/report`, fill category → area → landmark → severity → affected → submit
- [ ] After submit, you're redirected to `/issues` and your new issue appears at the top
- [ ] Refresh the page — the issue is still there (proves it's in MongoDB, not browser state)
- [ ] Check MongoDB Atlas directly (Browse Collections) — confirm a new document exists in the `issues` collection with your Clerk user ID in `reportedBy`

**Confirm flow**
- [ ] On `/issues`, signed in, click "Confirm" on an issue you didn't report — confirms count increments, button becomes disabled/"Confirmed"
- [ ] Try confirming the same issue twice — second attempt should be blocked (button already shows "Confirmed"; API also returns 409 if called directly)

**Admin flow**
- [ ] `/admin` shows overview stats matching what's actually in the DB
- [ ] `/admin/issues` — change an issue's status dropdown to `resolved` — reload `/areas/[id]` for that issue's area and confirm `activeIssues` went down and `resolvedThisMonth` went up
- [ ] `/admin/issues` — delete an issue — confirm it disappears from `/issues` too
- [ ] `/admin/areas` — expand a ward, drag a category slider, click "Save changes" — reload `/areas/[id]` and confirm the new score shows
- [ ] `/admin/users` — promote a citizen to admin — have them refresh their session (sign out/in) and confirm they now see the Admin link

**Known rough edges to expect**
- First deploy: if `sessionClaims.publicMetadata` is undefined even after setting the Clerk claim above, sign out and back in — session tokens don't always refresh on metadata changes until re-authentication.
- The seed script wipes `Area` and `Issue` collections every time you run it — don't run `npm run seed` again after you've started generating real reports through the app, or you'll lose them.
# JAN_DARPAN
