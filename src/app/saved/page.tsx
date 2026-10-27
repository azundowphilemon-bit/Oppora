'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight, Loader2 } from 'lucide-react';
import { Listing } from '@/lib/types';
import { ListingCard } from '@/components/ListingCard';
import { useOppora } from '@/components/OpporaProvider';

export default function SavedListingsPage() {
  const { savedIds, refreshSignal } = useOppora();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/listings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshSignal]);

  const bookmarkedListings = listings.filter((item) => savedIds.includes(item.id));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-ivory-200 p-6 sm:p-10 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-700">
            <Bookmark className="w-4 h-4 text-gold-600 fill-gold-500" />
            Personal Reading &amp; Follow-Up List
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900">
            Saved &amp; Bookmarked Listings ({bookmarkedListings.length})
          </h1>
          <p className="text-sm text-charcoal-600">
            Keep track of scholarships, housing options, exchange items, and mentoring posts you
            want to revisit.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-charcoal-600">
          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
          <span>Loading your saved bookmarks...</span>
        </div>
      ) : bookmarkedListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedListings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ivory-200 p-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto text-gold-600">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            No saved listings yet
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Tap the bookmark icon on any opportunity, accommodation post, community item, or
            help listing to save it here for quick access.
          </p>
          <div className="pt-2">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-clay-600 text-ivory-50 text-xs font-bold transition-colors"
            >
              <span>Browse Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
