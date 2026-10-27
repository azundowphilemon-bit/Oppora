import fs from 'fs';
import path from 'path';
import {
  AdminMessage,
  CategoryItem,
  Listing,
  ListingStatus,
  SafetyReport,
  SectionType,
} from './types';
import { INITIAL_CATEGORIES, VERIFIED_OFFICIAL_OPPORTUNITY_PORTALS } from './seed-data';
import { getEffectiveListingStatus } from './validation';
import { getSupabaseServerClient, isSupabaseConfigured } from './supabase';

interface LocalStoreData {
  categories: CategoryItem[];
  listings: Listing[];
  reports: SafetyReport[];
  adminMessages: AdminMessage[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'oppora-store.json');

function ensureLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initialData: LocalStoreData = {
        categories: INITIAL_CATEGORIES,
        listings: VERIFIED_OFFICIAL_OPPORTUNITY_PORTALS,
        reports: [],
        adminMessages: [],
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as LocalStoreData;
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_CATEGORIES,
      listings: Array.isArray(parsed.listings)
        ? parsed.listings
        : VERIFIED_OFFICIAL_OPPORTUNITY_PORTALS,
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      adminMessages: Array.isArray(parsed.adminMessages) ? parsed.adminMessages : [],
    };
  } catch {
    return {
      categories: INITIAL_CATEGORIES,
      listings: VERIFIED_OFFICIAL_OPPORTUNITY_PORTALS,
      reports: [],
      adminMessages: [],
    };
  }
}

function saveLocalStore(data: LocalStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist local store:', err);
  }
}

function mapSupabaseRowToListing(row: Record<string, unknown>): Listing {
  const listing: Listing = {
    id: String(row.id),
    section: row.section as SectionType,
    category: String(row.category),
    title: String(row.title),
    summary: String(row.summary),
    description: String(row.description),
    country: String(row.country || 'Ghana'),
    region: String(row.region),
    city: String(row.city),
    status: row.status as ListingStatus,
    isFeatured: Boolean(row.is_featured),
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    ownerId: String(row.owner_id),
    ownerDisplayName: String(row.owner_display_name),
    contactPhone: row.contact_phone ? String(row.contact_phone) : undefined,
    acceptedGuidelines: Boolean(row.accepted_guidelines),
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    opportunityType: row.opportunity_type
      ? (String(row.opportunity_type) as Listing['opportunityType'])
      : undefined,
    organization: row.organization ? String(row.organization) : undefined,
    applicationUrl: row.application_url ? String(row.application_url) : undefined,
    deadline: row.deadline ? String(row.deadline) : null,
    isVerifiedOfficial: Boolean(row.is_verified_official),
    accommodationMode: row.accommodation_mode
      ? (String(row.accommodation_mode) as Listing['accommodationMode'])
      : undefined,
    accommodationType: row.accommodation_type
      ? (String(row.accommodation_type) as Listing['accommodationType'])
      : undefined,
    amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
    exchangeMode: row.exchange_mode
      ? (String(row.exchange_mode) as Listing['exchangeMode'])
      : undefined,
    itemCondition: row.item_condition
      ? (String(row.item_condition) as Listing['itemCondition'])
      : undefined,
    exchangePreference: row.exchange_preference ? String(row.exchange_preference) : undefined,
    helpMode: row.help_mode ? (String(row.help_mode) as Listing['helpMode']) : undefined,
    availability: row.availability ? String(row.availability) : undefined,
    isRemoteFriendly: Boolean(row.is_remote_friendly),
  };

  listing.status = getEffectiveListingStatus(listing);
  return listing;
}

export async function getAllListings(options?: {
  section?: SectionType;
  includeModerationQueue?: boolean;
}): Promise<Listing[]> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.section) {
        query = query.eq('section', options.section);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((r) => mapSupabaseRowToListing(r as Record<string, unknown>));
        return options?.includeModerationQueue
          ? mapped
          : mapped.filter((l) => l.status !== 'rejected' && l.status !== 'pending_review');
      }
    }
  }

  const store = ensureLocalStore();
  const normalized = store.listings
    .map((item) => ({
      ...item,
      status: getEffectiveListingStatus(item),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let filtered = normalized;
  if (options?.section) {
    filtered = filtered.filter((item) => item.section === options.section);
  }
  if (!options?.includeModerationQueue) {
    filtered = filtered.filter(
      (item) => item.status !== 'rejected' && item.status !== 'pending_review'
    );
  }
  return filtered;
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) {
        return mapSupabaseRowToListing(data as Record<string, unknown>);
      }
    }
  }

  const store = ensureLocalStore();
  const found = store.listings.find((item) => item.id === id);
  if (!found) return null;
  return {
    ...found,
    status: getEffectiveListingStatus(found),
  };
}

export async function createListingRecord(listing: Listing): Promise<Listing> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          id: listing.id,
          section: listing.section,
          category: listing.category,
          title: listing.title,
          summary: listing.summary,
          description: listing.description,
          country: listing.country,
          region: listing.region,
          city: listing.city,
          status: listing.status,
          is_featured: listing.isFeatured,
          expires_at: listing.expiresAt,
          owner_id: listing.ownerId,
          owner_display_name: listing.ownerDisplayName,
          contact_phone: listing.contactPhone || null,
          accepted_guidelines: listing.acceptedGuidelines,
          images: listing.images,
          opportunity_type: listing.opportunityType || null,
          organization: listing.organization || null,
          application_url: listing.applicationUrl || null,
          deadline: listing.deadline || null,
          is_verified_official: listing.isVerifiedOfficial || false,
          accommodation_mode: listing.accommodationMode || null,
          accommodation_type: listing.accommodationType || null,
          amenities: listing.amenities || [],
          exchange_mode: listing.exchangeMode || null,
          item_condition: listing.itemCondition || null,
          exchange_preference: listing.exchangePreference || null,
          help_mode: listing.helpMode || null,
          availability: listing.availability || null,
          is_remote_friendly: listing.isRemoteFriendly || false,
        })
        .select('*')
        .single();

      if (!error && data) {
        return mapSupabaseRowToListing(data as Record<string, unknown>);
      }
    }
  }

  const store = ensureLocalStore();
  store.listings.unshift(listing);
  saveLocalStore(store);
  return listing;
}

export async function updateListingRecord(
  id: string,
  updates: Partial<Listing>
): Promise<Listing | null> {
  const store = ensureLocalStore();
  const index = store.listings.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Listing = {
    ...store.listings[index],
    ...updates,
    id, // immutable
    updatedAt: new Date().toISOString(),
  };

  store.listings[index] = updated;
  saveLocalStore(store);

  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      await supabase
        .from('listings')
        .update({
          title: updated.title,
          summary: updated.summary,
          description: updated.description,
          category: updated.category,
          region: updated.region,
          city: updated.city,
          status: updated.status,
          is_featured: updated.isFeatured,
          expires_at: updated.expiresAt,
          contact_phone: updated.contactPhone || null,
          images: updated.images,
          updated_at: updated.updatedAt,
        })
        .eq('id', id);
    }
  }

  return {
    ...updated,
    status: getEffectiveListingStatus(updated),
  };
}

export async function deleteListingRecord(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      await supabase.from('listings').delete().eq('id', id);
    }
  }

  const store = ensureLocalStore();
  const initialLength = store.listings.length;
  store.listings = store.listings.filter((item) => item.id !== id);
  if (store.listings.length !== initialLength) {
    saveLocalStore(store);
    return true;
  }
  return false;
}

export async function getCategories(section?: SectionType): Promise<CategoryItem[]> {
  const store = ensureLocalStore();
  if (section) {
    return store.categories.filter((c) => c.section === section && c.isActive);
  }
  return store.categories;
}

export async function addCategoryRecord(category: CategoryItem): Promise<CategoryItem> {
  const store = ensureLocalStore();
  store.categories.push(category);
  saveLocalStore(store);
  return category;
}

export async function toggleCategoryRecord(id: string): Promise<CategoryItem | null> {
  const store = ensureLocalStore();
  const found = store.categories.find((c) => c.id === id);
  if (!found) return null;
  found.isActive = !found.isActive;
  saveLocalStore(store);
  return found;
}

export async function getSafetyReports(): Promise<SafetyReport[]> {
  const store = ensureLocalStore();
  return store.reports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createSafetyReport(report: SafetyReport): Promise<SafetyReport> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      await supabase.from('reports').insert({
        id: report.id,
        listing_id: report.listingId,
        listing_title: report.listingTitle,
        listing_section: report.listingSection,
        reason: report.reason,
        details: report.details,
        reporter_contact: report.reporterContact || null,
        status: report.status,
      });
    }
  }

  const store = ensureLocalStore();
  store.reports.unshift(report);
  saveLocalStore(store);
  return report;
}

export async function updateSafetyReportStatus(
  id: string,
  status: SafetyReport['status'],
  adminNotes?: string
): Promise<SafetyReport | null> {
  const store = ensureLocalStore();
  const report = store.reports.find((r) => r.id === id);
  if (!report) return null;
  report.status = status;
  if (adminNotes !== undefined) {
    report.adminNotes = adminNotes;
  }
  saveLocalStore(store);
  return report;
}

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const store = ensureLocalStore();
  return store.adminMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createAdminMessage(msg: AdminMessage): Promise<AdminMessage> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseServerClient(true);
    if (supabase) {
      await supabase.from('admin_messages').insert({
        id: msg.id,
        sender_name: msg.senderName,
        sender_contact: msg.senderContact,
        subject: msg.subject,
        message: msg.message,
        status: msg.status,
      });
    }
  }

  const store = ensureLocalStore();
  store.adminMessages.unshift(msg);
  saveLocalStore(store);
  return msg;
}

export async function markAdminMessageReviewed(id: string): Promise<AdminMessage | null> {
  const store = ensureLocalStore();
  const msg = store.adminMessages.find((m) => m.id === id);
  if (!msg) return null;
  msg.status = 'reviewed';
  saveLocalStore(store);
  return msg;
}
