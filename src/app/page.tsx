import React from 'react';
import { getAllListings } from '@/lib/repository';
import { HomeClient } from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const listings = await getAllListings();
  return <HomeClient initialListings={listings} />;
}
