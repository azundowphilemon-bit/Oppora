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
    return { title: 'Community Help Post Not Found' };
  }
  return {
    title: listing.title,
    description: listing.summary,
  };
}

export default async function CommunityHelpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing || listing.section !== 'help') {
    notFound();
  }

  return (
    <ListingDetailView
      listing={listing}
      backHref="/help"
      backLabel="Back to Community Help"
    />
  );
}
