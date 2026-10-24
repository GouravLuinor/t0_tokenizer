"use client";

import React from "react";
import { createPortal } from "react-dom";
import { LogOut, User } from "lucide-react";
import { useAuthPromptStore } from "../../_store/useAuthPromptStore";
import { isSupabaseConfigured } from "../../_lib/supabaseClient";
import { useAuth } from "../../_hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TOAST_MS = 4000;

function DemoToast({ onDismiss }: { onDismiss: () => void }) {
  // Portalled to <body>: the sticky header's backdrop-blur establishes a
  // containing block, which would otherwise trap this fixed element inside
  // the header and clip it off-screen.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[90] w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg border border-rule bg-sheet px-4 py-3 shadow-elevated"
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
        className="mt-2.5 text-xs font-medium text-board underline dark:text-gold"
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
  const { isAuthenticated, session, signOut } = useAuth();
  const [showDemoToast, setShowDemoToast] = React.useState(false);

  React.useEffect(() => {
    if (!showDemoToast) return;
    const timer = window.setTimeout(() => setShowDemoToast(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [showDemoToast]);

  if (isSupabaseConfigured) {
    if (isAuthenticated && session?.user) {
      return <UserMenu session={session} onSignOut={signOut} />;
    }
    return <SignInButtonLabel onClick={() => open("manual")} />;
  }

  return (
    <>
      <SignInButtonLabel onClick={() => setShowDemoToast(true)} />
      {showDemoToast && <DemoToast onDismiss={() => setShowDemoToast(false)} />}
    </>
  );
}

function UserMenu({
  session,
  onSignOut,
}: {
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
  onSignOut: () => Promise<void>;
}) {
  const email =
    session.user.email ??
    (session.user.user_metadata?.email as string | undefined) ??
    "";
  const initial = email.length > 0 ? email[0].toUpperCase() : null;
  const rawProvider =
    session.user.app_metadata?.provider ??
    session.user.identities?.[0]?.provider;
  const providerLabel = React.useMemo(() => {
    if (typeof rawProvider !== "string" || !rawProvider) return null;
    const lower = rawProvider.toLowerCase();
    if (lower === "github") return "GitHub";
    if (lower === "google") return "Google";
    return rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1);
  }, [rawProvider]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-board-2 font-mono text-xs font-bold text-gold transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {initial ? (
            initial
          ) : (
            <User className="h-4 w-4 text-gold" aria-hidden="true" />
          )}
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-board bg-ok"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Signed in as
            </span>
            <span className="truncate font-mono text-xs text-zinc-200">
              {email || "User"}
            </span>
            {providerLabel && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full border border-rule bg-panel px-2 py-0.5 font-mono text-[11px] text-ink-2">
                {providerLabel}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void onSignOut()}
          className="cursor-pointer text-danger focus:bg-danger-wash"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignInButtonLabel({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] text-board-ink-2 transition-colors hover:bg-board-2 hover:text-board-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      Sign in
    </button>
  );
}
