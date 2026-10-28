'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  Home,
  Gift,
  HeartHandshake,
  ArrowRight,
  Award,
  Clock,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GHANA_AND_AFRICA_REGIONS, Listing, SectionType } from '@/lib/types';
import { getDaysRemaining, getEffectiveListingStatus } from '@/lib/validation';
import { ListingCard } from './ListingCard';
import { KenteAccentBar } from './OpporaLogo';
import { useOppora } from './OpporaProvider';

export function HomeClient({ initialListings }: { initialListings: Listing[] }) {
  const router = useRouter();
  const { openCreateModal, refreshSignal, blockedListingIds } = useOppora();

  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroSection, setHeroSection] = useState<string>('all');
  const [heroRegion, setHeroRegion] = useState<string>('all');

  useEffect(() => {
    if (refreshSignal === 0) return;
    fetch('/api/listings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {});
  }, [refreshSignal]);

  const visibleListings = listings.filter(
    (item) =>
      !blockedListingIds.includes(item.id) &&
      getEffectiveListingStatus(item) === 'active'
  );

  const featuredListings = visibleListings.filter((item) => item.isFeatured).slice(0, 3);

  const closingSoonOpportunities = visibleListings
    .filter((item) => {
      if (item.section !== 'opportunities' || !item.deadline) return false;
      const days = getDaysRemaining(item.deadline);
      return days !== null && days >= 0 && days <= 45;
    })
    .slice(0, 3);

  const recentlyAdded = visibleListings.slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('q', heroSearch.trim());
    if (heroSection !== 'all') params.set('section', heroSection);
    if (heroRegion !== 'all') params.set('region', heroRegion);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl bg-charcoal-900 text-ivory-50 overflow-hidden shadow-warm-lg border border-charcoal-800">
        {/* Decorative African Geometric SVG Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="1050" cy="120" r="240" stroke="#E5B23A" strokeWidth="2" />
            <circle cx="1050" cy="120" r="180" stroke="#C85A32" strokeWidth="2" />
            <path
              d="M900 0L1200 300L900 600L600 300L900 0Z"
              stroke="#236B4E"
              strokeWidth="2"
            />
            <path
              d="M0 450L200 250L400 450L200 650L0 450Z"
              stroke="#E5B23A"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-gold-400/30 text-gold-200 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Built for Ghana &bull; All 16 Regions &bull; Opportunities, Housing &amp; Community</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-ivory-50 leading-[1.12]">
              Shared doors to{' '}
              <span className="text-gold-400">opportunity</span>,{' '}
              <span className="text-clay-200">shelter</span>, and{' '}
              <span className="text-forest-200">community care</span>.
            </h1>

            <p className="text-base sm:text-lg text-ivory-200 leading-relaxed max-w-2xl">
              Discover verified scholarships, jobs, and free digital courses; connect directly
              for community accommodation; give away or exchange useful personal items; and
              request or offer practical mentoring across all 16 regions of Ghana.
            </p>

            {/* Unified Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-ivory-50 p-2.5 sm:p-3 rounded-2xl shadow-warm-lg grid grid-cols-1 md:grid-cols-12 gap-2.5 text-charcoal-900"
            >
              <div className="md:col-span-5 min-w-0 relative flex items-center">
                <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5" />
                <input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search scholarships, rooms, textbooks, mentoring..."
                  aria-label="Search across all Oppora sections"
                  className="w-full min-w-0 pl-10 pr-3 py-3 rounded-xl bg-white border border-ivory-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
                />
              </div>

              <div className="md:col-span-3 min-w-0">
                <select
                  value={heroSection}
                  onChange={(e) => setHeroSection(e.target.value)}
                  aria-label="Select section"
                  className="w-full min-w-0 px-3 py-3 rounded-xl bg-white border border-ivory-200 text-xs sm:text-sm font-semibold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-clay-500"
                >
                  <option value="all">All Sections</option>
                  <option value="opportunities">Opportunities</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="exchange">Give &amp; Exchange</option>
                  <option value="help">Community Help</option>
                </select>
              </div>

              <div className="md:col-span-2 min-w-0 relative flex items-center">
                <MapPin className="w-4 h-4 text-clay-600 absolute left-3 pointer-events-none" />
                <select
                  value={heroRegion}
                  onChange={(e) => setHeroRegion(e.target.value)}
                  aria-label="Select region"
                  className="w-full min-w-0 pl-8 pr-2 py-3 rounded-xl bg-white border border-ivory-200 text-xs font-semibold text-charcoal-800 truncate focus:outline-none focus:ring-2 focus:ring-clay-500"
                >
                  <option value="all">All Regions</option>
                  {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-3 px-4 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="text-ivory-300 font-semibold">Contribute to community:</span>
              {(
                [
                  { section: 'opportunities', label: '+ Share Opportunity' },
                  { section: 'accommodation', label: '+ Post Accommodation' },
                  { section: 'exchange', label: '+ Give or Exchange Item' },
                  { section: 'help', label: '+ Offer / Request Help' },
                ] as { section: SectionType; label: string }[]
              ).map((btn) => (
                <button
                  key={btn.section}
                  type="button"
                  onClick={() => openCreateModal(btn.section)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-ivory-100 font-semibold transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <KenteAccentBar className="rounded-none h-2" />
      </section>

      {/* 2. FOUR PILLARS DIRECTORY CARDS */}
      <section aria-labelledby="pillars-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clay-600">
              Four Pillars of Community Support
            </span>
            <h2
              id="pillars-heading"
              className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1"
            >
              How Oppora Serves Communities Across Ghana
            </h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-600 hover:text-clay-700"
          >
            <span>Search all sections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: Opportunities */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-clay-50 border border-clay-100 flex items-center justify-center text-clay-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-charcoal-900">
                Opportunities
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Jobs, internships, apprenticeships, scholarships, grants, and free online courses
                with deadlines and verified official application links.
              </p>
            </div>
            <div className="pt-3 border-t border-ivory-100 flex items-center justify-between">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-600 hover:text-clay-800"
              >
                <span>Browse Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openCreateModal('opportunities')}
                className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
              >
                + Post
              </button>
            </div>
          </div>

          {/* Pillar 2: Accommodation */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-charcoal-900">
                Accommodation
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Rooms, apartments, and houses clearly labeled for rent, sale, or roommate
                sharing. Direct phone contact—no prices or payment processing.
              </p>
            </div>
            <div className="pt-3 border-t border-ivory-100 flex items-center justify-between">
              <Link
                href="/accommodation"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900"
              >
                <span>View Housing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openCreateModal('accommodation')}
                className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
              >
                + Post
              </button>
            </div>
          </div>

          {/* Pillar 3: Community Give & Exchange */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-charcoal-900">
                Give &amp; Exchange
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Pass along books, electronics, dorm essentials, or tools for free give-away or
                direct item-for-item swap. Zero cash, checkout, or carts.
              </p>
            </div>
            <div className="pt-3 border-t border-ivory-100 flex items-center justify-between">
              <Link
                href="/exchange"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 hover:text-charcoal-900"
              >
                <span>Explore Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openCreateModal('exchange')}
                className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
              >
                + Post
              </button>
            </div>
          </div>

          {/* Pillar 4: Community Help */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-clay-50 border border-clay-100 flex items-center justify-center text-clay-700">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-charcoal-900">
                Community Help
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Request or offer structured practical assistance—exam tutoring, CV review,
                career mentoring, and help finding local services.
              </p>
            </div>
            <div className="pt-3 border-t border-ivory-100 flex items-center justify-between">
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-600 hover:text-clay-800"
              >
                <span>Join Mutual Help</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openCreateModal('help')}
                className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
              >
                + Post
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BY MODERATORS (WITHOUT PAID PROMOTION) */}
      {featuredListings.length > 0 && (
        <section aria-labelledby="featured-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-700">
                <Award className="w-4 h-4 text-gold-600" />
                Curated by Administrators &bull; Never Paid Promotion
              </span>
              <h2
                id="featured-heading"
                className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 mt-1"
              >
                Featured Community &amp; Official Highlights
              </h2>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-600 hover:text-clay-700"
            >
              <span>View all opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* 4. CLOSING-SOON & RECENTLY ADDED OPPORTUNITIES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Fresh on Oppora
              </span>
              <h2 className="text-2xl font-display font-bold text-charcoal-900 mt-0.5">
                Recently Added Listings
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal('opportunities')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-clay-600 text-ivory-50 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Listing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentlyAdded.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>

        {/* Closing-Soon Sidebar */}
        <aside className="lg:col-span-4 bg-white rounded-3xl border border-ivory-200 p-6 shadow-warm-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-clay-50 text-clay-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-charcoal-900">
                Upcoming Deadlines
              </h3>
              <p className="text-xs text-charcoal-500">
                Verified portals with upcoming cohort dates
              </p>
            </div>
          </div>

          {closingSoonOpportunities.length > 0 ? (
            <div className="space-y-3">
              {closingSoonOpportunities.map((opp) => {
                const days = getDaysRemaining(opp.deadline);
                return (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="block p-4 rounded-2xl bg-ivory-50 hover:bg-ivory-100 border border-ivory-200 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className="text-clay-600 uppercase">{opp.opportunityType}</span>
                      {days !== null && (
                        <span className="px-2 py-0.5 rounded-full bg-clay-100 text-clay-800">
                          {days} days left
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-charcoal-900 line-clamp-2">
                      {opp.title}
                    </h4>
                    <p className="text-xs text-charcoal-500">
                      {opp.organization} &bull; {opp.region}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-charcoal-600 py-4">
              No urgent deadlines expiring this week. Browse all ongoing portals in Opportunities.
            </p>
          )}

          <div className="pt-3 border-t border-ivory-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-600" />
              Oppora Integrity Commitment
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                <span>
                  We <strong>never fabricate</strong> job vacancies, scholarships, or housing
                  listings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-clay-600 shrink-0 mt-0.5" />
                <span>
                  Never send mobile money, viewing fees, or application payments to anyone.
                </span>
              </li>
            </ul>
            <Link
              href="/guidelines"
              className="block text-center w-full py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-900 text-xs font-bold transition-colors"
            >
              Read Full Trust &amp; Safety Guidelines
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
