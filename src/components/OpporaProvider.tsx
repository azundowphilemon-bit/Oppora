'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Listing, PublicUserSession, SectionType } from '@/lib/types';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

interface OpporaContextValue {
  user: PublicUserSession | null;
  signInMember: (params: {
    displayName: string;
    defaultRegion: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  signOutMember: () => Promise<void>;
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  blockedListingIds: string[];
  blockListing: (id: string) => void;
  unblockListing: (id: string) => void;
  clearBlockedListings: () => void;
  reportTarget: Listing | null;
  openReportModal: (listing: Listing) => void;
  closeReportModal: () => void;
  contactAdminOpen: boolean;
  openContactAdminModal: () => void;
  closeContactAdminModal: () => void;
  createModalSection: SectionType | null;
  openCreateModal: (section?: SectionType) => void;
  closeCreateModal: () => void;
  refreshSignal: number;
  triggerRefresh: () => void;
}

const OpporaContext = createContext<OpporaContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'oppora_user_session_v1',
  SAVED: 'oppora_saved_listings_v1',
  BLOCKED: 'oppora_blocked_listings_v1',
};

export function OpporaProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUserSession | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [blockedListingIds, setBlockedListingIds] = useState<string[]>([]);
  const [reportTarget, setReportTarget] = useState<Listing | null>(null);
  const [contactAdminOpen, setContactAdminOpen] = useState(false);
  const [createModalSection, setCreateModalSection] = useState<SectionType | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (rawUser) {
        setUser(JSON.parse(rawUser) as PublicUserSession);
      } else {
        // Provide a default welcoming member profile so users can immediately test posting & dashboard,
        // or switch/sign out in the Account modal
        const defaultSession: PublicUserSession = {
          id: 'member-kwame-mensah',
          displayName: 'Kwame Mensah',
          defaultRegion: 'Greater Accra, Ghana',
          role: 'member',
          acceptedGuidelinesAt: new Date().toISOString(),
          authProvider: isSupabaseConfigured ? 'supabase' : 'local_session',
        };
        setUser(defaultSession);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultSession));
      }

      const rawSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (rawSaved) {
        setSavedIds(JSON.parse(rawSaved) as string[]);
      }

      const rawBlocked = localStorage.getItem(STORAGE_KEYS.BLOCKED);
      if (rawBlocked) {
        setBlockedListingIds(JSON.parse(rawBlocked) as string[]);
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, []);

  const signInMember = useCallback(
    async (params: {
      displayName: string;
      defaultRegion: string;
      email?: string;
      password?: string;
      isAdmin?: boolean;
    }): Promise<{ ok: boolean; error?: string }> => {
      const cleanName = params.displayName.trim();
      if (cleanName.length < 2) {
        return { ok: false, error: 'Please enter a display name (at least 2 characters).' };
      }

      if (isSupabaseConfigured && params.email && params.password) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: params.email,
            password: params.password,
          });
          if (error) {
            return { ok: false, error: error.message };
          }
          if (data.user) {
            const sessionUser: PublicUserSession = {
              id: data.user.id,
              displayName: cleanName,
              defaultRegion: params.defaultRegion || 'Greater Accra, Ghana',
              role: params.isAdmin ? 'admin' : 'member',
              acceptedGuidelinesAt: new Date().toISOString(),
              authProvider: 'supabase',
            };
            setUser(sessionUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
            return { ok: true };
          }
        }
      }

      const slugId = `member-${cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`;

      const sessionUser: PublicUserSession = {
        id: slugId || 'member-oppora',
        displayName: cleanName,
        defaultRegion: params.defaultRegion || 'Greater Accra, Ghana',
        role: params.isAdmin ? 'admin' : 'member',
        acceptedGuidelinesAt: new Date().toISOString(),
        authProvider: 'local_session',
      };

      setUser(sessionUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
      } catch {
        // Ignore
      }
      return { ok: true };
    },
    []
  );

  const signOutMember = useCallback(async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // Ignore
    }
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const blockListing = useCallback((id: string) => {
    setBlockedListingIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const unblockListing = useCallback((id: string) => {
    setBlockedListingIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const clearBlockedListings = useCallback(() => {
    setBlockedListingIds([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.BLOCKED);
    } catch {
      // Ignore
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  return (
    <OpporaContext.Provider
      value={{
        user,
        signInMember,
        signOutMember,
        savedIds,
        toggleSaved,
        isSaved,
        blockedListingIds,
        blockListing,
        unblockListing,
        clearBlockedListings,
        reportTarget,
        openReportModal: (listing) => setReportTarget(listing),
        closeReportModal: () => setReportTarget(null),
        contactAdminOpen,
        openContactAdminModal: () => setContactAdminOpen(true),
        closeContactAdminModal: () => setContactAdminOpen(false),
        createModalSection,
        openCreateModal: (section = 'opportunities') => setCreateModalSection(section),
        closeCreateModal: () => setCreateModalSection(null),
        refreshSignal,
        triggerRefresh,
      }}
    >
      {children}
    </OpporaContext.Provider>
  );
}

export function useOppora() {
  const ctx = useContext(OpporaContext);
  if (!ctx) {
    throw new Error('useOppora must be used inside OpporaProvider');
  }
  return ctx;
}
