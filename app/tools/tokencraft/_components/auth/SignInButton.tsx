"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useAuthPromptStore } from "../../_store/useAuthPromptStore";
import { isSupabaseConfigured } from "../../_lib/supabaseClient";

const TOAST_MS = 4000;

function DemoToast({ onDismiss }: { onDismiss: () => void }) {
  // Portalled to <body>: the sticky header's backdrop-blur establishes a
  // containing block, which would otherwise trap this fixed element inside
  // the header and clip it off-screen.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[90] w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 shadow-elevated"
    >
      <p className="text-sm font-medium text-zinc-100">
        Sign-in is not enabled yet
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        TokenCraft runs fully client-side and needs no account. Connecting a
        Supabase project enables saved presets and report history.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2.5 text-xs font-medium text-sky-400 transition-colors hover:text-sky-300"
      >
        Dismiss
      </button>
    </div>,
    document.body
  );
}

/**
 * Header sign-in control. Without a configured Supabase project the button
 * resolves to a clean, self-dismissing demo toast instead of opening a modal
 * whose sign-in cannot complete.
 */
export function SignInButton() {
  const open = useAuthPromptStore((s) => s.open);
  const [showDemoToast, setShowDemoToast] = React.useState(false);

  React.useEffect(() => {
    if (!showDemoToast) return;
    const timer = window.setTimeout(() => setShowDemoToast(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [showDemoToast]);

  if (isSupabaseConfigured) {
    return <SignInButtonLabel onClick={() => open("manual")} />;
  }

  return (
    <>
      <SignInButtonLabel onClick={() => setShowDemoToast(true)} />
      {showDemoToast && <DemoToast onDismiss={() => setShowDemoToast(false)} />}
    </>
  );
}

function SignInButtonLabel({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-surface-border bg-surface-default px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-surface-borderHover hover:bg-surface-elevated hover:text-zinc-50"
    >
      Sign in
    </button>
  );
}
