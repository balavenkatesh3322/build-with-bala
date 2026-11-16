<div align="center">

<img src="src/app/icon.svg" width="72" alt="Build with Bala logo" />

# Build with Bala

**Learn AI. Build with Bala.** Home of the **Bala App Store**: interactive AI apps, 3D explainers, tools and games. Try any app in seconds, see the problem it solves, and learn how it was built.

[![Next.js](https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![three.js](https://img.shields.io/badge/three.js-WebGL-111?style=for-the-badge&logo=threedotjs)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## ✨ What's inside

| Page | What it does |
|---|---|
| **Home** (`/`) | Interactive 3D clay field hero (touch wave, shockwave, click to spin), the App Store, a spinnable 3D ring, guided tour, leaderboard, pick-a-cube categories |
| **App Store** (`/apps`) | All 22 apps with search and category filters |
| **App page** (`/apps/[slug]`) | Demo video, screenshot gallery, problem / solution / value, how to use it, how it's built, business value, real-life example, why it was built, feature requests, share |
| **Today** (`/today`) | Daily quiz (graded on the server), poll, free drops, streak and XP |
| **Ideas** (`/ideas`) | Pain points, app ideas, feature requests, public roadmap |
| **Blog** (`/blog`) | Live from Medium |

Also: dark/light theme · ⌘K search · upvotes (one per visitor, no sign-up) · email subscribe · WhatsApp chat · "Pause motion" + reduced-motion support.

**SEO & sharing:** per-page titles and descriptions, canonical URLs, generated Open Graph and Twitter preview cards for the site and every app, favicon + Apple icon, web manifest, `sitemap.xml`, `robots.txt`, and JSON-LD (WebSite, Person, SoftwareApplication).

## 🧱 Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · three.js + react-three-fiber · Supabase (Postgres + RLS) · Vercel

## 🚀 Run locally

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:3000
```

The site runs without any keys. It falls back to the bundled catalogue, and forms show a friendly "not connected" message.

## 🗄️ Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run [`supabase/migration.sql`](supabase/migration.sql).
3. **Project Settings → API Keys**: copy the URL, the **publishable** key and a **secret** key into `.env`.
4. Load the catalogue: `npm run db:seed`.

**Security model:** browsers can only *read* public data (apps and aggregate counts through views). Every write (votes, ideas, subscribers, poll, quiz) goes through the API routes using the server-only secret key, so voter ids and emails can't be forged or read.

## ☁️ Deploy to Vercel

This repo includes a pre-configured [`vercel.json`](vercel.json) (framework, security headers, long-lived cache for `/media`).

**Option A: dashboard.** Go to [vercel.com/new](https://vercel.com/new), import `build-with-bala`, add the environment variables below, then deploy.

**Option B: terminal**
```bash
npx vercel --prod
```

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Secret** key, server-only. Never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | ➖ | Your domain, e.g. `https://buildwithbala.com`. Defaults to the Vercel production URL |
| `RESEND_API_KEY`, `EMAIL_FROM` | ➖ | Welcome email for new subscribers |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | ➖ | Google Search Console verification |

## 🛠️ Common tasks

- **Add or edit an app:** `src/lib/apps-data.ts`, then `npm run db:seed`.
- **Screenshots and write-ups per app:** `src/lib/app-details.ts` (images in `public/media/shots/`).
- **Daily quizzes and polls:** `src/lib/daily.ts`.
- **Moderate ideas:** Supabase → `ideas` table → set `approved = false` or change `status`.
- **Brand, links, WhatsApp number:** `src/lib/site.ts`.

## 📜 Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` (type-check) · `npm run db:seed`

---

<div align="center">Made by <a href="https://balavenkatesh.is-a.dev/">Bala Venkatesh</a> · <a href="https://www.instagram.com/ai.with.bala/">@ai.with.bala</a></div>
