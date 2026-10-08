"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from "../_lib/supabaseClient";

export type OAuthProvider = "google" | "github";

/**
 * After an OAuth redirect, Supabase exchanges the `code`/`access_token` and
 * leaves them in the address bar. Strip them so the URL stays pristine.
 */
function stripOAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const search = window.location.search;
  const hash = window.location.hash;
  if (search.includes("code=") || hash.includes("access_token")) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

export interface AuthState {
  isConfigured: boolean;
  isReady: boolean;
  session: Session | null;
  isAuthenticated: boolean;
  /** Resolves false when auth is unavailable or the provider call fails. */
  signInWith: (provider: OAuthProvider) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    void (async () => {
      const client = await getSupabaseClient();
      if (cancelled || !client) return;

      const { data } = await client.auth.getSession();
      if (cancelled) return;
      setSession(data.session ?? null);
      setIsReady(true);
      stripOAuthParamsFromUrl();

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event, nextSession) => {
        // Keep this handler synchronous — awaiting other Supabase calls here
        // deadlocks the auth client's internal lock.
        setSession(nextSession);
        if (event === "SIGNED_IN") stripOAuthParamsFromUrl();
      });

      if (cancelled) subscription.unsubscribe();
      else unsubscribe = () => subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signInWith = useCallback(async (provider: OAuthProvider) => {
    const client = await getSupabaseClient();
    if (!client) return false;

    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/tools/tokencraft" },
    });
    return !error;
  }, []);

  const signOut = useCallback(async () => {
    const client = await getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
  }, []);

  return {
    isConfigured: isSupabaseConfigured,
    isReady,
    session,
    isAuthenticated: Boolean(session),
    signInWith,
    signOut,
  };
}
