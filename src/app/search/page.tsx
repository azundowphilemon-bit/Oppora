'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  CategoryItem,
  GHANA_AND_AFRICA_REGIONS,
  Listing,
  REGION_TOWNS,
} from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { useOppora } from '@/components/OpporaProvider';

function GlobalSearchContent() {
  const searchParams = useSearchParams();
  const { refreshSignal, blockedListingIds } = useOppora();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [section, setSection] = useState(searchParams.get('section') || 'all');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState(searchParams.get('region') || 'all');
  const [town, setTown] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/listings').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([listData, catData]) => {
        if (Array.isArray(listData.listings)) setListings(listData.listings);
        if (Array.isArray(catData.categories)) setCategories(catData.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshSignal]);

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (blockedListingIds.includes(item.id)) return false;
      if (section !== 'all' && item.section !== section) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (region !== 'all' && item.region !== region) return false;
      if (town !== 'all' && !item.city.toLowerCase().includes(town.toLowerCase())) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      const q = query.trim().toLowerCase();
      if (q) {
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.organization && item.organization.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [listings, blockedListingIds, section, category, region, town, statusFilter, query]);

  const visibleCategories = useMemo(() => {
    if (section === 'all') return categories;
    return categories.filter((c) => c.section === section);
  }, [categories, section]);

  return (
    <div className="space-y-8">
      <div className="bg-charcoal-900 text-ivory-50 rounded-3xl p-6 sm:p-10 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
          Cross-Platform Search
        </span>
        <h1 className="text-2xl sm:text-4xl font-display font-bold">
          Search Opportunities, Housing, Items &amp; Community Help
        </h1>
        <p className="text-sm text-ivory-200 max-w-2xl">
          Filter across every section, category, town, and region in Ghana.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-warm-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keywords, city, skill, institution..."
              aria-label="Search keywords"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm text-charcoal-900"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setCategory('all');
              }}
              aria-label="Filter by section"
              className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm font-semibold text-charcoal-900"
            >
              <option value="all">All Sections</option>
              <option value="opportunities">Opportunities</option>
              <option value="accommodation">Accommodation</option>
              <option value="exchange">Give &amp; Exchange</option>
              <option value="help">Community Help</option>
            </select>
          </div>

          <div className="md:col-span-3 relative">
            <Filter className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm font-medium text-charcoal-900"
            >
              <option value="all">All Categories</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setTown('all');
              }}
              aria-label="Filter by region"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm font-medium text-charcoal-900"
            >
              <option value="all">All Regions</option>
              {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {region !== 'all' && REGION_TOWNS[region]?.length ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ivory-100">
            <span className="text-xs font-semibold text-charcoal-600 mr-1">
              Towns in {region.split(',')[0]}:
            </span>
            <button
              type="button"
              onClick={() => setTown('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                town === 'all'
                  ? 'bg-forest-700 text-white'
                  : 'bg-ivory-100 hover:bg-ivory-200 text-charcoal-700'
              }`}
            >
              All Towns
            </button>
            {REGION_TOWNS[region].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTown(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  town === t
                    ? 'bg-forest-700 text-white'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-charcoal-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ivory-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-charcoal-600 mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'active', label: 'Active Only' },
              { id: 'exchanged', label: 'Exchanged' },
              { id: 'given_away', label: 'Given Away' },
              { id: 'expired', label: 'Expired' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  statusFilter === st.id
                    ? 'bg-charcoal-900 text-ivory-50'
                    : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSection('all');
              setCategory('all');
              setRegion('all');
              setStatusFilter('all');
            }}
            className="inline-flex items-center gap-1 font-semibold text-clay-700 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-charcoal-600">
          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
          <span>Searching across Oppora...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ivory-200 p-10 text-center max-w-xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-clay-600 mx-auto" />
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            No listings matched your search criteria
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Try broadening your keywords or selecting &ldquo;All Sections&rdquo; and &ldquo;All
            Regions&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-charcoal-600">
          Loading search...
        </div>
      }
    >
      <GlobalSearchContent />
    </Suspense>
  );
}
