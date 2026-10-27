export type SectionType = 'opportunities' | 'accommodation' | 'exchange' | 'help';

export type ListingStatus =
  | 'active'
  | 'expired'
  | 'exchanged'
  | 'given_away'
  | 'unavailable'
  | 'pending_review'
  | 'rejected';

export type OpportunityType =
  | 'job'
  | 'internship'
  | 'apprenticeship'
  | 'scholarship'
  | 'grant'
  | 'course';

export type AccommodationMode = 'rent' | 'sale' | 'sharing';

export type AccommodationType =
  | 'Room'
  | 'Apartment'
  | 'House'
  | 'Studio / Chamber & Hall'
  | 'Shared Flat';

export type ExchangeMode = 'free_giveaway' | 'exchange';

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair / Functional';

export type HelpMode = 'request' | 'offer';

export interface CategoryItem {
  id: string;
  section: SectionType;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export interface Listing {
  id: string;
  section: SectionType;
  category: string;
  title: string;
  summary: string;
  description: string;
  country: string;
  region: string;
  city: string;
  status: ListingStatus;
  isFeatured: boolean; // Selected by administrators only, never paid promotion
  expiresAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  // Publicly safe poster attribution (never exposes private email or internal auth secrets)
  ownerId: string;
  ownerDisplayName: string;
  contactPhone?: string;
  acceptedGuidelines: boolean;
  images: string[];

  // Section 1: Opportunities
  opportunityType?: OpportunityType;
  organization?: string;
  applicationUrl?: string;
  deadline?: string | null;
  isVerifiedOfficial?: boolean;

  // Section 2: Accommodation (Strictly NO price fields allowed)
  accommodationMode?: AccommodationMode;
  accommodationType?: AccommodationType;
  amenities?: string[];

  // Section 3: Community Give & Exchange (Strictly NO price fields allowed)
  exchangeMode?: ExchangeMode;
  itemCondition?: ItemCondition;
  exchangePreference?: string;

  // Section 4: Community Help
  helpMode?: HelpMode;
  availability?: string;
  isRemoteFriendly?: boolean;
}

export type ReportReason =
  | 'Asked for money / payment or fee'
  | 'Suspected scam or fraudulent offer'
  | 'Price listed on accommodation or community item'
  | 'Abusive, offensive, or unsafe content'
  | 'Inaccurate or expired information'
  | 'Spam or duplicate post';

export interface SafetyReport {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSection: SectionType;
  reason: ReportReason;
  details: string;
  reporterContact?: string;
  status: 'open' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  senderName: string;
  senderContact: string;
  subject: string;
  message: string;
  status: 'unread' | 'reviewed';
  createdAt: string;
}

export interface PublicUserSession {
  id: string;
  displayName: string;
  defaultRegion: string;
  role: 'member' | 'admin';
  acceptedGuidelinesAt: string;
  authProvider: 'supabase' | 'local_session';
}

export const GHANA_AND_AFRICA_REGIONS = [
  'Greater Accra, Ghana',
  'Ashanti Region (Kumasi), Ghana',
  'Western Region (Takoradi), Ghana',
  'Central Region (Cape Coast), Ghana',
  'Eastern Region (Koforidua), Ghana',
  'Northern Region (Tamale), Ghana',
  'Volta Region (Ho), Ghana',
  'Bono Region (Sunyani), Ghana',
  'Upper East (Bolgatanga), Ghana',
  'Upper West (Wa), Ghana',
  'Lagos & West Africa Regional',
  'Nairobi & East Africa Regional',
  'Kigali & Central Africa Regional',
  'Pan-African / Remote across Africa',
] as const;

export const REPORT_REASONS: ReportReason[] = [
  'Asked for money / payment or fee',
  'Suspected scam or fraudulent offer',
  'Price listed on accommodation or community item',
  'Abusive, offensive, or unsafe content',
  'Inaccurate or expired information',
  'Spam or duplicate post',
];
