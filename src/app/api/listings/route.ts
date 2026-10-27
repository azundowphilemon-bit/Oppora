import { NextRequest, NextResponse } from 'next/server';
import { createListingRecord, getAllListings } from '@/lib/repository';
import { Listing, SectionType } from '@/lib/types';
import { validateAfricanPhone, validateListingPayload } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as SectionType | null;
    const includeModeration = searchParams.get('moderation') === 'true';
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const category = (searchParams.get('category') || '').trim();
    const region = (searchParams.get('region') || '').trim();
    const statusFilter = (searchParams.get('status') || '').trim();

    let listings = await getAllListings({
      section: section || undefined,
      includeModerationQueue: includeModeration,
    });

    if (query) {
      listings = listings.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query) ||
          item.region.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.organization && item.organization.toLowerCase().includes(query))
      );
    }

    if (category && category !== 'all') {
      listings = listings.filter((item) => item.category === category);
    }

    if (region && region !== 'all') {
      listings = listings.filter((item) => item.region === region);
    }

    if (statusFilter && statusFilter !== 'all') {
      listings = listings.filter((item) => item.status === statusFilter);
    }

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    return NextResponse.json(
      { error: 'Unable to fetch listings at this time.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateListingPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0], errors: validation.errors },
        { status: 400 }
      );
    }

    const section = body.section as SectionType;
    const rawPhone = String(body.contactPhone || '').trim();
    const normalizedPhone = rawPhone ? validateAfricanPhone(rawPhone).normalized : undefined;

    // Default expiry: 45 days from creation unless specified
    const now = new Date();
    const defaultExpiry = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString();
    const expiresAt =
      typeof body.expiresAt === 'string' && body.expiresAt
        ? new Date(body.expiresAt).toISOString()
        : defaultExpiry;

    const newListing: Listing = {
      id: `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section,
      category: String(body.category).trim(),
      title: String(body.title).trim(),
      summary: String(body.summary).trim(),
      description: String(body.description).trim(),
      country: String(body.country || 'Ghana').trim(),
      region: String(body.region).trim(),
      city: String(body.city).trim(),
      // Community Help posts can optionally start active or be reviewed by moderators
      status: body.requireModeration === true ? 'pending_review' : 'active',
      isFeatured: false, // Never paid or user-selected; only admins can feature
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ownerId: String(body.ownerId || 'community-member').trim(),
      ownerDisplayName: String(body.ownerDisplayName).trim(),
      contactPhone: normalizedPhone,
      acceptedGuidelines: true,
      images: Array.isArray(body.images) ? (body.images as string[]).slice(0, 4) : [],

      // Section-specific fields
      opportunityType:
        section === 'opportunities'
          ? (String(body.opportunityType) as Listing['opportunityType'])
          : undefined,
      organization:
        section === 'opportunities' ? String(body.organization || '').trim() : undefined,
      applicationUrl:
        section === 'opportunities' ? String(body.applicationUrl || '').trim() : undefined,
      deadline:
        section === 'opportunities' && body.deadline
          ? new Date(String(body.deadline)).toISOString()
          : null,
      isVerifiedOfficial: false,

      accommodationMode:
        section === 'accommodation'
          ? (String(body.accommodationMode) as Listing['accommodationMode'])
          : undefined,
      accommodationType:
        section === 'accommodation'
          ? (String(body.accommodationType) as Listing['accommodationType'])
          : undefined,
      amenities:
        section === 'accommodation' && Array.isArray(body.amenities)
          ? (body.amenities as string[])
          : undefined,

      exchangeMode:
        section === 'exchange'
          ? (String(body.exchangeMode) as Listing['exchangeMode'])
          : undefined,
      itemCondition:
        section === 'exchange'
          ? (String(body.itemCondition) as Listing['itemCondition'])
          : undefined,
      exchangePreference:
        section === 'exchange' ? String(body.exchangePreference || '').trim() : undefined,

      helpMode:
        section === 'help' ? (String(body.helpMode) as Listing['helpMode']) : undefined,
      availability:
        section === 'help' ? String(body.availability || '').trim() : undefined,
      isRemoteFriendly: section === 'help' ? Boolean(body.isRemoteFriendly) : undefined,
    };

    const created = await createListingRecord(newListing);
    return NextResponse.json({ listing: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/listings error:', error);
    return NextResponse.json(
      { error: 'Unable to publish listing. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
