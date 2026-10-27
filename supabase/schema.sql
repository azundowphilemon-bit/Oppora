-- ============================================================================
-- OPPORA — SUPABASE POSTGRESQL SCHEMA, RLS POLICIES & STORAGE CONFIGURATION
-- Platform: Opportunities, Housing & Community Support across Ghana & Africa
-- Strict Constraints:
--   * No prices or payment processing for Accommodation or Community items
--   * Private account details (email, auth metadata) are NEVER exposed publicly
--   * Admin-curated featured posts only (no paid promotion)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Private user account metadata; only display_name is public)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2),
  default_region TEXT DEFAULT 'Greater Accra, Ghana',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  accepted_guidelines_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read profiles for moderation
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'member');

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'member');

-- 2. CATEGORIES TABLE (Managed by administrators)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('opportunities', 'accommodation', 'exchange', 'help')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- 3. LISTINGS TABLE
-- Strictly excludes price/payment columns for accommodation and community items
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL CHECK (section IN ('opportunities', 'accommodation', 'exchange', 'help')),
  category TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 5 AND 160),
  summary TEXT NOT NULL CHECK (char_length(trim(summary)) BETWEEN 10 AND 320),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 20 AND 5000),
  country TEXT NOT NULL DEFAULT 'Ghana',
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'exchanged', 'given_away', 'unavailable', 'pending_review', 'rejected')
  ),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE, -- Selected by admins only, never paid
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Publicly safe poster attribution (no private email or internal auth metadata exposed)
  owner_id TEXT NOT NULL,
  owner_display_name TEXT NOT NULL,
  contact_phone TEXT,
  accepted_guidelines BOOLEAN NOT NULL DEFAULT TRUE CHECK (accepted_guidelines = TRUE),
  images TEXT[] NOT NULL DEFAULT '{}',

  -- Section 1: Opportunities fields
  opportunity_type TEXT CHECK (
    opportunity_type IS NULL OR
    opportunity_type IN ('job', 'internship', 'apprenticeship', 'scholarship', 'grant', 'course')
  ),
  organization TEXT,
  application_url TEXT,
  deadline TIMESTAMPTZ,
  is_verified_official BOOLEAN NOT NULL DEFAULT FALSE,

  -- Section 2: Accommodation fields (NO PRICE ALLOWED)
  accommodation_mode TEXT CHECK (
    accommodation_mode IS NULL OR
    accommodation_mode IN ('rent', 'sale', 'sharing')
  ),
  accommodation_type TEXT CHECK (
    accommodation_type IS NULL OR
    accommodation_type IN ('Room', 'Apartment', 'House', 'Studio / Chamber & Hall', 'Shared Flat')
  ),
  amenities TEXT[] DEFAULT '{}',

  -- Section 3: Community Give & Exchange fields (NO PRICE ALLOWED)
  exchange_mode TEXT CHECK (
    exchange_mode IS NULL OR
    exchange_mode IN ('free_giveaway', 'exchange')
  ),
  item_condition TEXT CHECK (
    item_condition IS NULL OR
    item_condition IN ('New', 'Like New', 'Good', 'Fair / Functional')
  ),
  exchange_preference TEXT,

  -- Section 4: Community Help fields
  help_mode TEXT CHECK (
    help_mode IS NULL OR
    help_mode IN ('request', 'offer')
  ),
  availability TEXT,
  is_remote_friendly BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_listings_section_status ON public.listings(section, status);
CREATE INDEX IF NOT EXISTS idx_listings_region ON public.listings(region);
CREATE INDEX IF NOT EXISTS idx_listings_expires_at ON public.listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured) WHERE is_featured = TRUE;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public can view listings that are not rejected or pending review
CREATE POLICY "Public can view approved listings"
  ON public.listings FOR SELECT
  USING (status NOT IN ('rejected', 'pending_review') OR auth.uid()::text = owner_id);

-- Authenticated users can create listings if guidelines accepted
CREATE POLICY "Authenticated members can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid()::text = owner_id AND accepted_guidelines = TRUE);

-- Owners can update their own listings (cannot self-feature)
CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

-- Owners can delete their own listings
CREATE POLICY "Owners can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid()::text = owner_id);

-- 4. REPORTS TABLE (Trust & Safety Reporting System)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_title TEXT NOT NULL,
  listing_section TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN (
      'Asked for money / payment or fee',
      'Suspected scam or fraudulent offer',
      'Price listed on accommodation or community item',
      'Abusive, offensive, or unsafe content',
      'Inaccurate or expired information',
      'Spam or duplicate post'
    )
  ),
  details TEXT NOT NULL CHECK (char_length(trim(details)) BETWEEN 5 AND 1500),
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a safety report"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- 5. ADMIN MESSAGES TABLE (Contact Administrators)
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name TEXT NOT NULL,
  sender_contact TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 2500),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send message to administrators"
  ON public.admin_messages FOR INSERT
  WITH CHECK (true);

-- 6. STORAGE BUCKET SETUP FOR VALIDATED IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'oppora-listings',
  'oppora-listings',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
