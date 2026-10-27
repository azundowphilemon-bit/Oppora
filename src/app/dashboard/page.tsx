'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Clock,
  X,
} from 'lucide-react';
import {
  GHANA_AND_AFRICA_REGIONS,
  Listing,
  ListingStatus,
} from '@/lib/types';
import { getStatusBadgeConfig } from '@/components/ListingCard';
import { useOppora } from '@/components/OpporaProvider';

export default function UserDashboardPage() {
  const { user, openCreateModal, refreshSignal, triggerRefresh } = useOppora();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Edit modal state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation dialog state
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const loadListings = useCallback(() => {
    setLoading(true);
    fetch('/api/listings?moderation=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings, refreshSignal]);

  // Personal posts belong to current user (or any non-system community member post in local session)
  const myListings = listings.filter((item) => {
    if (!user) return item.ownerId !== 'system-verified-curator';
    return (
      item.ownerId === user.id ||
      item.ownerDisplayName.toLowerCase() === user.displayName.toLowerCase() ||
      item.ownerId === 'community-member'
    );
  });

  const handleStatusChange = async (
    listingId: string,
    newStatus: ListingStatus,
    renewExpiry = false
  ) => {
    setFeedback(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, renewExpiry }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Could not update status.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `Listing status updated to "${newStatus.replace('_', ' ')}".`,
        });
        loadListings();
        triggerRefresh();
      }
    } catch {
      setFeedback({ type: 'err', text: 'Failed to update listing status.' });
    }
  };

  const openEdit = (item: Listing) => {
    setEditingListing(item);
    setEditTitle(item.title);
    setEditSummary(item.summary);
    setEditDescription(item.description);
    setEditRegion(item.region);
    setEditCity(item.city);
    setEditPhone(item.contactPhone || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setSavingEdit(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          description: editDescription,
          region: editRegion,
          city: editCity,
          contactPhone: editPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Validation error while saving.' });
      } else {
        setFeedback({ type: 'ok', text: 'Your listing changes have been saved.' });
        setEditingListing(null);
        loadListings();
        triggerRefresh();
      }
    } catch {
      setFeedback({ type: 'err', text: 'Could not save changes.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    setDeletingBusy(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/listings/${deletingListing.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setFeedback({ type: 'err', text: 'Could not remove listing.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `"${deletingListing.title}" has been permanently removed.`,
        });
        setDeletingListing(null);
        loadListings();
        triggerRefresh();
      }
    } catch {
      setFeedback({ type: 'err', text: 'Error removing listing.' });
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-ivory-200 p-6 sm:p-10 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest-700">
            <UserCheck className="w-4 h-4 text-forest-600" />
            Member Listing Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900">
            My Community Dashboard
          </h1>
          <p className="text-sm text-charcoal-600 max-w-xl">
            Signed in as{' '}
            <strong className="text-charcoal-900">
              {user ? user.displayName : 'Community Member'}
            </strong>
            . Manage, edit, update availability status (active, exchanged, given away,
            unavailable, expired), or remove your personal posts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openCreateModal('accommodation')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post Housing</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('exchange')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post New Listing</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-forest-50 border-forest-200 text-forest-900'
              : 'bg-clay-50 border-clay-200 text-clay-900'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-clay-600 shrink-0" />
            )}
            {feedback.text}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-sm text-charcoal-600">
          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
          <span>Loading your posts...</span>
        </div>
      ) : myListings.length > 0 ? (
        <div className="space-y-4">
          {myListings.map((item) => {
            const badge = getStatusBadgeConfig(item.status);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-ivory-200 p-5 sm:p-6 shadow-warm-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-ivory-100 text-charcoal-700 text-xs font-bold uppercase">
                      {item.section}
                    </span>
                    <span className="text-xs text-charcoal-500 font-medium">
                      {item.category} &bull; {item.city}, {item.region}
                    </span>
                  </div>

                  <h2 className="text-lg font-display font-bold text-charcoal-900">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal-600 line-clamp-2">
                    {item.summary}
                  </p>
                  <p className="text-[11px] text-charcoal-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Expires: {new Date(item.expiresAt).toLocaleDateString('en-GB')}
                  </p>
                </div>

                {/* Status & Action Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-ivory-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={`status-select-${item.id}`}
                      className="text-xs font-semibold text-charcoal-600"
                    >
                      Status:
                    </label>
                    <select
                      id={`status-select-${item.id}`}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as ListingStatus)
                      }
                      className="px-3 py-1.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs font-bold text-charcoal-900"
                    >
                      <option value="active">Active</option>
                      <option value="exchanged">Exchanged</option>
                      <option value="given_away">Given Away</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="expired">Expired</option>
                    </select>

                    {item.status === 'expired' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'active', true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-600 text-white text-xs font-bold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Renew +30d
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${item.section}/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-xs font-semibold text-charcoal-800"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-xs font-semibold text-charcoal-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingListing(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-clay-200 hover:bg-clay-50 text-xs font-semibold text-clay-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ivory-200 p-10 text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-xl font-display font-bold text-charcoal-900">
            You haven&apos;t published any personal listings yet
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Share a room or apartment for rent/sharing, post personal items to give away or
            exchange, offer mentoring in Community Help, or share a verified opportunity!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openCreateModal('accommodation')}
              className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold"
            >
              + Post Accommodation
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('exchange')}
              className="px-4 py-2.5 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-bold"
            >
              + Give or Exchange Item
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('help')}
              className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs font-bold"
            >
              + Offer / Request Help
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingListing && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-listing-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-lg w-full p-6 shadow-warm-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2
                id="edit-listing-title"
                className="text-lg font-display font-bold text-charcoal-900"
              >
                Edit Listing
              </h2>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-ivory-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={160}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs sm:text-sm text-charcoal-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Region *
                  </label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  >
                    {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    City / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Short Summary *
                </label>
                <input
                  type="text"
                  required
                  minLength={10}
                  maxLength={320}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={20}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                />
              </div>

              {editingListing.section !== 'opportunities' && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs font-semibold"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingListing && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-md w-full p-6 shadow-warm-lg space-y-4">
            <h2
              id="delete-confirm-title"
              className="text-lg font-display font-bold text-charcoal-900"
            >
              Remove Listing Permanently?
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
              Are you sure you want to delete <strong>{deletingListing.title}</strong>? If the
              item was already given away or exchanged, you can also mark its status as{' '}
              <em>Given Away</em> or <em>Exchanged</em> instead of deleting it.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingListing(null)}
                className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700"
              >
                Keep Listing
              </button>
              <button
                type="button"
                disabled={deletingBusy}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold"
              >
                {deletingBusy ? 'Removing...' : 'Yes, Remove Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
