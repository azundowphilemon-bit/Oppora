import { MetadataRoute } from 'next';
import { getAllListings } from '@/lib/repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const listings = await getAllListings();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/opportunities',
    '/accommodation',
    '/exchange',
    '/help',
    '/search',
    '/guidelines',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = listings.map((item) => ({
    url: `${baseUrl}/${item.section}/${item.id}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
