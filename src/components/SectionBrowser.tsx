'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  Filter,
  PlusCircle,
  Sparkles,
  Clock,
  ShieldCheck,
  Loader2,
  RotateCcw,
  EyeOff,
} from 'lucide-react';
import {
  CategoryItem,
  GHANA_AND_AFRICA_REGIONS,
  Listing,
  REGION_TOWNS,
  SectionType,
} from '@/lib/types';
import { getDaysRemaining, getEffectiveListingStatus } from '@/lib/validation';
import { ListingCard } from './ListingCard';
import { useOppora } from './OpporaProvider';

interface SectionBrowserProps {
  section: SectionType;
  initialListings: Listing[];
  categories: CategoryItem[];
  heading: string;
  subheading: string;
  accentLabel: string;
  safetyBannerText: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  postButtonLabel: string;
}

export function SectionBrowser({
  section,
  initialListings,
  categories,
  heading,
  subheading,
  accentLabel,
  safetyBannerText,
  emptyStateTitle,
  emptyStateDescription,
  postButtonLabel,
}: SectionBrowserProps) {
  const {
    openCreateModal,
    refreshSignal,
    blockedListingIds,
    clearBlockedListings,
  } = useOppora();

  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedSubMode, setSelectedSubMode] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'featured' | 'closing_soon' | 'recent'>('all');

  useEffect(() => {
    if (refreshSignal === 0) return;
    setLoading(true);
    fetch(`/api/listings?section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshSignal, section]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (blockedListingIds.includes(item.id)) return false;

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesText =
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.organization && item.organization.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (selectedRegion !== 'all' && item.region !== selectedRegion) {
        return false;
      }

      if (
        selectedTown !== 'all' &&
        !item.city.toLowerCase().includes(selectedTown.toLowerCase())
      ) {
        return false;
      }

      if (selectedSubMode !== 'all') {
        if (section === 'opportunities' && item.opportunityType !== selectedSubMode) {
          return false;
        }
        if (section === 'accommodation' && item.accommodationMode !== selectedSubMode) {
          return false;
        }
        if (section === 'exchange' && item.exchangeMode !== selectedSubMode) {
          return false;
        }
        if (section === 'help' && item.helpMode !== selectedSubMode) {
          return false;
        }
      }

      const effectiveStatus = getEffectiveListingStatus(item);
      if (viewMode === 'featured' && !item.isFeatured) {
        return false;
      }
      if (viewMode === 'closing_soon') {
        if (effectiveStatus !== 'active') return false;
        const dDays = getDaysRemaining(item.deadline || item.expiresAt);
        if (dDays === null || dDays < 0 || dDays > 21) return false;
      }
      if (viewMode === 'recent') {
        const ageDays =
          (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays > 14) return false;
      }

      return true;
    });
  }, [
    listings,
    blockedListingIds,
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedTown,
    selectedSubMode,
    viewMode,
    section,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSelectedTown('all');
    setSelectedSubMode('all');
    setViewMode('all');
  };

  return (
    <div className="space-y-8">
      {/* Section Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-forest-900 text-ivory-50 p-6 sm:p-10 shadow-warm-md overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {accentLabel}
            </span>
            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-ivory-50">
              {heading}
            </h1>
            <p className="text-sm sm:text-base text-ivory-200 leading-relaxed">
              {subheading}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => openCreateModal(section)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-clay-600 hover:bg-clay-500 text-white text-sm font-bold shadow-warm-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{postButtonLabel}</span>
            </button>
          </div>
        </div>

        {/* Trust & Zero-Payment Section Policy Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-ivory-200">
          <p className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{safetyBannerText}</span>
          </p>
          <span className="text-gold-200 font-semibold">
            Showing {filteredListings.length} listing{filteredListings.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Search & Multi-Facet Filter Bar */}
      <div className="bg-white rounded-2xl border border-ivory-200 p-4 sm:p-5 shadow-warm-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, city, skill, or organization..."
              aria-label="Search listings"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3 relative">
            <Filter className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedTown('all');
              }}
              aria-label="Filter by region"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
            >
              <option value="all">All Regions (Ghana &amp; Africa)</option>
              {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Town Filter Pills for Selected Region */}
        {selectedRegion !== 'all' && REGION_TOWNS[selectedRegion]?.length ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ivory-100">
            <span className="text-xs font-semibold text-charcoal-600 mr-1">
              Towns in {selectedRegion.split(',')[0]}:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTown('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedTown === 'all'
                  ? 'bg-forest-700 text-white'
                  : 'bg-ivory-100 hover:bg-ivory-200 text-charcoal-700'
              }`}
            >
              All Towns
            </button>
            {REGION_TOWNS[selectedRegion].map((town) => (
              <button
                key={town}
                type="button"
                onClick={() => setSelectedTown(town)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedTown === town
                    ? 'bg-forest-700 text-white'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-charcoal-700'
                }`}
              >
                {town}
              </button>
            ))}
          </div>
        ) : null}

        {/* Secondary Filter Pills (Sub-types & Views) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ivory-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {section === 'opportunities' && (
              <>
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'scholarship', label: 'Scholarships' },
                  { id: 'job', label: 'Jobs' },
                  { id: 'internship', label: 'Internships' },
                  { id: 'apprenticeship', label: 'Apprenticeships' },
                  { id: 'grant', label: 'Grants' },
                  { id: 'course', label: 'Free Courses' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedSubMode(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedSubMode === pill.id
                        ? 'bg-clay-600 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </>
            )}

            {section === 'accommodation' && (
              <>
                {[
                  { id: 'all', label: 'All Modes' },
                  { id: 'rent', label: 'For Rent' },
                  { id: 'sale', label: 'For Sale' },
                  { id: 'sharing', label: 'For Sharing' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedSubMode(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedSubMode === pill.id
                        ? 'bg-forest-700 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </>
            )}

            {section === 'exchange' && (
              <>
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'free_giveaway', label: 'Free Give-Away Only' },
                  { id: 'exchange', label: 'Community Exchange Only' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedSubMode(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedSubMode === pill.id
                        ? 'bg-charcoal-900 text-gold-200'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </>
            )}

            {section === 'help' && (
              <>
                {[
                  { id: 'all', label: 'All Posts' },
                  { id: 'offer', label: 'Offering Assistance' },
                  { id: 'request', label: 'Requesting Assistance' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedSubMode(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedSubMode === pill.id
                        ? 'bg-clay-600 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'featured', label: 'Moderator Picks' },
                { id: 'closing_soon', label: 'Closing Soon' },
                { id: 'recent', label: 'Recently Added' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  viewMode === tab.id
                    ? 'bg-gold-100 border-gold-400 text-charcoal-900'
                    : 'border-ivory-200 text-charcoal-600 hover:bg-ivory-100'
                }`}
              >
                {tab.id === 'closing_soon' && <Clock className="w-3 h-3 text-clay-600" />}
                {tab.label}
              </button>
            ))}

            {(searchQuery ||
              selectedCategory !== 'all' ||
              selectedRegion !== 'all' ||
              selectedSubMode !== 'all' ||
              viewMode !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-clay-700 hover:bg-clay-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-sm text-charcoal-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
          <span>Refreshing community listings...</span>
        </div>
      )}

      {/* Listings Grid or Friendly Empty State */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ivory-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-warm-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-ivory-100 border border-ivory-200 flex items-center justify-center mx-auto text-clay-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-display font-bold text-charcoal-900">
            {emptyStateTitle}
          </h2>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            {emptyStateDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openCreateModal(section)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs sm:text-sm font-bold shadow-warm-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{postButtonLabel}</span>
            </button>
            {(searchQuery ||
              selectedCategory !== 'all' ||
              selectedRegion !== 'all' ||
              selectedSubMode !== 'all' ||
              viewMode !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold text-charcoal-800 hover:bg-ivory-100"
              >
                Clear Active Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden/Blocked Listings Notice if user has blocked items */}
      {blockedListingIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-ivory-100 border border-ivory-200 text-xs text-charcoal-600">
          <span className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-charcoal-500" />
            You have hidden {blockedListingIds.length} listing
            {blockedListingIds.length === 1 ? '' : 's'} from your feed.
          </span>
          <button
            type="button"
            onClick={clearBlockedListings}
            className="font-semibold text-clay-700 hover:underline"
          >
            Restore hidden listings
          </button>
        </div>
      )}
    </div>
  );
}
