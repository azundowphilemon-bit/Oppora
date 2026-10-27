'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Bookmark,
  Share2,
  Flag,
  EyeOff,
  ExternalLink,
  Award,
  CheckCircle2,
  Home,
  Gift,
  RefreshCw,
  HeartHandshake,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Listing } from '@/lib/types';
import { getDaysRemaining, getEffectiveListingStatus } from '@/lib/validation';
import { useOppora } from './OpporaProvider';

export function getListingDetailHref(listing: Listing): string {
  return `/${listing.section}/${listing.id}`;
}

export function getStatusBadgeConfig(status: Listing['status']) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        classes: 'bg-forest-100 text-forest-800 border-forest-200',
      };
    case 'expired':
      return {
        label: 'Expired',
        classes: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
      };
    case 'exchanged':
      return {
        label: 'Exchanged',
        classes: 'bg-gold-100 text-gold-700 border-gold-200',
      };
    case 'given_away':
      return {
        label: 'Given Away',
        classes: 'bg-forest-50 text-forest-700 border-forest-200',
      };
    case 'unavailable':
      return {
        label: 'Unavailable',
        classes: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
      };
    case 'pending_review':
      return {
        label: 'Pending Moderator Review',
        classes: 'bg-gold-50 text-gold-700 border-gold-200',
      };
    case 'rejected':
      return {
        label: 'Removed by Moderator',
        classes: 'bg-clay-100 text-clay-800 border-clay-200',
      };
  }
}

export function ListingCard({ listing }: { listing: Listing }) {
  const {
    isSaved,
    toggleSaved,
    openReportModal,
    blockListing,
    blockedListingIds,
  } = useOppora();

  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);

  if (blockedListingIds.includes(listing.id)) {
    return null;
  }

  const effectiveStatus = getEffectiveListingStatus(listing);
  const statusBadge = getStatusBadgeConfig(effectiveStatus);
  const saved = isSaved(listing.id);
  const detailHref = getListingDetailHref(listing);

  const deadlineDays =
    listing.section === 'opportunities' && listing.deadline
      ? getDaysRemaining(listing.deadline)
      : null;
  const expiryDays = getDaysRemaining(listing.expiresAt);
  const isClosingSoon =
    effectiveStatus === 'active' &&
    ((deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 14) ||
      (expiryDays !== null && expiryDays >= 0 && expiryDays <= 7));

  const handleWhatsAppShare = () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://oppora.org';
    const url = `${origin}${detailHref}`;
    const text = `Check out "${listing.title}" (${listing.region}) on Oppora — Opportunities, Housing & Community in Ghana & Africa: ${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="group bg-white rounded-2xl border border-ivory-200 hover:border-clay-200 shadow-warm-sm hover:shadow-warm-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Optional Image Header for Accommodation / Community Items */}
      {listing.images && listing.images.length > 0 && (
        <Link href={detailHref} className="block relative h-48 w-full bg-ivory-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {listing.images.length > 1 && (
            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-charcoal-900/80 text-ivory-50 text-[11px] font-semibold">
              +{listing.images.length - 1} more photo{listing.images.length > 2 ? 's' : ''}
            </span>
          )}
        </Link>
      )}

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.classes}`}
              >
                {statusBadge.label}
              </span>

              {/* Section-Specific Primary Distinction Badge */}
              {listing.section === 'accommodation' && listing.accommodationMode && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    listing.accommodationMode === 'rent'
                      ? 'bg-clay-600 text-white'
                      : listing.accommodationMode === 'sale'
                      ? 'bg-charcoal-900 text-gold-200'
                      : 'bg-forest-700 text-white'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  {listing.accommodationMode === 'rent'
                    ? 'For Rent'
                    : listing.accommodationMode === 'sale'
                    ? 'For Sale'
                    : 'For Sharing'}
                </span>
              )}

              {listing.section === 'exchange' && listing.exchangeMode && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    listing.exchangeMode === 'free_giveaway'
                      ? 'bg-forest-600 text-white'
                      : 'bg-gold-500 text-charcoal-900'
                  }`}
                >
                  {listing.exchangeMode === 'free_giveaway' ? (
                    <>
                      <Gift className="w-3 h-3" /> 100% Free Give-Away
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" /> Community Exchange
                    </>
                  )}
                </span>
              )}

              {listing.section === 'help' && listing.helpMode && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    listing.helpMode === 'offer'
                      ? 'bg-forest-600 text-white'
                      : 'bg-clay-600 text-white'
                  }`}
                >
                  <HeartHandshake className="w-3 h-3" />
                  {listing.helpMode === 'offer'
                    ? 'Offering Assistance'
                    : 'Requesting Assistance'}
                </span>
              )}

              {listing.section === 'opportunities' && listing.opportunityType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-ivory-200 text-charcoal-800">
                  <Briefcase className="w-3 h-3 text-clay-600" />
                  {listing.opportunityType}
                </span>
              )}

              {listing.isFeatured && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-100 text-gold-700 border border-gold-200"
                  title="Selected by Oppora moderators for community impact — never paid promotion"
                >
                  <Award className="w-3 h-3 text-gold-600" />
                  Community Pick
                </span>
              )}

              {listing.isVerifiedOfficial && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-forest-50 text-forest-700 border border-forest-200">
                  <CheckCircle2 className="w-3 h-3 text-forest-600" />
                  Official Portal
                </span>
              )}
            </div>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={() => toggleSaved(listing.id)}
              className={`p-2 rounded-xl border transition-colors ${
                saved
                  ? 'bg-gold-100 border-gold-400 text-gold-700'
                  : 'border-ivory-200 text-charcoal-500 hover:bg-ivory-100 hover:text-charcoal-900'
              }`}
              aria-label={saved ? 'Remove from saved listings' : 'Save listing'}
              title={saved ? 'Saved in Bookmarks' : 'Save / Bookmark listing'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-gold-500' : ''}`} />
            </button>
          </div>

          {/* Category & Secondary Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-500 font-medium">
            <span className="text-clay-700 font-semibold">{listing.category}</span>
            {listing.accommodationType && (
              <>
                <span>&bull;</span>
                <span className="text-charcoal-700 font-semibold">
                  {listing.accommodationType}
                </span>
              </>
            )}
            {listing.itemCondition && (
              <>
                <span>&bull;</span>
                <span className="text-charcoal-700 font-semibold">
                  Condition: {listing.itemCondition}
                </span>
              </>
            )}
            {listing.organization && (
              <>
                <span>&bull;</span>
                <span className="text-charcoal-700 font-semibold">
                  {listing.organization}
                </span>
              </>
            )}
          </div>

          {/* Title & Summary */}
          <div>
            <Link
              href={detailHref}
              className="block text-lg font-display font-bold text-charcoal-900 group-hover:text-clay-600 transition-colors leading-snug"
            >
              {listing.title}
            </Link>
            <p className="text-sm text-charcoal-700 mt-1.5 line-clamp-2 leading-relaxed">
              {listing.summary}
            </p>
          </div>

          {/* Exchange Preference if applicable */}
          {listing.section === 'exchange' &&
            listing.exchangeMode === 'exchange' &&
            listing.exchangePreference && (
              <div className="px-3 py-2 rounded-xl bg-ivory-100 border border-ivory-200 text-xs text-charcoal-800">
                <span className="font-bold text-clay-700">Open to exchanging for: </span>
                {listing.exchangePreference}
              </div>
            )}
        </div>

        {/* Footer Metadata & Actions */}
        <div className="pt-3 border-t border-ivory-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-charcoal-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-clay-600 shrink-0" />
              <span>
                {listing.city}, {listing.region}
              </span>
            </span>

            {effectiveStatus === 'expired' ? (
              <span className="inline-flex items-center gap-1 text-clay-700 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Listing Expired
              </span>
            ) : isClosingSoon ? (
              <span className="inline-flex items-center gap-1 text-clay-600 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {deadlineDays !== null
                  ? `Closes in ${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`
                  : `Expires in ${expiryDays} day${expiryDays === 1 ? '' : 's'}`}
              </span>
            ) : listing.deadline ? (
              <span className="inline-flex items-center gap-1 text-charcoal-500">
                <Clock className="w-3.5 h-3.5" />
                Deadline: {new Date(listing.deadline).toLocaleDateString('en-GB')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-charcoal-500">
                <Clock className="w-3.5 h-3.5" />
                Expires: {new Date(listing.expiresAt).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold transition-colors"
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-forest-600" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => openReportModal(listing)}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-clay-50 hover:text-clay-700 transition-colors"
                title="Report listing to moderators"
                aria-label="Report listing"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setConfirmBlockOpen(true)}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-charcoal-100 hover:text-charcoal-800 transition-colors"
                title="Hide / Block this listing from your feed"
                aria-label="Hide or block listing"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href={detailHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-clay-600 text-ivory-50 text-xs font-semibold transition-colors"
            >
              <span>View Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before Blocking Content */}
      {confirmBlockOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`block-dialog-${listing.id}`}
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-sm w-full p-5 shadow-warm-lg space-y-4">
            <h3
              id={`block-dialog-${listing.id}`}
              className="text-base font-display font-bold text-charcoal-900"
            >
              Hide &amp; Block This Listing?
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              This will immediately hide <strong>{listing.title}</strong> from your feed. If this
              post violates community safety rules, you can also report it to moderators.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBlockOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  blockListing(listing.id);
                  setConfirmBlockOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold"
              >
                Hide Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
