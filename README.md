# Oppora — Opportunities, Housing & Community (Ghana & Africa)

**Oppora** is a mobile-first community platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** to connect people across Ghana and Africa with verified opportunities, community-shared accommodation, free item give & exchange, and structured community help.

---

## 1. Core Sections & Strict Constraints

1. **Opportunities (`/opportunities`)**:
   - Jobs, internships, apprenticeships, scholarships, grants, and free online courses.
   - Search, category & regional filters, closing-soon deadlines, and official application links.
   - **Strict Anti-Fabrication Policy**: Initial directory entries contain only real, verified official African public portals (`scholarships.gov.gh`, `mastercardfdn.org/all/scholars/`, `au.int/en/volunteer`, `yalighana.org`, `alxafrica.com`, `afdb.org`).
2. **Accommodation (`/accommodation`)**:
   - Rooms, studios (`Chamber & Hall`), apartments, and houses clearly labeled **For Rent**, **For Sale**, or **For Sharing**.
   - **Zero Prices or Payment Processing**: Both client and server validation (`src/lib/validation.ts`) block any price fields, currency symbols, or viewing fee demands.
3. **Community Give & Exchange (`/exchange`)**:
   - Personal items clearly distinguished between **100% Free Give-Away** and **Community Exchange** (item-for-item swap).
   - **Zero Cash, Checkout, or Shopping Cart**: No prices or payment processing anywhere.
4. **Community Help (`/help`)**:
   - Structured **Requesting Assistance** and **Offering Assistance** posts for learning support, career guidance, mentoring, and finding local services.
5. **No AI Features**:
   - Zero AI SDKs, LLMs, or AI API endpoints are used anywhere in the codebase.

---

## 2. Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run typecheck
npm run typecheck

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

> **Out-of-the-Box Persistence**: When Supabase environment variables are not yet configured in `.env.local`, `src/lib/repository.ts` automatically persists all listings, categories, safety reports, and administrator messages to `.data/oppora-store.json` on the server so every user flow works immediately.

---

## 3. Configuring Supabase (Database, Auth & Storage)

To connect Oppora to your production Supabase project:

1. Create a free project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run [`supabase/schema.sql`](./supabase/schema.sql). This creates:
   - `public.profiles` (with RLS ensuring private account details/emails are never exposed publicly)
   - `public.categories`
   - `public.listings` (with strict `CHECK` constraints and indexes)
   - `public.reports`
   - `public.admin_messages`
   - Storage bucket `oppora-listings` (restricted to `image/jpeg`, `image/png`, `image/webp` under 5MB)
3. Copy [`.env.example`](./.env.example) to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.org
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=oppora-listings
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
   ```
   *(Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components or prefix it with `NEXT_PUBLIC_`.)*

---

## 4. Deployment to GitHub & Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Oppora platform"
   git branch -M main
   git remote add origin https://github.com/your-org/oppora.git
   git push -u origin main
   ```
2. **Deploy on Vercel**:
   - Import the GitHub repository in [Vercel](https://vercel.com/new).
   - Add the environment variables from `.env.example` in the Vercel Project Settings.
   - Click **Deploy**.

---

## 5. Pre-Launch Hosting & Service Terms Checklist

Before launching publicly across Ghana and Africa, verify the following:
- **Vercel Terms**: Vercel's Free (Hobby) tier is restricted to non-commercial, personal use. If Oppora is operated by a registered NGO, social enterprise, or organization, review Vercel's Pro/Non-Profit sponsorship terms before public launch.
- **Supabase Free Tier Limits**: Includes 500 MB PostgreSQL database and 1 GB Storage; inactive free projects pause after 7 days of inactivity. Enable automatic backups or upgrade when community traffic grows.
- **Data Protection**: Ensure compliance with the **Ghana Data Protection Act, 2012 (Act 843)** regarding user contact numbers and takedown requests.
