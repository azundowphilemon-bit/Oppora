import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getCategories } from '@/lib/repository';
import { SectionBrowser } from '@/components/SectionBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Accommodation — Rooms, Apartments & Houses (Rent, Sale or Sharing)',
  description:
    'Connect directly with community members across Ghana and Africa posting rooms, apartments, and houses for rent, sale, or roommate sharing. Zero prices or payment processing.',
};

export default async function AccommodationPage() {
  const [listings, categories] = await Promise.all([
    getAllListings({ section: 'accommodation' }),
    getCategories('accommodation'),
  ]);

  return (
    <SectionBrowser
      section="accommodation"
      initialListings={listings}
      categories={categories}
      accentLabel="Community Housing Directory • No Prices or Fees"
      heading="Rooms, Apartments & Houses (Rent, Sale or Sharing)"
      subheading="Community members can share rooms, studios, apartments, and houses available for rent, sale, or roommate sharing across all 16 regions of Ghana. Oppora strictly does not display prices or process payments."
      safetyBannerText="Strict Policy: No prices or payment processing. Never pay viewing/inspection fees or advance deposits before inspecting a property in person."
      emptyStateTitle="No verified accommodation posts in this view yet"
      emptyStateDescription="Oppora never fabricates accommodation listings. Have a room, chamber & hall, apartment, or house available for rent, sale, or roommate sharing? Post it here for free."
      postButtonLabel="+ Post Accommodation"
    />
  );
}
