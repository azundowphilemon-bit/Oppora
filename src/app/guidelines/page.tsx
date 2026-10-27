import React from 'react';
import type { Metadata } from 'next';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  PhoneCall,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Guidelines, Trust & Safety Policy',
  description:
    'Read the mandatory Oppora Community Guidelines, anti-scam rules, zero-payment policy, and third-party listing disclaimer across Ghana and Africa.',
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-charcoal-900 text-ivory-50 rounded-3xl p-8 sm:p-12 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          Trust, Safety &amp; Community Integrity
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold">
          Oppora Community Guidelines &amp; Safety Charter
        </h1>
        <p className="text-sm sm:text-base text-ivory-200 leading-relaxed">
          Oppora exists to connect people across Ghana and Africa with real opportunities,
          community-shared accommodation, free item exchanges, and practical mutual support.
          Every member must accept and follow these rules before posting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-clay-50 text-clay-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            1. Never Send Money or Share Verification Codes
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            Never send mobile money, bank transfers, viewing fees, delivery fees, or
            application fees to strangers. Never share your passwords, Mobile Money PIN, or
            SMS verification codes with anyone for any reason.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            2. Zero Prices &amp; No Payment Processing
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            Accommodation listings (for rent, sale, or sharing) and Community Give &amp;
            Exchange items must not display prices, demand checkout payments, or charge fees.
            Featured posts are selected strictly by administrators for community value—never paid.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            3. Privacy &amp; Validated Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            Oppora protects user accounts and never exposes private account email addresses or
            internal IDs publicly. Contact phone numbers and uploaded photos are validated to
            prevent spam and malicious files.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-ivory-200 p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-clay-50 text-clay-700 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-charcoal-900">
            4. Zero Tolerance for Fabricated Listings
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            Never post fabricated job vacancies, fake scholarships, or non-existent
            accommodation. All opportunities must link directly to an official institutional
            application portal.
          </p>
        </div>
      </div>

      {/* Legal & Third-Party Accuracy Disclaimer */}
      <div className="bg-ivory-100 rounded-2xl border border-ivory-300 p-6 sm:p-8 space-y-3">
        <h3 className="text-base font-display font-bold text-charcoal-900 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-clay-600" />
          Official Third-Party Accuracy Disclaimer
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
          <strong>Oppora does not guarantee the accuracy, completeness, or reliability of
          third-party listings.</strong> Community members interact at their own discretion.
          When inspecting accommodation or exchanging community items, always meet in a safe,
          public daylight location, bring a trusted friend or family member, and report any
          suspicious listing using the &ldquo;Report&rdquo; button on every post.
        </p>
      </div>
    </div>
  );
}
