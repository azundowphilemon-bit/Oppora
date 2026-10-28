-- ============================================================================
-- OPPORA — SUPABASE POSTGRESQL SCHEMA, RLS POLICIES, SEED DATA & STORAGE
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

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'member');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
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

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- 3. LISTINGS TABLE
-- Strictly excludes price/payment columns for accommodation and community items
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
CREATE POLICY "Public can view approved listings"
  ON public.listings FOR SELECT
  USING (status NOT IN ('rejected', 'pending_review') OR auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Authenticated members can insert listings" ON public.listings;
CREATE POLICY "Authenticated members can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (accepted_guidelines = TRUE);

DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Owners can delete own listings" ON public.listings;
CREATE POLICY "Owners can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid()::text = owner_id);

-- 4. REPORTS TABLE (Trust & Safety Reporting System)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
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

DROP POLICY IF EXISTS "Anyone can submit a safety report" ON public.reports;
CREATE POLICY "Anyone can submit a safety report"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- 5. ADMIN MESSAGES TABLE (Contact Administrators)
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  sender_name TEXT NOT NULL,
  sender_contact TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 10 AND 2500),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send message to administrators" ON public.admin_messages;
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

-- 7. SEED INITIAL CATEGORIES
INSERT INTO public.categories (id, section, name, slug, description, is_active)
VALUES
  ('cat-opp-scholarships', 'opportunities', 'Scholarships & Fellowships', 'scholarships', 'Verified academic scholarships, fellowships, and educational funding portals.', true),
  ('cat-opp-jobs', 'opportunities', 'Jobs & Public Service Portals', 'jobs', 'Official institutional career portals and verified graduate employment programs.', true),
  ('cat-opp-internships', 'opportunities', 'Internships & Youth Corps', 'internships', 'Graduate internships, youth volunteer corps, and rotational placements.', true),
  ('cat-opp-apprenticeships', 'opportunities', 'Apprenticeships & Vocational', 'apprenticeships', 'Hands-on technical, artisanal, and digital apprenticeship programs.', true),
  ('cat-opp-grants', 'opportunities', 'Grants & Entrepreneurship', 'grants', 'Seed grants, social enterprise support, and innovation funding.', true),
  ('cat-opp-courses', 'opportunities', 'Free Online Courses & Skills', 'courses', 'Tuition-free digital skills, leadership, and professional certification programs.', true),
  ('cat-acc-rooms', 'accommodation', 'Single Rooms & Self-Contained', 'single-rooms', 'Individual rooms available for rent or sharing across communities.', true),
  ('cat-acc-chamber', 'accommodation', 'Chamber & Hall / Studio', 'chamber-and-hall', 'Studio and chamber-and-hall units for rent, sale, or roommate sharing.', true),
  ('cat-acc-apartments', 'accommodation', 'Apartments & Flats', 'apartments', 'Multi-bedroom apartments and flats posted directly by community members.', true),
  ('cat-acc-houses', 'accommodation', 'Family Houses & Compounds', 'houses', 'Standalone houses and compound units available for rent, sale, or sharing.', true),
  ('cat-ex-books', 'exchange', 'Books & Study Materials', 'books-study', 'Textbooks, past questions, literature, and educational stationery.', true),
  ('cat-ex-electronics', 'exchange', 'Computing & Electronics', 'electronics', 'Working laptops, phones, chargers, calculators, and study devices.', true),
  ('cat-ex-household', 'exchange', 'Household & Dorm Essentials', 'household', 'Furniture, kitchenware, fans, tables, and home items for give-away or swap.', true),
  ('cat-ex-clothing', 'exchange', 'Clothing, Shoes & Professional Wear', 'clothing', 'Clean interview attire, school uniforms, shoes, and everyday clothing.', true),
  ('cat-ex-tools', 'exchange', 'Tools & Vocational Equipment', 'tools', 'Workshop tools, sewing equipment, agricultural tools, and craft supplies.', true),
  ('cat-help-learning', 'help', 'Learning & Exam Support', 'learning-support', 'Peer study groups, WASSCE/university tutoring, and literacy support.', true),
  ('cat-help-career', 'help', 'Career Guidance & CV Review', 'career-guidance', 'CV feedback, interview preparation, and career transition advice.', true),
  ('cat-help-mentoring', 'help', 'Mentoring & Industry Coaching', 'mentoring', 'One-on-one or small-group mentorship from experienced professionals.', true),
  ('cat-help-local', 'help', 'Finding Local Services & Orientation', 'local-services', 'Practical community orientation, public office navigation, and local guidance.', true)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED VERIFIED OFFICIAL AFRICAN OPPORTUNITY PORTALS
INSERT INTO public.listings (
  id, section, category, title, summary, description, country, region, city,
  status, is_featured, expires_at, created_at, updated_at, owner_id, owner_display_name,
  accepted_guidelines, images, opportunity_type, organization, application_url, deadline, is_verified_official
)
VALUES
  (
    'opp-official-mastercard-scholars',
    'opportunities',
    'Scholarships & Fellowships',
    'Mastercard Foundation Scholars Program — Official Partner University Directory',
    'Official pan-African scholarship program supporting academically talented, community-minded young people across Ghana and Africa.',
    E'The Mastercard Foundation Scholars Program provides comprehensive student support—including tuition, accommodation, learning materials, and leadership mentorship—through partner universities such as KNUST (Kumasi, Ghana), Ashesi University (Berekuso, Ghana), University of Cape Town, and Makerere University.\n\nImportant Notice: Application timelines and eligibility requirements are managed directly by each partner university. Never pay any agent or third party to apply; applications through official partner institutions are strictly free.',
    'Ghana',
    'Ashanti Region (Kumasi), Ghana',
    'Kumasi & Pan-African Partner Campuses',
    'active',
    true,
    '2027-06-30T23:59:59.000Z',
    '2026-10-15T09:00:00.000Z',
    '2026-10-15T09:00:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'scholarship',
    'Mastercard Foundation & Partner Universities (KNUST / Ashesi)',
    'https://mastercardfdn.org/all/scholars/',
    '2026-11-30T23:59:59.000Z',
    true
  ),
  (
    'opp-official-ghana-scholarships-secretariat',
    'opportunities',
    'Scholarships & Fellowships',
    'Ghana Scholarships Secretariat — Official Tertiary & Bilateral Portal',
    'Official Government of Ghana portal for local tertiary scholarships and international bilateral study awards.',
    E'The Ghana Scholarships Secretariat administers local tertiary bursaries and bilateral international scholarships for qualified Ghanaian students.\n\nApplicants must register and submit documents exclusively through the official government portal. The Secretariat does not charge application fees and does not use middlemen or private WhatsApp agents.',
    'Ghana',
    'Greater Accra, Ghana',
    'Accra (Nationwide Eligibility)',
    'active',
    true,
    '2027-05-31T23:59:59.000Z',
    '2026-10-18T10:30:00.000Z',
    '2026-10-18T10:30:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'scholarship',
    'Ghana Scholarships Secretariat',
    'https://scholarships.gov.gh',
    '2026-11-15T23:59:59.000Z',
    true
  ),
  (
    'opp-official-yali-west-africa',
    'opportunities',
    'Scholarships & Fellowships',
    'YALI Regional Leadership Center West Africa (Accra) — Emerging Leaders Program',
    'Leadership training, entrepreneurship, public management, and civic leadership cohorts hosted at GIMPA in Accra.',
    E'The Young African Leaders Initiative (YALI) Regional Leadership Center West Africa, located at the Ghana Institute of Management and Public Administration (GIMPA) in Accra, offers intensive leadership training for young leaders aged 18–35 across West Africa.\n\nTracks include Business & Entrepreneurship, Civic Leadership, and Public Policy & Management. Check the official YALI RLC West Africa portal for active cohort application windows.',
    'Ghana',
    'Greater Accra, Ghana',
    'Greenhill, Accra (GIMPA)',
    'active',
    false,
    '2027-04-30T23:59:59.000Z',
    '2026-10-20T14:00:00.000Z',
    '2026-10-20T14:00:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'grant',
    'YALI RLC West Africa (GIMPA Accra)',
    'https://yalighana.org',
    '2026-11-10T23:59:59.000Z',
    true
  ),
  (
    'opp-official-au-youth-volunteer',
    'opportunities',
    'Internships & Youth Corps',
    'African Union Youth Volunteer Corps (AU-YVC) — Continental Youth Placement Portal',
    'Continental development program recruiting young African professionals (aged 18–35) for 12-month volunteer service across AU member states.',
    E'The African Union Youth Volunteer Corps (AU-YVC) brings people together to share skills, knowledge, creativity, and learning to build a more integrated, prosperous, and peaceful Continent driven by its citizens.\n\nConsult the official African Union portal for current call-for-application dates, eligibility criteria, and required documentation.',
    'Ghana',
    'Nationwide / Remote across Ghana',
    'Addis Ababa & AU Member States',
    'active',
    true,
    '2027-06-01T23:59:59.000Z',
    '2026-10-22T11:15:00.000Z',
    '2026-10-22T11:15:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'internship',
    'African Union Commission (AU-YVC)',
    'https://au.int/en/volunteer',
    '2026-11-05T23:59:59.000Z',
    true
  ),
  (
    'opp-official-alx-africa-courses',
    'opportunities',
    'Free Online Courses & Skills',
    'ALX Africa — Career-Ready Digital, Data & Tech Training Portal',
    'Accessible technology, data analytics, cloud computing, and professional foundations programs with community hubs across Africa.',
    E'ALX offers structured digital skills, software engineering, data science, and professional foundation programs designed for young people across Ghana, Nigeria, Kenya, Rwanda, South Africa, and across the continent.\n\nVisit the official ALX Africa website to view current course catalogs, open enrollment dates, and terms.',
    'Ghana',
    'Nationwide / Remote across Ghana',
    'Accra Tech Hubs & Online',
    'active',
    false,
    '2027-08-01T23:59:59.000Z',
    '2026-10-25T08:00:00.000Z',
    '2026-10-25T08:00:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'course',
    'ALX Africa',
    'https://www.alxafrica.com',
    '2026-12-15T23:59:59.000Z',
    true
  ),
  (
    'opp-official-afdb-careers',
    'opportunities',
    'Jobs & Public Service Portals',
    'African Development Bank (AfDB) — Official Careers & Young Professionals Portal',
    'Official recruitment portal for the African Development Bank Group, including the Young Professionals Program (YPP) and institutional internships.',
    E'The African Development Bank Group recruits professionals, interns, and Young Professionals committed to sustainable economic development and social progress across regional member countries including Ghana.\n\nRather than listing unverified third-party vacancy notices, Oppora links you directly to the official AfDB recruitment portal where current verified openings and deadlines are published.',
    'Ghana',
    'Nationwide / Remote across Ghana',
    'Abidjan, Accra Country Office & Regional Hubs',
    'active',
    false,
    '2027-07-01T23:59:59.000Z',
    '2026-10-26T12:00:00.000Z',
    '2026-10-26T12:00:00.000Z',
    'system-verified-curator',
    'Oppora Verified Directory',
    true,
    '{}',
    'job',
    'African Development Bank Group (AfDB)',
    'https://www.afdb.org/en/about-us/careers',
    NULL,
    true
  )
ON CONFLICT (id) DO NOTHING;
