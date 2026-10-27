import React from 'react';
import type { Metadata } from 'next';
import { getAllListings, getCategories } from '@/lib/repository';
import { SectionBrowser } from '@/components/SectionBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Opportunities — Scholarships, Jobs, Internships & Free Courses',
  description:
    'Explore verified scholarships, jobs, internships, apprenticeships, grants, and free online courses across Ghana and Africa with official application links.',
};

export default async function OpportunitiesPage() {
  const [listings, categories] = await Promise.all([
    getAllListings({ section: 'opportunities' }),
    getCategories('opportunities'),
  ]);

  return (
    <SectionBrowser
      section="opportunities"
      initialListings={listings}
      categories={categories}
      accentLabel="Opportunities across Ghana & Africa"
      heading="Jobs, Scholarships, Internships & Free Courses"
      subheading="Explore verified public portals and community-shared opportunities with official application links and transparent deadlines. Oppora never fabricates job vacancies or scholarships."
      safetyBannerText="Always apply directly on the official institutional website. Never pay application or placement fees to any person or agent."
      emptyStateTitle="No matching opportunities found"
      emptyStateDescription="Try clearing your search filters or share a verified scholarship, internship, apprenticeship, or free course with the community."
      postButtonLabel="+ Share an Opportunity"
    />
  );
}
