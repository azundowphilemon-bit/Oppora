import {
  Listing,
  ListingStatus,
  SectionType,
  AccommodationMode,
  AccommodationType,
  ExchangeMode,
  ItemCondition,
  HelpMode,
  OpportunityType,
} from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates Ghana & African phone numbers.
 * Accepts:
 * - Ghana local mobile/landline: 020, 023, 024, 025, 026, 027, 028, 030, 050, 053, 054, 055, 057, 059 (10 digits)
 * - International E.164 format: +233..., +234..., +254..., +250..., +27... (9 to 15 digits)
 */
export function validateAfricanPhone(phone: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!cleaned) {
    return { valid: false, normalized: '', error: 'Contact phone number is required.' };
  }

  // Ghana local format e.g. 0241234567 -> +233241234567
  const ghanaLocalRegex = /^0(20|23|24|25|26|27|28|30|50|53|54|55|57|59)\d{7}$/;
  if (ghanaLocalRegex.test(cleaned)) {
    return {
      valid: true,
      normalized: `+233${cleaned.slice(1)}`,
    };
  }

  // International African / E.164 format e.g. +233241234567
  const intlRegex = /^\+[1-9]\d{8,14}$/;
  if (intlRegex.test(cleaned)) {
    return {
      valid: true,
      normalized: cleaned,
    };
  }

  return {
    valid: false,
    normalized: cleaned,
    error:
      'Please enter a valid Ghana number (e.g., 024 123 4567 or +233 24 123 4567) or African international format (+234..., +254...).',
  };
}

/**
 * Formats a normalized phone number for clean human reading and WhatsApp click-to-chat.
 */
export function formatPhoneForDisplay(phone?: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+233') && cleaned.length === 13) {
    return `+233 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

/**
 * Ensures Accommodation and Community Give & Exchange listings strictly do NOT include prices,
 * currency amounts, or payment demands.
 */
export function containsProhibitedPricePattern(text: string): boolean {
  const pricePatterns = [
    /\b(?:ghs|gh₵|cedi|cedis|usd|eur|gbp|ngn|kes|zar)\s*\d+/i,
    /\d+\s*(?:ghs|gh₵|cedis|cedi|usd|dollars|naira)/i,
    /[₵$€£₦]\s*\d+/,
    /\b(?:price|cost|rent\s+is|selling\s+for|asking\s+price|registration\s+fee|viewing\s+fee|inspection\s+fee)\s*[:=-]?\s*\d+/i,
  ];
  return pricePatterns.some((regex) => regex.test(text));
}

/**
 * Checks whether a listing has passed its expiry date or deadline.
 */
export function getEffectiveListingStatus(listing: Listing): ListingStatus {
  if (
    listing.status === 'exchanged' ||
    listing.status === 'given_away' ||
    listing.status === 'unavailable' ||
    listing.status === 'rejected' ||
    listing.status === 'pending_review'
  ) {
    return listing.status;
  }

  const now = Date.now();
  const expiresTime = new Date(listing.expiresAt).getTime();
  if (!Number.isNaN(expiresTime) && expiresTime < now) {
    return 'expired';
  }

  if (listing.section === 'opportunities' && listing.deadline) {
    const deadlineTime = new Date(listing.deadline).getTime();
    if (!Number.isNaN(deadlineTime) && deadlineTime < now) {
      return 'expired';
    }
  }

  return listing.status;
}

/**
 * Computes days remaining until expiry or deadline.
 */
export function getDaysRemaining(isoDate?: string | null): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Validates uploaded image metadata / data URLs on client and server.
 */
export function validateImageUpload(params: {
  mimeType: string;
  sizeBytes: number;
  fileName?: string;
}): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(params.mimeType.toLowerCase())) {
    return {
      valid: false,
      error: 'Only JPG, PNG, and WebP photos are allowed for security.',
    };
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (params.sizeBytes <= 0 || params.sizeBytes > maxBytes) {
    return {
      valid: false,
      error: 'Each uploaded photo must be under 5 MB.',
    };
  }

  return { valid: true };
}

/**
 * Server & client payload validation for creating or editing a listing.
 */
export function validateListingPayload(payload: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const section = String(payload.section || '') as SectionType;
  if (!['opportunities', 'accommodation', 'exchange', 'help'].includes(section)) {
    errors.push('Invalid section selected.');
  }

  const title = String(payload.title || '').trim();
  if (title.length < 5 || title.length > 160) {
    errors.push('Title must be between 5 and 160 characters.');
  }

  const description = String(payload.description || '').trim();
  if (description.length < 20 || description.length > 5000) {
    errors.push('Detailed description must be between 20 and 5,000 characters.');
  }

  const rawSummary = String(payload.summary || '').trim();
  const summary =
    rawSummary.length >= 10
      ? rawSummary.slice(0, 320)
      : description.replace(/\s+/g, ' ').slice(0, 220);
  if (summary.length < 10) {
    errors.push('Please provide at least 20 characters in the description.');
  }

  const category = String(payload.category || '').trim();
  if (!category) {
    errors.push('Please select a category.');
  }

  const region = String(payload.region || '').trim();
  if (!region) {
    errors.push('Please select a region or location.');
  }

  const city = String(payload.city || '').trim();
  if (city.length < 2 || city.length > 80) {
    errors.push('Please enter a valid city, town, or neighborhood.');
  }

  const ownerDisplayName = String(payload.ownerDisplayName || '').trim();
  if (ownerDisplayName.length < 2 || ownerDisplayName.length > 80) {
    errors.push('Please provide your public display name or organization name.');
  }

  if (payload.acceptedGuidelines !== true) {
    errors.push('You must accept the Oppora Community Trust & Safety Guidelines before posting.');
  }

  // Reject any prohibited price fields on accommodation or exchange
  if (
    'price' in payload ||
    'amount' in payload ||
    'cost' in payload ||
    'currency' in payload
  ) {
    if (payload.price || payload.amount || payload.cost) {
      errors.push('Oppora strictly prohibits prices, fees, or payment fields on listings.');
    }
  }

  if (section === 'accommodation' || section === 'exchange') {
    if (
      containsProhibitedPricePattern(title) ||
      containsProhibitedPricePattern(summary) ||
      containsProhibitedPricePattern(description)
    ) {
      errors.push(
        'Prices, currency amounts, and viewing/inspection fees are strictly prohibited in Accommodation and Community Give & Exchange listings.'
      );
    }
  }

  // Validate contact phone for accommodation, exchange, and help
  const rawPhone = String(payload.contactPhone || '').trim();
  if (section !== 'opportunities' || rawPhone) {
    const phoneCheck = validateAfricanPhone(rawPhone);
    if (!phoneCheck.valid) {
      errors.push(phoneCheck.error || 'Invalid contact phone number.');
    }
  }

  // Section-specific rules
  if (section === 'opportunities') {
    const oppType = String(payload.opportunityType || '') as OpportunityType;
    if (
      !['job', 'internship', 'apprenticeship', 'scholarship', 'grant', 'course'].includes(
        oppType
      )
    ) {
      errors.push('Please select a valid opportunity type.');
    }
    const appUrl = String(payload.applicationUrl || '').trim();
    if (!appUrl) {
      errors.push('Official application link (https://...) is required for opportunities.');
    } else {
      try {
        const parsed = new URL(appUrl);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          errors.push('Official application link must start with https:// or http://.');
        }
      } catch {
        errors.push('Please enter a valid URL for the official application link.');
      }
    }
  }

  if (section === 'accommodation') {
    const accMode = String(payload.accommodationMode || '') as AccommodationMode;
    if (!['rent', 'sale', 'sharing'].includes(accMode)) {
      errors.push('Please clearly specify if the accommodation is for rent, sale, or sharing.');
    }
    const accType = String(payload.accommodationType || '') as AccommodationType;
    if (
      !['Room', 'Apartment', 'House', 'Studio / Chamber & Hall', 'Shared Flat'].includes(
        accType
      )
    ) {
      errors.push('Please select a valid accommodation type.');
    }
  }

  if (section === 'exchange') {
    const exMode = String(payload.exchangeMode || '') as ExchangeMode;
    if (!['free_giveaway', 'exchange'].includes(exMode)) {
      errors.push('Please specify whether this item is a Free Give-Away or for Community Exchange.');
    }
    const condition = String(payload.itemCondition || '') as ItemCondition;
    if (!['New', 'Like New', 'Good', 'Fair / Functional'].includes(condition)) {
      errors.push('Please select the item condition.');
    }
  }

  if (section === 'help') {
    const helpMode = String(payload.helpMode || '') as HelpMode;
    if (!['request', 'offer'].includes(helpMode)) {
      errors.push('Please specify whether you are Requesting Assistance or Offering Assistance.');
    }
  }

  // Images validation
  if (Array.isArray(payload.images)) {
    if (payload.images.length > 4) {
      errors.push('You can upload a maximum of 4 photos per listing.');
    }
    for (const img of payload.images) {
      if (typeof img !== 'string') {
        errors.push('Invalid image format.');
        break;
      }
      if (
        !img.startsWith('data:image/jpeg;base64,') &&
        !img.startsWith('data:image/png;base64,') &&
        !img.startsWith('data:image/webp;base64,') &&
        !img.startsWith('data:image/svg+xml;') &&
        !img.startsWith('https://') &&
        !img.startsWith('/')
      ) {
        errors.push('Uploaded images must be valid JPG, PNG, or WebP files.');
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
