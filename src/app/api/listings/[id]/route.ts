import { NextRequest, NextResponse } from 'next/server';
import {
  deleteListingRecord,
  getListingById,
  updateListingRecord,
} from '@/lib/repository';
import { ListingStatus } from '@/lib/types';
import { containsProhibitedPricePattern, validateAfricanPhone } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const existing = await getListingById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === 'string') {
      const title = body.title.trim();
      if (title.length < 5 || title.length > 160) {
        return NextResponse.json(
          { error: 'Title must be between 5 and 160 characters.' },
          { status: 400 }
        );
      }
      if (
        (existing.section === 'accommodation' || existing.section === 'exchange') &&
        containsProhibitedPricePattern(title)
      ) {
        return NextResponse.json(
          { error: 'Prices and fees are strictly prohibited in this section.' },
          { status: 400 }
        );
      }
      updates.title = title;
    }

    if (typeof body.summary === 'string') {
      const summary = body.summary.trim();
      if (summary.length < 10 || summary.length > 320) {
        return NextResponse.json(
          { error: 'Summary must be between 10 and 320 characters.' },
          { status: 400 }
        );
      }
      if (
        (existing.section === 'accommodation' || existing.section === 'exchange') &&
        containsProhibitedPricePattern(summary)
      ) {
        return NextResponse.json(
          { error: 'Prices and fees are strictly prohibited in this section.' },
          { status: 400 }
        );
      }
      updates.summary = summary;
    }

    if (typeof body.description === 'string') {
      const description = body.description.trim();
      if (description.length < 20 || description.length > 5000) {
        return NextResponse.json(
          { error: 'Description must be between 20 and 5,000 characters.' },
          { status: 400 }
        );
      }
      if (
        (existing.section === 'accommodation' || existing.section === 'exchange') &&
        containsProhibitedPricePattern(description)
      ) {
        return NextResponse.json(
          { error: 'Prices and fees are strictly prohibited in this section.' },
          { status: 400 }
        );
      }
      updates.description = description;
    }

    if (typeof body.city === 'string' && body.city.trim()) {
      updates.city = body.city.trim();
    }

    if (typeof body.region === 'string' && body.region.trim()) {
      updates.region = body.region.trim();
    }

    if (typeof body.category === 'string' && body.category.trim()) {
      updates.category = body.category.trim();
    }

    if (typeof body.contactPhone === 'string' && body.contactPhone.trim()) {
      const check = validateAfricanPhone(body.contactPhone);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      updates.contactPhone = check.normalized;
    }

    if (typeof body.status === 'string') {
      const allowedStatuses: ListingStatus[] = [
        'active',
        'expired',
        'exchanged',
        'given_away',
        'unavailable',
        'pending_review',
        'rejected',
      ];
      if (allowedStatuses.includes(body.status as ListingStatus)) {
        updates.status = body.status;
        // If renewing an expired listing to active, extend expiresAt by 30 days
        if (body.status === 'active' && body.renewExpiry === true) {
          updates.expiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();
        }
      }
    }

    if (typeof body.isFeatured === 'boolean') {
      updates.isFeatured = body.isFeatured;
    }

    if (Array.isArray(body.images)) {
      updates.images = (body.images as string[]).slice(0, 4);
    }

    const updated = await updateListingRecord(id, updates);
    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error('PATCH /api/listings/[id] error:', error);
    return NextResponse.json({ error: 'Unable to update listing.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deleted = await deleteListingRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
