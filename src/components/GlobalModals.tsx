'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldAlert,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Flag,
  MessageSquareWarning,
} from 'lucide-react';
import { useOppora } from './OpporaProvider';
import {
  AccommodationMode,
  AccommodationType,
  CategoryItem,
  ExchangeMode,
  GHANA_AND_AFRICA_REGIONS,
  HelpMode,
  ItemCondition,
  OpportunityType,
  REGION_TOWNS,
  REPORT_REASONS,
  ReportReason,
  SectionType,
} from '@/lib/types';

export function GlobalModals() {
  const {
    user,
    reportTarget,
    closeReportModal,
    blockListing,
    contactAdminOpen,
    closeContactAdminModal,
    createModalSection,
    closeCreateModal,
    triggerRefresh,
  } = useOppora();

  // --- REPORT MODAL STATE ---
  const [reportReason, setReportReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [alsoBlockOnReport, setAlsoBlockOnReport] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  // --- CONTACT ADMIN MODAL STATE ---
  const [adminSenderName, setAdminSenderName] = useState('');
  const [adminSenderContact, setAdminSenderContact] = useState('');
  const [adminSubject, setAdminSubject] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminError, setAdminError] = useState('');

  // --- CREATE LISTING MODAL STATE ---
  const [section, setSection] = useState<SectionType>('opportunities');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState<string>(GHANA_AND_AFRICA_REGIONS[0]);
  const [city, setCity] = useState('');
  const [ownerDisplayName, setOwnerDisplayName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Section-specific state
  const [opportunityType, setOpportunityType] = useState<OpportunityType>('job');
  const [organization, setOrganization] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');

  const [accommodationMode, setAccommodationMode] = useState<AccommodationMode>('rent');
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('Room');
  const [amenitiesInput, setAmenitiesInput] = useState('Water supply, Electricity meter, Veranda');

  const [exchangeMode, setExchangeMode] = useState<ExchangeMode>('free_giveaway');
  const [itemCondition, setItemCondition] = useState<ItemCondition>('Good');
  const [exchangePreference, setExchangePreference] = useState('');

  const [helpMode, setHelpMode] = useState<HelpMode>('offer');
  const [availability, setAvailability] = useState('Weekends & Evenings');
  const [isRemoteFriendly, setIsRemoteFriendly] = useState(true);

  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    if (createModalSection) {
      setSection(createModalSection);
      setOwnerDisplayName(user?.displayName || '');
      setRegion(user?.defaultRegion || GHANA_AND_AFRICA_REGIONS[0]);
      setCreateError('');
      setCreateSuccess(false);
    }
  }, [createModalSection, user]);

  useEffect(() => {
    if (!createModalSection) return;
    fetch(`/api/categories?section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategory(data.categories[0].name);
          }
        }
      })
      .catch(() => {});
  }, [section, createModalSection]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length >= 4) {
      setCreateError('Maximum of 4 photos allowed per listing.');
      return;
    }

    setCreateError('');
    setUploadingPhoto(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Photo validation failed.');
      } else if (data.url) {
        setImages((prev) => [...prev, data.url].slice(0, 4));
      }
    } catch {
      setCreateError('Unable to upload photo. Ensure it is a JPG, PNG, or WebP under 5MB.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);

    try {
      const autoSummary =
        summary.trim().length >= 10
          ? summary.trim().slice(0, 320)
          : description.trim().replace(/\s+/g, ' ').slice(0, 200);

      const payload = {
        section,
        category,
        title,
        summary: autoSummary,
        description,
        country: 'Ghana',
        region,
        city,
        ownerId: user?.id || 'community-member',
        ownerDisplayName: ownerDisplayName || user?.displayName || 'Community Member',
        contactPhone,
        acceptedGuidelines,
        images,
        opportunityType: section === 'opportunities' ? opportunityType : undefined,
        organization: section === 'opportunities' ? organization : undefined,
        applicationUrl: section === 'opportunities' ? applicationUrl : undefined,
        deadline: section === 'opportunities' && deadline ? deadline : null,
        accommodationMode: section === 'accommodation' ? accommodationMode : undefined,
        accommodationType: section === 'accommodation' ? accommodationType : undefined,
        amenities:
          section === 'accommodation'
            ? amenitiesInput
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        exchangeMode: section === 'exchange' ? exchangeMode : undefined,
        itemCondition: section === 'exchange' ? itemCondition : undefined,
        exchangePreference:
          section === 'exchange' && exchangeMode === 'exchange'
            ? exchangePreference
            : undefined,
        helpMode: section === 'help' ? helpMode : undefined,
        availability: section === 'help' ? availability : undefined,
        isRemoteFriendly: section === 'help' ? isRemoteFriendly : undefined,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Please review all required fields.');
      } else {
        setCreateSuccess(true);
        triggerRefresh();
        setTimeout(() => {
          setTitle('');
          setSummary('');
          setDescription('');
          setCity('');
          setContactPhone('');
          setApplicationUrl('');
          setOrganization('');
          setImages([]);
          setAcceptedGuidelines(false);
          setCreateSuccess(false);
          closeCreateModal();
        }, 1200);
      }
    } catch {
      setCreateError('Network error while saving your post. Please try again.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    setReportError('');
    setReportSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: reportTarget.id,
          listingTitle: reportTarget.title,
          reason: reportReason,
          details: reportDetails,
          reporterContact: reportContact,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error || 'Could not submit report.');
      } else {
        if (alsoBlockOnReport) {
          blockListing(reportTarget.id);
        }
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setReportDetails('');
          setAlsoBlockOnReport(false);
          closeReportModal();
        }, 1200);
      }
    } catch {
      setReportError('Failed to send safety report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleContactAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSubmitting(true);

    try {
      const res = await fetch('/api/contact-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: adminSenderName || user?.displayName || '',
          senderContact: adminSenderContact,
          subject: adminSubject,
          message: adminMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Could not send message.');
      } else {
        setAdminSuccess(true);
        setTimeout(() => {
          setAdminSuccess(false);
          setAdminSubject('');
          setAdminMessage('');
          closeContactAdminModal();
        }, 1200);
      }
    } catch {
      setAdminError('Failed to send message to administrators.');
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. CREATE LISTING MODAL */}
      {createModalSection && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-listing-modal-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-warm-lg my-auto max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-ivory-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-clay-600">
                  Community Contribution &bull; 100% Free
                </span>
                <h2
                  id="create-listing-modal-title"
                  className="text-xl sm:text-2xl font-display font-bold text-charcoal-900 mt-0.5"
                >
                  Publish a Verified Community Listing
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="p-2 rounded-xl text-charcoal-500 hover:bg-ivory-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trust & Safety Warning Banner */}
            <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 text-xs text-charcoal-800 space-y-1">
              <p className="font-bold text-charcoal-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-clay-600 shrink-0" />
                Mandatory Community Safety Rules
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-charcoal-700">
                <li>
                  <strong>No Prices or Payments:</strong> Do not list prices, inspection fees, or
                  registration fees on Accommodation or Community Give &amp; Exchange posts.
                </li>
                <li>
                  <strong>No Fabricated Listings:</strong> Only share genuine opportunities with
                  official links or real items/housing you personally offer.
                </li>
                <li>
                  <strong>Protect Yourself:</strong> Never send money to strangers or share
                  passwords and SMS verification codes.
                </li>
              </ul>
            </div>

            {createSuccess ? (
              <div className="p-8 rounded-2xl bg-forest-50 border border-forest-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-forest-600 mx-auto" />
                <h3 className="text-lg font-display font-bold text-forest-900">
                  Listing Published Successfully!
                </h3>
                <p className="text-xs text-forest-800">
                  Your post is now live and accessible to the community. You can edit, update its
                  status, or remove it anytime from your Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {createError && (
                  <div className="p-3.5 rounded-xl bg-clay-50 border border-clay-200 text-xs text-clay-800 font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-clay-600 shrink-0 mt-0.5" />
                    <span>{createError}</span>
                  </div>
                )}

                {/* Section Switcher */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                    1. Choose Section *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'opportunities', label: 'Opportunities' },
                        { id: 'accommodation', label: 'Accommodation' },
                        { id: 'exchange', label: 'Give & Exchange' },
                        { id: 'help', label: 'Community Help' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSection(tab.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          section === tab.id
                            ? 'bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm'
                            : 'bg-white text-charcoal-700 border-ivory-300 hover:bg-ivory-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section-Specific Classification */}
                {section === 'opportunities' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-ivory-100 border border-ivory-200">
                    <div>
                      <label
                        htmlFor="opp-type"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Opportunity Type *
                      </label>
                      <select
                        id="opp-type"
                        value={opportunityType}
                        onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-medium text-charcoal-900"
                      >
                        <option value="job">Job / Career Opening</option>
                        <option value="internship">Internship</option>
                        <option value="apprenticeship">Apprenticeship</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="grant">Grant / Fellowship</option>
                        <option value="course">Free Online Course</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="opp-org"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Institution / Organization *
                      </label>
                      <input
                        id="opp-org"
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g., KNUST / Ghana Tech Lab"
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="opp-url"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Official Application Link (https://...) *
                      </label>
                      <input
                        id="opp-url"
                        type="url"
                        required
                        value={applicationUrl}
                        onChange={(e) => setApplicationUrl(e.target.value)}
                        placeholder="https://official-portal.org/apply"
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="opp-deadline"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Application Deadline (Optional)
                      </label>
                      <input
                        id="opp-deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                  </div>
                )}

                {section === 'accommodation' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-forest-50/70 border border-forest-200">
                    <div>
                      <label
                        htmlFor="acc-mode"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Listing Purpose (Rent, Sale, or Sharing) *
                      </label>
                      <select
                        id="acc-mode"
                        value={accommodationMode}
                        onChange={(e) =>
                          setAccommodationMode(e.target.value as AccommodationMode)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900"
                      >
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                        <option value="sharing">For Sharing (Roommate / Flatshare)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="acc-type"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Accommodation Type *
                      </label>
                      <select
                        id="acc-type"
                        value={accommodationType}
                        onChange={(e) =>
                          setAccommodationType(e.target.value as AccommodationType)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900"
                      >
                        <option value="Room">Room</option>
                        <option value="Studio / Chamber & Hall">Studio / Chamber &amp; Hall</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Shared Flat">Shared Flat</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="acc-amenities"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Key Features / Amenities (Comma-separated, NO prices allowed)
                      </label>
                      <input
                        id="acc-amenities"
                        type="text"
                        value={amenitiesInput}
                        onChange={(e) => setAmenitiesInput(e.target.value)}
                        placeholder="e.g., Pipe-borne water, Separate meter, Fenced compound, Near trotro station"
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                  </div>
                )}

                {section === 'exchange' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gold-50/70 border border-gold-200">
                    <div>
                      <label
                        htmlFor="ex-mode"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Offer Type (Free vs. Exchange) *
                      </label>
                      <select
                        id="ex-mode"
                        value={exchangeMode}
                        onChange={(e) => setExchangeMode(e.target.value as ExchangeMode)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900"
                      >
                        <option value="free_giveaway">Free Give-Away (No Return Needed)</option>
                        <option value="exchange">Community Item Exchange (Direct Swap)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="ex-condition"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Item Condition *
                      </label>
                      <select
                        id="ex-condition"
                        value={itemCondition}
                        onChange={(e) => setItemCondition(e.target.value as ItemCondition)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900"
                      >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair / Functional">Fair / Functional</option>
                      </select>
                    </div>
                    {exchangeMode === 'exchange' && (
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="ex-pref"
                          className="block text-xs font-semibold text-charcoal-800 mb-1"
                        >
                          What item are you hoping to exchange for? (No cash/prices allowed) *
                        </label>
                        <input
                          id="ex-pref"
                          type="text"
                          required
                          value={exchangePreference}
                          onChange={(e) => setExchangePreference(e.target.value)}
                          placeholder="e.g., Engineering textbooks, desk lamp, or scientific calculator"
                          className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                        />
                      </div>
                    )}
                  </div>
                )}

                {section === 'help' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-clay-50/70 border border-clay-200">
                    <div>
                      <label
                        htmlFor="help-mode"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Assistance Direction *
                      </label>
                      <select
                        id="help-mode"
                        value={helpMode}
                        onChange={(e) => setHelpMode(e.target.value as HelpMode)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-900"
                      >
                        <option value="offer">Offering Assistance / Mentoring</option>
                        <option value="request">Requesting Practical Assistance</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="help-availability"
                        className="block text-xs font-semibold text-charcoal-800 mb-1"
                      >
                        Schedule / Availability *
                      </label>
                      <input
                        id="help-availability"
                        type="text"
                        required
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g., Saturdays 10am-1pm or WhatsApp evenings"
                        className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-charcoal-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRemoteFriendly}
                          onChange={(e) => setIsRemoteFriendly(e.target.checked)}
                          className="rounded border-ivory-300 text-clay-600"
                        />
                        <span>Can be provided remotely (Phone / Online across Ghana &amp; Africa)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Common Listing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="listing-category"
                      className="block text-xs font-semibold text-charcoal-800 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="listing-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-medium text-charcoal-900"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="listing-region"
                      className="block text-xs font-semibold text-charcoal-800 mb-1"
                    >
                      Region *
                    </label>
                    <select
                      id="listing-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-medium text-charcoal-900"
                    >
                      {GHANA_AND_AFRICA_REGIONS.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="listing-city"
                      className="block text-xs font-semibold text-charcoal-800 mb-1"
                    >
                      City / Town / Neighborhood *
                    </label>
                    <input
                      id="listing-city"
                      type="text"
                      list="listing-region-towns"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={
                        REGION_TOWNS[region]?.length
                          ? `e.g., ${REGION_TOWNS[region].slice(0, 3).join(', ')}`
                          : 'e.g., Nalerigu, Walewale, East Legon'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                    />
                    {REGION_TOWNS[region]?.length ? (
                      <>
                        <datalist id="listing-region-towns">
                          {REGION_TOWNS[region].map((town) => (
                            <option key={town} value={town} />
                          ))}
                        </datalist>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-charcoal-500 font-medium">
                            Towns:
                          </span>
                          {REGION_TOWNS[region].slice(0, 5).map((town) => (
                            <button
                              key={town}
                              type="button"
                              onClick={() => setCity(town)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                                city === town
                                  ? 'bg-clay-600 text-white'
                                  : 'bg-ivory-200 hover:bg-ivory-300 text-charcoal-700'
                              }`}
                            >
                              {town}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="listing-owner-name"
                      className="block text-xs font-semibold text-charcoal-800 mb-1"
                    >
                      Your Public Name *
                    </label>
                    <input
                      id="listing-owner-name"
                      type="text"
                      required
                      value={ownerDisplayName}
                      onChange={(e) => setOwnerDisplayName(e.target.value)}
                      placeholder="e.g., Kwame Mensah"
                      className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="listing-phone"
                      className="block text-xs font-semibold text-charcoal-800 mb-1"
                    >
                      Contact Phone {section !== 'opportunities' ? '*' : '(Optional)'}
                    </label>
                    <input
                      id="listing-phone"
                      type="tel"
                      required={section !== 'opportunities'}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g., 024 123 4567"
                      className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="listing-title"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Listing Title (5–160 characters, no prices) *
                  </label>
                  <input
                    id="listing-title"
                    type="text"
                    required
                    minLength={5}
                    maxLength={160}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      section === 'accommodation'
                        ? 'e.g., Spacious 2-Bedroom Apartment Available in Adenta'
                        : section === 'exchange'
                        ? 'e.g., University Engineering Textbooks & Scientific Calculator'
                        : section === 'help'
                        ? 'e.g., Free Weekend WASSCE Core Maths & Science Peer Tutoring'
                        : 'e.g., Graduate Software Engineering Apprenticeship Cohort'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm text-charcoal-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="listing-description"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Details &amp; Location Landmarks *
                  </label>
                  <textarea
                    id="listing-description"
                    rows={4}
                    required
                    minLength={20}
                    maxLength={5000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write clear details, nearby town landmarks (e.g., near Walewale Lorry Station or Kpasenkpe JHS), and how people should reach you..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900 leading-relaxed"
                  />
                </div>

                {/* Validated Photo Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-charcoal-800">
                      Photos (Optional, up to 4 verified JPG/PNG/WebP images under 5MB)
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      {images.length} / 4 uploaded
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-xl border border-ivory-300 overflow-hidden bg-white group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-charcoal-900/80 text-white hover:bg-clay-600"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {images.length < 4 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-ivory-300 hover:border-clay-500 bg-white flex flex-col items-center justify-center cursor-pointer text-charcoal-500 hover:text-clay-600 transition-colors">
                        {uploadingPhoto ? (
                          <Loader2 className="w-5 h-5 animate-spin text-clay-600" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span className="text-[10px] font-semibold mt-1">Add Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Mandatory Community Guidelines Acceptance */}
                <div className="p-3.5 rounded-xl bg-ivory-100 border border-ivory-300">
                  <label className="flex items-start gap-2.5 text-xs text-charcoal-800 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedGuidelines}
                      onChange={(e) => setAcceptedGuidelines(e.target.checked)}
                      className="mt-0.5 rounded border-ivory-300 text-clay-600 focus:ring-clay-500"
                    />
                    <span>
                      <strong>I accept the Oppora Community Guidelines:</strong> I confirm this
                      listing is genuine, contains no prohibited prices or advance fee requests,
                      and I understand that Oppora moderators will remove any deceptive or
                      commercial-fee posts. *
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2.5 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700 hover:bg-ivory-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay-600 hover:bg-clay-700 disabled:opacity-50 text-white text-xs font-bold shadow-warm-sm"
                  >
                    {createSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Publish Listing</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. REPORT LISTING MODAL */}
      {reportTarget && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/65 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-md w-full p-6 shadow-warm-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5" /> Trust &amp; Safety Moderation
                </span>
                <h2
                  id="report-modal-title"
                  className="text-lg font-display font-bold text-charcoal-900 mt-1"
                >
                  Report Listing to Administrators
                </h2>
              </div>
              <button
                type="button"
                onClick={closeReportModal}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-ivory-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-200 text-xs text-charcoal-700">
              Reporting: <strong className="text-charcoal-900">{reportTarget.title}</strong>
            </div>

            {reportSuccess ? (
              <div className="p-6 rounded-xl bg-forest-50 border border-forest-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto" />
                <p className="text-sm font-bold text-forest-900">
                  Safety Report Received
                </p>
                <p className="text-xs text-forest-800">
                  Thank you for helping keep Oppora safe. Our moderation team will review this
                  listing promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3.5">
                {reportError && (
                  <div className="p-3 rounded-xl bg-clay-50 border border-clay-200 text-xs text-clay-800 font-semibold">
                    {reportError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="report-reason"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Reason for Report *
                  </label>
                  <select
                    id="report-reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-medium text-charcoal-900"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-details"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    What happened? *
                  </label>
                  <textarea
                    id="report-details"
                    rows={3}
                    required
                    minLength={5}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide specific details so administrators can investigate..."
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="report-contact"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Your Phone or Email (Optional, kept strictly confidential)
                  </label>
                  <input
                    id="report-contact"
                    type="text"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    placeholder="Optional contact for moderator follow-up"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-charcoal-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={alsoBlockOnReport}
                    onChange={(e) => setAlsoBlockOnReport(e.target.checked)}
                    className="rounded border-ivory-300 text-clay-600"
                  />
                  <span>Also hide/block this listing from my feed immediately</span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeReportModal}
                    className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 rounded-xl bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Safety Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTACT ADMINISTRATORS MODAL */}
      {contactAdminOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/65 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-admin-modal-title"
        >
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl max-w-md w-full p-6 shadow-warm-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-600 flex items-center gap-1">
                  <MessageSquareWarning className="w-3.5 h-3.5" /> Community Support Desk
                </span>
                <h2
                  id="contact-admin-modal-title"
                  className="text-lg font-display font-bold text-charcoal-900 mt-1"
                >
                  Contact Oppora Administrators
                </h2>
              </div>
              <button
                type="button"
                onClick={closeContactAdminModal}
                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-ivory-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminSuccess ? (
              <div className="p-6 rounded-xl bg-forest-50 border border-forest-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto" />
                <p className="text-sm font-bold text-forest-900">
                  Message Sent to Administrators
                </p>
                <p className="text-xs text-forest-800">
                  Our community team has received your message and will review it in the
                  Moderation Console.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactAdminSubmit} className="space-y-3.5">
                {adminError && (
                  <div className="p-3 rounded-xl bg-clay-50 border border-clay-200 text-xs text-clay-800 font-semibold">
                    {adminError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="admin-sender-name"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Your Name *
                  </label>
                  <input
                    id="admin-sender-name"
                    type="text"
                    required
                    value={adminSenderName}
                    onChange={(e) => setAdminSenderName(e.target.value)}
                    placeholder={user?.displayName || 'Your full name'}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-sender-contact"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Phone Number or Email *
                  </label>
                  <input
                    id="admin-sender-contact"
                    type="text"
                    required
                    value={adminSenderContact}
                    onChange={(e) => setAdminSenderContact(e.target.value)}
                    placeholder="e.g., +233 24 123 4567 or email@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-subject"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Subject *
                  </label>
                  <input
                    id="admin-subject"
                    type="text"
                    required
                    value={adminSubject}
                    onChange={(e) => setAdminSubject(e.target.value)}
                    placeholder="e.g., Partnership inquiry, Category request, or Safety concern"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-message"
                    className="block text-xs font-semibold text-charcoal-800 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="admin-message"
                    rows={4}
                    required
                    minLength={10}
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="How can the Oppora moderation team help you?"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeContactAdminModal}
                    className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminSubmitting}
                    className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs font-semibold"
                  >
                    {adminSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
