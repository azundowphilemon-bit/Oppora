import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getCategories } from '@/lib/repository';
import { SectionBrowser } from '@/components/SectionBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Help — Learning Support, Career Guidance & Mentoring',
  description:
    'Request or offer structured practical assistance including exam tutoring, career guidance, CV reviews, mentoring, and help finding local services across Ghana and Africa.',
};

export default async function CommunityHelpPage() {
  const [listings, categories] = await Promise.all([
    getAllListings({ section: 'help' }),
    getCategories('help'),
  ]);

  return (
    <SectionBrowser
      section="help"
      initialListings={listings}
      categories={categories}
      accentLabel="Structured Mutual Aid & Mentoring"
      heading="Community Help, Mentoring & Practical Support"
      subheading="A dedicated, moderated space where community members request or offer practical assistance—such as learning support, career guidance, CV feedback, mentoring, or help navigating local services."
      safetyBannerText="All Community Help posts are structured and moderated to prevent abuse. Never share financial details, passwords, or verification codes."
      emptyStateTitle="No Community Help posts in this view yet"
      emptyStateDescription="Can you offer 1 hour a week of career mentoring or study support, or do you need practical guidance in your city? Post a structured request or offer."
      postButtonLabel="+ Request or Offer Help"
    />
  );
}
