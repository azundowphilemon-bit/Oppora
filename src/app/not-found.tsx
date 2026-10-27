import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-clay-50 border border-clay-200 text-clay-600 flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-display font-bold text-charcoal-900">
        Page or Listing Not Found
      </h1>
      <p className="text-sm text-charcoal-600 leading-relaxed">
        The page or community listing you are looking for may have been removed by its owner,
        expired, or moved to another section.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-clay-600 text-ivory-50 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          href="/search"
          className="px-5 py-2.5 rounded-xl border border-ivory-300 bg-white hover:bg-ivory-100 text-charcoal-800 text-xs font-bold transition-colors"
        >
          Search All Listings
        </Link>
      </div>
    </div>
  );
}
