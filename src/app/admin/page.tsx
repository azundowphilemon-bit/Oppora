'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Flag,
  FolderKanban,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  AdminMessage,
  CategoryItem,
  Listing,
  SafetyReport,
  SectionType,
} from '@/lib/types';
import { getStatusBadgeConfig } from '@/components/ListingCard';
import { useOppora } from '@/components/OpporaProvider';

export default function AdminDashboardPage() {
  const { triggerRefresh, refreshSignal } = useOppora();

  const [activeTab, setActiveTab] = useState<
    'submissions' | 'reports' | 'categories' | 'messages'
  >('submissions');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');

  // New Category form state
  const [newCatSection, setNewCatSection] = useState<SectionType>('opportunities');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadAllAdminData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/listings?moderation=true').then((r) => r.json()),
      fetch('/api/reports').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/contact-admin').then((r) => r.json()),
    ])
      .then(([listData, repData, catData, msgData]) => {
        if (Array.isArray(listData.listings)) setListings(listData.listings);
        if (Array.isArray(repData.reports)) setReports(repData.reports);
        if (Array.isArray(catData.categories)) setCategories(catData.categories);
        if (Array.isArray(msgData.messages)) setMessages(msgData.messages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData, refreshSignal]);

  const handleToggleFeatured = async (item: Listing) => {
    const res = await fetch(`/api/listings/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !item.isFeatured }),
    });
    if (res.ok) {
      setBanner(
        !item.isFeatured
          ? `Selected "${item.title}" as a Community Featured post (no paid promotion).`
          : `Removed "${item.title}" from Community Featured posts.`
      );
      loadAllAdminData();
      triggerRefresh();
    }
  };

  const handleModerateListingStatus = async (
    id: string,
    status: Listing['status']
  ) => {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBanner(`Updated listing moderation status to "${status}".`);
      loadAllAdminData();
      triggerRefresh();
    }
  };

  const handleResolveReport = async (
    reportId: string,
    status: SafetyReport['status'],
    rejectListingId?: string
  ) => {
    const res = await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status, rejectListingId }),
    });
    if (res.ok) {
      setBanner(
        rejectListingId
          ? 'Report resolved and violating listing removed from public directory.'
          : `Report marked as ${status}.`
      );
      loadAllAdminData();
      triggerRefresh();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: newCatSection,
        name: newCatName,
        description: newCatDesc,
      }),
    });
    if (res.ok) {
      setNewCatName('');
      setNewCatDesc('');
      setBanner('New category added.');
      loadAllAdminData();
    }
  };

  const handleToggleCategory = async (id: string) => {
    const res = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      loadAllAdminData();
    }
  };

  const handleMarkMessageReviewed = async (id: string) => {
    const res = await fetch('/api/contact-admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      loadAllAdminData();
    }
  };

  const openReportsCount = reports.filter((r) => r.status === 'open').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-charcoal-900 text-ivory-50 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-400">
              <ShieldCheck className="w-4 h-4" />
              Trust, Safety &amp; Curation Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              Oppora Administrator &amp; Moderation Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-ivory-200 max-w-2xl">
              Review community submissions, select non-paid Featured community posts, moderate
              safety reports, and manage directory categories across Ghana &amp; Africa.
            </p>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-xs text-ivory-300 block">Total Listings</span>
            <strong className="text-2xl font-display font-bold text-white">
              {listings.length}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-xs text-ivory-300 block">Open Safety Reports</span>
            <strong className="text-2xl font-display font-bold text-gold-400">
              {openReportsCount}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-xs text-ivory-300 block">Moderator Featured Picks</span>
            <strong className="text-2xl font-display font-bold text-forest-200">
              {listings.filter((l) => l.isFeatured).length}
            </strong>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-xs text-ivory-300 block">Active Categories</span>
            <strong className="text-2xl font-display font-bold text-white">
              {categories.filter((c) => c.isActive).length}
            </strong>
          </div>
        </div>
      </div>

      {banner && (
        <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs sm:text-sm font-semibold text-forest-900 flex items-center justify-between">
          <span>{banner}</span>
          <button
            type="button"
            onClick={() => setBanner('')}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ivory-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'submissions'
              ? 'bg-charcoal-900 text-ivory-50'
              : 'bg-white border border-ivory-200 text-charcoal-700 hover:bg-ivory-100'
          }`}
        >
          <Award className="w-4 h-4 text-gold-500" />
          <span>Submissions &amp; Featured ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'reports'
              ? 'bg-charcoal-900 text-ivory-50'
              : 'bg-white border border-ivory-200 text-charcoal-700 hover:bg-ivory-100'
          }`}
        >
          <Flag className="w-4 h-4 text-clay-600" />
          <span>Safety Reports ({openReportsCount} Open)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'categories'
              ? 'bg-charcoal-900 text-ivory-50'
              : 'bg-white border border-ivory-200 text-charcoal-700 hover:bg-ivory-100'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-forest-600" />
          <span>Manage Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'messages'
              ? 'bg-charcoal-900 text-ivory-50'
              : 'bg-white border border-ivory-200 text-charcoal-700 hover:bg-ivory-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-clay-600" />
          <span>Member Inquiries ({unreadMessagesCount} Unread)</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-charcoal-600">
          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
          <span>Loading moderation console...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: SUBMISSIONS & FEATURED CURATION */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {listings.map((item) => {
                const badge = getStatusBadgeConfig(item.status);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-warm-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-ivory-100 text-charcoal-800 text-xs font-bold uppercase">
                          {item.section}
                        </span>
                        {item.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 text-xs font-bold">
                            Moderator Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-display font-bold text-charcoal-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-charcoal-600">
                        By <strong>{item.ownerDisplayName}</strong> &bull; {item.city},{' '}
                        {item.region} &bull; Category: {item.category}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                          item.isFeatured
                            ? 'bg-gold-100 border-gold-400 text-charcoal-900'
                            : 'border-ivory-300 text-charcoal-700 hover:bg-ivory-100'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-gold-600" />
                        <span>{item.isFeatured ? 'Unfeature' : 'Feature (Free)'}</span>
                      </button>

                      {item.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => handleModerateListingStatus(item.id, 'active')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-600 text-white text-xs font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {item.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleModerateListingStatus(item.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-clay-50 border border-clay-200 text-clay-700 text-xs font-bold hover:bg-clay-100"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}

                      <Link
                        href={`/${item.section}/${item.id}`}
                        className="p-2 rounded-xl border border-ivory-200 text-charcoal-600 hover:bg-ivory-100"
                        title="Inspect listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SAFETY REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-ivory-200 p-8 text-center text-sm text-charcoal-600">
                  No safety reports have been submitted yet.
                </div>
              ) : (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-warm-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            rep.status === 'open'
                              ? 'bg-clay-100 text-clay-800'
                              : rep.status === 'resolved'
                              ? 'bg-forest-100 text-forest-800'
                              : 'bg-charcoal-100 text-charcoal-700'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-bold text-clay-700">{rep.reason}</span>
                        <span className="text-xs text-charcoal-500">
                          &bull; {new Date(rep.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-charcoal-900">
                        Listing: {rep.listingTitle}
                      </h3>
                      <p className="text-xs text-charcoal-700 bg-ivory-50 p-3 rounded-xl border border-ivory-200">
                        {rep.details}
                      </p>
                      {rep.reporterContact && (
                        <p className="text-[11px] text-charcoal-500">
                          Reporter Contact: {rep.reporterContact}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleResolveReport(rep.id, 'resolved', rep.listingId)
                        }
                        className="px-3.5 py-2 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold"
                      >
                        Resolve &amp; Suspend Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3.5 py-2 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 text-xs font-bold"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleAddCategory}
                className="lg:col-span-4 bg-white rounded-2xl border border-ivory-200 p-5 shadow-warm-sm space-y-4"
              >
                <h2 className="text-base font-display font-bold text-charcoal-900">
                  Add New Category
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Section *
                  </label>
                  <select
                    value={newCatSection}
                    onChange={(e) => setNewCatSection(e.target.value as SectionType)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-ivory-50 text-xs font-semibold text-charcoal-900"
                  >
                    <option value="opportunities">Opportunities</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="exchange">Community Give &amp; Exchange</option>
                    <option value="help">Community Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g., Agricultural Grants"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short category description..."
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-clay-600 text-ivory-50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </form>

              <div className="lg:col-span-8 space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-ivory-200 p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-ivory-100 text-[11px] font-bold uppercase text-charcoal-700">
                          {cat.section}
                        </span>
                        <strong className="text-sm text-charcoal-900">{cat.name}</strong>
                      </div>
                      <p className="text-xs text-charcoal-500 mt-1">{cat.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        cat.isActive
                          ? 'bg-forest-50 border-forest-200 text-forest-800'
                          : 'bg-charcoal-100 border-charcoal-200 text-charcoal-600'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEMBER INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-ivory-200 p-8 text-center text-sm text-charcoal-600">
                  No administrator messages received yet.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white rounded-2xl border border-ivory-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            msg.status === 'unread'
                              ? 'bg-gold-100 text-gold-800'
                              : 'bg-forest-50 text-forest-800'
                          }`}
                        >
                          {msg.status}
                        </span>
                        <strong className="text-sm text-charcoal-900">{msg.subject}</strong>
                      </div>
                      <p className="text-xs text-charcoal-700">{msg.message}</p>
                      <p className="text-[11px] text-charcoal-500">
                        From: {msg.senderName} ({msg.senderContact})
                      </p>
                    </div>
                    {msg.status === 'unread' && (
                      <button
                        type="button"
                        onClick={() => handleMarkMessageReviewed(msg.id)}
                        className="px-3.5 py-2 rounded-xl bg-charcoal-900 text-ivory-50 text-xs font-bold shrink-0"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
