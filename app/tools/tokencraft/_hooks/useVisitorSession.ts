"use client";

import { useEffect } from "react";
import { SESSION_COUNT_KEY, shouldPromptSignIn } from "../_lib/authGate";
import { useAuthPromptStore } from "../_store/useAuthPromptStore";
import { useAuth } from "./useAuth";

const PROMPT_ONCE_KEY = "tc_return_prompt_shown";

/**
 * Counts visits in localStorage and, from the second visit onward, offers
 * sign-in once per browser session. The offer is dismissible and never gates
 * any feature — see shouldPromptSignIn.
 */
export function useVisitorSession() {
  const open = useAuthPromptStore((s) => s.open);
  const { isAuthenticated, isConfigured, isReady } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // When auth is configured, wait for the session to resolve so a
    // returning signed-in user is never prompted. When it is not configured
    // isReady is already true and this runs immediately.
    if (!isReady) return;

    let count: number;
    try {
      const stored = window.localStorage.getItem(SESSION_COUNT_KEY);
      const parsed = Number.parseInt(stored ?? "", 10);
      count = !Number.isFinite(parsed) || parsed < 1 ? 1 : parsed + 1;
      window.localStorage.setItem(SESSION_COUNT_KEY, String(count));
    } catch {
      // Storage disabled (private mode / blocked cookies): stay uninhibited.
      return;
    }

    if (
      !shouldPromptSignIn({
        isAuthenticated,
        trigger: "return-visit",
        sessionCount: count,
      })
    ) {
      return;
    }

    // Don't nag on every re-render within the same session.
    try {
      if (window.sessionStorage.getItem(PROMPT_ONCE_KEY)) return;
      window.sessionStorage.setItem(PROMPT_ONCE_KEY, "1");
    } catch {
      return;
    }

    open("return-visit");
  }, [isAuthenticated, isReady, open]);

  return { isConfigured, isAuthenticated };
}
