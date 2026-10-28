'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Home,
  Gift,
  HeartHandshake,
  Bookmark,
  Search,
  PlusCircle,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  MapPin,
  LogOut,
} from 'lucide-react';
import { OpporaLogo } from './OpporaLogo';
import { useOppora } from './OpporaProvider';
import { GHANA_AND_AFRICA_REGIONS } from '@/lib/types';

const NAV_ITEMS = [
  {
    href: '/opportunities',
    label: 'Opportunities',
    icon: Briefcase,
    badgeColor: 'text-clay-600',
  },
  {
    href: '/accommodation',
    label: 'Accommodation',
    icon: Home,
    badgeColor: 'text-forest-600',
  },
  {
    href: '/exchange',
    label: 'Give & Exchange',
    icon: Gift,
    badgeColor: 'text-gold-600',
  },
  {
    href: '/help',
    label: 'Community Help',
    icon: HeartHandshake,
    badgeColor: 'text-clay-700',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const {
    user,
    signInMember,
    signOutMember,
    savedIds,
    openCreateModal,
  } = useOppora();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [regionInput, setRegionInput] = useState<string>(
    user?.defaultRegion || GHANA_AND_AFRICA_REGIONS[0]
  );
  const [roleIsAdmin, setRoleIsAdmin] = useState(user?.role === 'admin');
  const [authError, setAuthError] = useState('');

  const handleOpenAccountModal = () => {
    setDisplayNameInput(user?.displayName || '');
    setRegionInput(user?.defaultRegion || GHANA_AND_AFRICA_REGIONS[0]);
    setRoleIsAdmin(user?.role === 'admin');
    setAuthError('');
    setAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = await signInMember({
      displayName: displayNameInput,
      defaultRegion: regionInput,
      isAdmin: roleIsAdmin,
    });
    if (!result.ok) {
      setAuthError(result.error || 'Could not update member profile.');
      return;
    }
    setAccountModalOpen(false);
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-charcoal-900 focus:text-ivory-50 focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Community Trust & Zero-Payment Notice Bar */}
      <div className="bg-charcoal-900 text-ivory-100 text-xs border-b border-charcoal-800 w-full">
        <div className="w-full max-w-full px-3 sm:px-6 lg:px-10 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-700 text-gold-200 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Community Platform
            </span>
            <span className="text-ivory-200 hidden sm:inline">
              No listing fees, no prices on housing or community items. Never send money to strangers.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <Link
              href="/guidelines"
              className="text-gold-200 hover:text-gold-100 underline underline-offset-2"
            >
              Safety Guidelines
            </Link>
            <Link
              href="/dashboard"
              className="text-ivory-200 hover:text-white transition-colors"
            >
              My Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-ivory-200 hover:text-white transition-colors"
            >
              Moderation
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-ivory-50/95 backdrop-blur-md border-b border-ivory-200 shadow-warm-sm">
        <div className="w-full max-w-full px-3 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/" aria-label="Oppora Home">
            <OpporaLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-charcoal-900 text-ivory-50 shadow-sm'
                      : 'text-charcoal-700 hover:bg-ivory-200/70 hover:text-charcoal-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-gold-400' : item.badgeColor
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/search"
              className={`p-2.5 rounded-xl border transition-colors ${
                pathname === '/search'
                  ? 'bg-ivory-200 border-charcoal-700 text-charcoal-900'
                  : 'border-ivory-300 text-charcoal-700 hover:bg-ivory-100'
              }`}
              title="Search all sections"
              aria-label="Search all sections"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              href="/saved"
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                pathname === '/saved'
                  ? 'bg-gold-100 border-gold-500 text-charcoal-900'
                  : 'border-ivory-300 text-charcoal-700 hover:bg-ivory-100'
              }`}
              title="Saved & Bookmarked Listings"
            >
              <Bookmark className="w-4 h-4 text-gold-600" />
              <span className="hidden xl:inline">Saved</span>
              {savedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-clay-600 text-white text-[11px] font-bold">
                  {savedIds.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={handleOpenAccountModal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-ivory-300 bg-white hover:bg-ivory-100 text-xs font-semibold text-charcoal-800 transition-colors"
              title="Manage member identity & privacy"
            >
              <UserCheck className="w-4 h-4 text-forest-600" />
              <span className="max-w-[110px] truncate">
                {user ? user.displayName : 'Sign In'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openCreateModal('opportunities')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold shadow-warm-sm transition-all active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Listing</span>
            </button>
          </div>

          {/* Mobile Quick Actions & Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/search"
              className="p-2 rounded-xl border border-ivory-300 text-charcoal-800 hover:bg-ivory-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => openCreateModal('opportunities')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-clay-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-ivory-300 text-charcoal-900 hover:bg-ivory-100"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ivory-200 bg-ivory-50 px-4 pt-3 pb-6 space-y-4 shadow-warm-lg">
            <div className="grid grid-cols-1 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                      isActive
                        ? 'bg-charcoal-900 text-ivory-50'
                        : 'text-charcoal-800 hover:bg-ivory-200/70'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-gold-400' : item.badgeColor
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-ivory-200 grid grid-cols-2 gap-2">
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-800"
              >
                <Bookmark className="w-4 h-4 text-gold-600" />
                Saved ({savedIds.length})
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-800"
              >
                <UserCheck className="w-4 h-4 text-forest-600" />
                My Dashboard
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-800"
              >
                <ShieldCheck className="w-4 h-4 text-clay-600" />
                Admin Panel
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenAccountModal();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-ivory-300 bg-ivory-100 text-xs font-semibold text-charcoal-900"
              >
                {user ? user.displayName : 'Sign In / Profile'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Member Sign-In / Privacy Profile Modal */}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-modal-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-md w-full p-6 shadow-warm-lg space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-600">
                  Account &amp; Privacy Protection
                </span>
                <h2
                  id="account-modal-title"
                  className="text-xl font-display font-bold text-charcoal-900 mt-1"
                >
                  {user ? 'Your Community Profile' : 'Sign In to Oppora'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-ivory-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
                Privacy Guarantee
              </p>
              <p>
                Oppora never exposes private account emails or internal account IDs publicly.
                Only your chosen Display Name and verified contact number on specific posts are shown.
              </p>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-clay-50 border border-clay-200 text-xs text-clay-800 font-medium">
                  {authError}
                </div>
              )}

              <div>
                <label
                  htmlFor="member-display-name"
                  className="block text-xs font-semibold text-charcoal-800 mb-1.5"
                >
                  Public Display Name *
                </label>
                <input
                  id="member-display-name"
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="e.g., Ama Osei or Kumasi Youth Hub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
                />
              </div>

              <div>
                <label
                  htmlFor="member-region"
                  className="block text-xs font-semibold text-charcoal-800 mb-1.5"
                >
                  Primary Region (Ghana)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3" />
                  <select
                    id="member-region"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
                  >
                    {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-charcoal-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={roleIsAdmin}
                  onChange={(e) => setRoleIsAdmin(e.target.checked)}
                  className="mt-0.5 rounded border-ivory-300 text-clay-600 focus:ring-clay-500"
                />
                <span>
                  Enable <strong>Moderator / Administrator</strong> permissions for this session
                  (allows reviewing submissions &amp; moderating reports in the Admin Dashboard).
                </span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-2">
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await signOutMember();
                      setAccountModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-clay-200 text-clay-700 hover:bg-clay-50 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs font-semibold shadow-sm"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
