'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldAlert,
  Bookmark,
  Share2,
  Flag,
  Phone,
  ExternalLink,
  CheckCircle2,
  Award,
  Home,
  Gift,
  RefreshCw,
  HeartHandshake,
  Calendar,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Listing } from '@/lib/types';
import {
  formatPhoneForDisplay,
  getDaysRemaining,
  getEffectiveListingStatus,
} from '@/lib/validation';
import { getStatusBadgeConfig } from './ListingCard';
import { useOppora } from './OpporaProvider';

export function ListingDetailView({
  listing,
  backHref,
  backLabel,
}: {
  listing: Listing;
  backHref: string;
  backLabel: string;
}) {
  const { isSaved, toggleSaved, openReportModal, openContactAdminModal } = useOppora();
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const effectiveStatus = getEffectiveListingStatus(listing);
  const statusBadge = getStatusBadgeConfig(effectiveStatus);
  const saved = isSaved(listing.id);
  const daysToExpiry = getDaysRemaining(listing.expiresAt);
  const daysToDeadline = listing.deadline ? getDaysRemaining(listing.deadline) : null;

  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out "${listing.title}" (${listing.city}, ${listing.region}) on Oppora: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-700 hover:text-clay-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSaved(listing.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              saved
                ? 'bg-gold-100 border-gold-400 text-charcoal-900'
                : 'bg-white border-ivory-300 text-charcoal-700 hover:bg-ivory-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-gold-500 text-gold-600' : ''}`} />
            <span>{saved ? 'Saved' : 'Save Listing'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => openReportModal(listing)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-clay-200 bg-white hover:bg-clay-50 text-clay-700 text-xs font-semibold transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Automatic Expiry / Unavailable Warning Banner */}
      {effectiveStatus !== 'active' && (
        <div className="p-4 rounded-2xl bg-clay-50 border border-clay-200 flex items-start gap-3 text-clay-900">
          <AlertTriangle className="w-5 h-5 text-clay-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold">
              Listing Status Notice: This post is currently marked as{' '}
              <span className="uppercase underline">{statusBadge.label}</span>.
            </p>
            <p className="text-clay-800">
              {effectiveStatus === 'expired'
                ? 'This listing has passed its automatic expiry date or application deadline. Please do not submit applications or contact the poster for expired listings.'
                : 'This community item or housing unit is no longer available.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-ivory-200 shadow-warm-md overflow-hidden">
        {/* Photo Gallery if present */}
        {listing.images && listing.images.length > 0 && (
          <div className="p-4 sm:p-6 bg-ivory-100 border-b border-ivory-200">
            <div
              className={`grid gap-3 ${
                listing.images.length === 1
                  ? 'grid-cols-1 max-h-96'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {listing.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-ivory-300 bg-white h-64 sm:h-72"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${listing.title} - photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* Badges & Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.classes}`}
              >
                {statusBadge.label}
              </span>

              {listing.section === 'accommodation' && listing.accommodationMode && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    listing.accommodationMode === 'rent'
                      ? 'bg-clay-600 text-white'
                      : listing.accommodationMode === 'sale'
                      ? 'bg-charcoal-900 text-gold-200'
                      : 'bg-forest-700 text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  {listing.accommodationMode === 'rent'
                    ? 'Accommodation For Rent'
                    : listing.accommodationMode === 'sale'
                    ? 'Accommodation For Sale'
                    : 'Accommodation For Sharing'}
                </span>
              )}

              {listing.section === 'exchange' && listing.exchangeMode && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    listing.exchangeMode === 'free_giveaway'
                      ? 'bg-forest-600 text-white'
                      : 'bg-gold-500 text-charcoal-900'
                  }`}
                >
                  {listing.exchangeMode === 'free_giveaway' ? (
                    <>
                      <Gift className="w-3.5 h-3.5" /> 100% Free Give-Away Item
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Community Exchange Offer
                    </>
                  )}
                </span>
              )}

              {listing.section === 'help' && listing.helpMode && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    listing.helpMode === 'offer'
                      ? 'bg-forest-600 text-white'
                      : 'bg-clay-600 text-white'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  {listing.helpMode === 'offer'
                    ? 'Offering Community Help'
                    : 'Requesting Community Help'}
                </span>
              )}

              {listing.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 border border-gold-300">
                  <Award className="w-3.5 h-3.5" />
                  Featured by Moderators (No Paid Promotion)
                </span>
              )}

              {listing.isVerifiedOfficial && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-700 border border-forest-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Official Portal
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 leading-tight">
              {listing.title}
            </h1>

            <p className="text-base text-charcoal-700 font-medium leading-relaxed">
              {listing.summary}
            </p>

            {/* Key Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-clay-600 shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                    Location
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {listing.city}, {listing.region}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-forest-600 shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                    Posted By
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {listing.ownerDisplayName}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold-600 shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                    {listing.deadline ? 'Application Deadline' : 'Automatic Listing Expiry'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-charcoal-900">
                    {listing.deadline
                      ? `${new Date(listing.deadline).toLocaleDateString('en-GB')}${
                          daysToDeadline !== null && daysToDeadline >= 0
                            ? ` (${daysToDeadline}d left)`
                            : ''
                        }`
                      : `${new Date(listing.expiresAt).toLocaleDateString('en-GB')}${
                          daysToExpiry !== null && daysToExpiry >= 0
                            ? ` (${daysToExpiry}d left)`
                            : ''
                        }`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section-Specific Structured Attributes */}
          {listing.section === 'accommodation' && (
            <div className="p-5 rounded-2xl bg-forest-50/60 border border-forest-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-forest-900 uppercase tracking-wider">
                  Accommodation Specifications
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-forest-200 text-xs font-bold text-forest-800">
                  No Prices or Payment Processing on Oppora
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500 text-xs block">Accommodation Type</span>
                  <strong className="text-charcoal-900">
                    {listing.accommodationType || 'Residential Unit'}
                  </strong>
                </div>
                <div>
                  <span className="text-charcoal-500 text-xs block">Availability Mode</span>
                  <strong className="text-charcoal-900 capitalize">
                    For {listing.accommodationMode}
                  </strong>
                </div>
              </div>
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="pt-2">
                  <span className="text-charcoal-500 text-xs block mb-1.5">
                    Included Features &amp; Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.amenities.map((am, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-white border border-forest-200 text-xs font-semibold text-charcoal-800"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {listing.section === 'exchange' && (
            <div className="p-5 rounded-2xl bg-gold-50/70 border border-gold-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                  Community Give &amp; Exchange Details
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-gold-300 text-xs font-bold text-charcoal-900">
                  No Cash, Checkout, or Shopping Cart
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500 text-xs block">Offer Type</span>
                  <strong className="text-charcoal-900">
                    {listing.exchangeMode === 'free_giveaway'
                      ? 'Free Give-Away (No Return Required)'
                      : 'Community Item Exchange (Direct Item Swap)'}
                  </strong>
                </div>
                <div>
                  <span className="text-charcoal-500 text-xs block">Item Condition</span>
                  <strong className="text-charcoal-900">
                    {listing.itemCondition || 'Good'}
                  </strong>
                </div>
              </div>
              {listing.exchangeMode === 'exchange' && listing.exchangePreference && (
                <div className="p-3 rounded-xl bg-white border border-gold-200 text-xs sm:text-sm">
                  <strong className="text-clay-700">Preferred Exchange Item: </strong>
                  <span className="text-charcoal-900">{listing.exchangePreference}</span>
                </div>
              )}
            </div>
          )}

          {listing.section === 'help' && (
            <div className="p-5 rounded-2xl bg-clay-50/60 border border-clay-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-charcoal-500 text-xs block">Assistance Type</span>
                <strong className="text-charcoal-900">
                  {listing.helpMode === 'offer'
                    ? 'Offering Practical Help / Mentoring'
                    : 'Requesting Practical Assistance'}
                </strong>
              </div>
              <div>
                <span className="text-charcoal-500 text-xs block">Availability</span>
                <strong className="text-charcoal-900">
                  {listing.availability || 'Flexible Schedule'}
                </strong>
              </div>
              <div>
                <span className="text-charcoal-500 text-xs block">Delivery Mode</span>
                <strong className="text-charcoal-900">
                  {listing.isRemoteFriendly
                    ? 'In-Person or Remote (Phone/Online)'
                    : 'In-Person Local Support'}
                </strong>
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-3">
            <h2 className="text-base font-display font-bold text-charcoal-900">
              Detailed Information
            </h2>
            <div className="prose prose-sm max-w-none text-charcoal-800 whitespace-pre-line leading-relaxed bg-ivory-50/60 p-5 rounded-2xl border border-ivory-200">
              {listing.description}
            </div>
          </div>

          {/* Primary Action & Contact Section */}
          <div className="p-6 rounded-2xl bg-charcoal-900 text-ivory-50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-ivory-50">
                  {listing.section === 'opportunities'
                    ? 'Apply on Official Institution Website'
                    : 'Connect with Community Poster'}
                </h3>
                <p className="text-xs text-ivory-200">
                  {listing.section === 'opportunities'
                    ? 'Always verify eligibility and submit your application directly on the official portal.'
                    : 'Discuss details directly and safely. Never send money or mobile money deposits in advance.'}
                </p>
              </div>

              {listing.section === 'opportunities' && listing.applicationUrl && (
                <a
                  href={listing.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-clay-600 hover:bg-clay-500 text-white text-sm font-bold shadow-warm-sm transition-colors shrink-0"
                >
                  <span>Visit Official Application Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {listing.contactPhone && (
                <div>
                  {!phoneRevealed ? (
                    <button
                      type="button"
                      onClick={() => setPhoneRevealed(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 text-xs sm:text-sm font-bold transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Reveal Verified Contact Number</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${listing.contactPhone}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 text-charcoal-900 text-sm font-bold"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{formatPhoneForDisplay(listing.contactPhone)}</span>
                      </a>
                      <a
                        href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-xs font-bold"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mandatory Anti-Fraud & Third-Party Disclaimer Box */}
            <div className="p-4 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-ivory-200 space-y-1.5">
              <p className="font-bold text-gold-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Trust &amp; Safety Reminder
              </p>
              <p>
                1. <strong>Never send money to strangers</strong> for job applications,
                accommodation viewing fees, delivery fees, or item reservations.
              </p>
              <p>
                2. <strong>Never share passwords, PINs, or SMS verification codes</strong> with
                anyone claiming to verify your listing or identity.
              </p>
              <p>
                3. <strong>Disclaimer:</strong> Oppora does not guarantee the accuracy of
                third-party listings. If someone asks you for payment or behaves suspiciously,{' '}
                <button
                  type="button"
                  onClick={() => openReportModal(listing)}
                  className="text-gold-300 underline font-semibold"
                >
                  report this listing immediately
                </button>{' '}
                or{' '}
                <button
                  type="button"
                  onClick={openContactAdminModal}
                  className="text-gold-300 underline font-semibold"
                >
                  contact administrators
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
