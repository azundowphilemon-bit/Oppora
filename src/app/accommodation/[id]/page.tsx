import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListingById } from '@/lib/repository';
import { ListingDetailView } from '@/components/ListingDetailView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return { title: 'Accommodation Listing Not Found' };
  }
  return {
    title: `${listing.title} (${listing.accommodationMode?.toUpperCase()})`,
    description: listing.summary,
  };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing || listing.section !== 'accommodation') {
    notFound();
  }

  return (
    <ListingDetailView
      listing={listing}
      backHref="/accommodation"
      backLabel="Back to Accommodation"
    />
  );
}
