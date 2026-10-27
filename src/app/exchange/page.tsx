import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getCategories } from '@/lib/repository';
import { SectionBrowser } from '@/components/SectionBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Give & Exchange — Free Items & Direct Swaps',
  description:
    'Share personal items to give away for free or exchange directly with neighbors across Ghana and Africa. No prices, checkout, or shopping cart.',
};

export default async function ExchangePage() {
  const [listings, categories] = await Promise.all([
    getAllListings({ section: 'exchange' }),
    getCategories('exchange'),
  ]);

  return (
    <SectionBrowser
      section="exchange"
      initialListings={listings}
      categories={categories}
      accentLabel="Generosity & Mutual Exchange • Zero Cash or Checkout"
      heading="Community Give & Exchange"
      subheading="Give away useful personal items (books, electronics, household items, clothing, tools) for free or exchange them directly with fellow community members. No prices, shopping carts, or payment processing."
      safetyBannerText="Every item is clearly labeled as a Free Give-Away or Community Exchange. Meet in safe, daylight public places and never send delivery money."
      emptyStateTitle="No community items posted in this view yet"
      emptyStateDescription="Have study books, a working device, household items, or tools you would like to give away for free or swap with someone in your community? Share the first item!"
      postButtonLabel="+ Give or Exchange an Item"
    />
  );
}
