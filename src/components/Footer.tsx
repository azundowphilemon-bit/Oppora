'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  HeartHandshake,
  MessageSquareWarning,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { KenteAccentBar, OpporaLogo } from './OpporaLogo';
import { useOppora } from './OpporaProvider';

export function Footer() {
  const { openContactAdminModal, openCreateModal } = useOppora();

  return (
    <footer className="bg-charcoal-900 text-ivory-100 border-t border-charcoal-800 mt-20">
      <KenteAccentBar className="rounded-none h-2" />

      {/* Mandatory Trust, Safety & Third-Party Disclaimer Banner */}
      <div className="bg-charcoal-800/80 border-b border-charcoal-700">
        <div className="w-full max-w-full px-3 sm:px-6 lg:px-10 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-clay-600/20 text-gold-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ivory-50">
                Never Send Money or Share Codes
              </h3>
              <p className="text-xs text-ivory-200 mt-1 leading-relaxed">
                Never pay inspection fees, application fees, or mobile money deposits to strangers.
                Never share your passwords, PINs, or SMS verification codes with anyone.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-forest-600/20 text-forest-200 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ivory-50">
                Zero Prices &amp; No Paid Promotion
              </h3>
              <p className="text-xs text-ivory-200 mt-1 leading-relaxed">
                Oppora processes no payments and prohibits prices on community items and housing.
                Featured posts are selected strictly by moderators for community merit—never paid.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-gold-500/20 text-gold-200 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ivory-50">
                Third-Party Listing Disclaimer
              </h3>
              <p className="text-xs text-ivory-200 mt-1 leading-relaxed">
                <strong>Important Disclaimer:</strong> Oppora does not guarantee the accuracy,
                completeness, or safety of third-party listings. Always verify opportunities on
                official institutional websites and meet in safe public places.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="w-full max-w-full px-3 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <OpporaLogo size="md" lightText />
            <p className="text-sm text-ivory-200 max-w-md leading-relaxed">
              Connecting communities across all 16 regions of Ghana with verified educational and career
              opportunities, community-shared housing, free item exchange, and practical mutual support.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openCreateModal('opportunities')}
                className="px-4 py-2 rounded-xl bg-clay-600 hover:bg-clay-500 text-white text-xs font-semibold transition-colors"
              >
                + Share a Listing
              </button>
              <button
                type="button"
                onClick={openContactAdminModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-charcoal-700 hover:border-gold-400 text-ivory-100 text-xs font-semibold transition-colors"
              >
                <MessageSquareWarning className="w-3.5 h-3.5 text-gold-400" />
                Contact Administrators
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Main Sections
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory-200">
              <li>
                <Link href="/opportunities" className="hover:text-white transition-colors">
                  Opportunities &amp; Scholarships
                </Link>
              </li>
              <li>
                <Link href="/accommodation" className="hover:text-white transition-colors">
                  Accommodation (Rent, Sale, Share)
                </Link>
              </li>
              <li>
                <Link href="/exchange" className="hover:text-white transition-colors">
                  Community Give &amp; Exchange
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Community Help &amp; Mentoring
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Global Search &amp; Filters
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Member Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory-200">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Listings Dashboard
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-white transition-colors">
                  Saved &amp; Bookmarked Posts
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Moderator &amp; Admin Panel
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Regions Served
            </h4>
            <ul className="space-y-2 text-xs text-ivory-200">
              <li>Greater Accra &amp; Tema</li>
              <li>Kumasi &amp; Ashanti Region</li>
              <li>North East (Nalerigu, Walewale &amp; Kpasenkpe)</li>
              <li>Tamale, Bolgatanga, Wa &amp; Damongo</li>
              <li>Takoradi, Cape Coast, Ho &amp; Koforidua</li>
              <li>Sunyani, Techiman, Goaso &amp; All 16 Regions</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory-300">
          <p>
            &copy; {new Date().getFullYear()} Oppora Community Platform (Ghana). Built for
            accessibility, speed, and community trust.
          </p>
          <p className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-clay-500" />
            <span>No AI fabrication &bull; No checkout &bull; Community-moderated</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
