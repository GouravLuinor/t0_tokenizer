"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useAuthPromptStore } from "../../_store/useAuthPromptStore";
import { useAuth, type OAuthProvider } from "../../_hooks/useAuth";

const PROVIDERS: Array<{
  id: OAuthProvider;
  label: string;
  className: string;
}> = [
  {
    id: "google",
    label: "Continue with Google",
    className: "border-rule bg-sheet text-ink hover:bg-panel",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    className: "border-transparent bg-board text-board-ink hover:bg-board-2",
  },
];

export function SignInModal() {
  const isOpen = useAuthPromptStore((s) => s.isOpen);
  const trigger = useAuthPromptStore((s) => s.trigger);
  const close = useAuthPromptStore((s) => s.close);
  const { isConfigured, signInWith, signOut, isAuthenticated, session } =
    useAuth();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { title, description } = React.useMemo(() => {
    if (isAuthenticated) {
      return {
        title: "You're signed in",
        description: `Signed in as ${session?.user?.email ?? "your account"}.`,
      };
    }
    if (trigger === "export") {
      return {
        title: "Sign in to export this report",
        description:
          "CSV, JSON and Markdown exports need a free Nor AI account. Counting, pricing and the minifier stay free with no account.",
      };
    }
    return {
      title: "Sign in to TokenCraft",
      description:
        "Use Google or GitHub. An account is only needed for exports; everything else works without one.",
    };
  }, [isAuthenticated, session?.user?.email, trigger]);

  const handleProvider = async (provider: OAuthProvider) => {
    setPending(true);
    setError(null);
    const ok = await signInWith(provider);
    if (!ok) {
      setError("Sign-in could not be started. Please try again.");
      setPending(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          setPending(false);
          close();
        }
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0" exitAnimation={false}>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed text-ink-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          {!isConfigured && (
            <p className="mt-5 rounded-md border border-gold/40 bg-gold-wash px-3.5 py-3 text-xs leading-relaxed text-gold-ink">
              Sign-in is not enabled on this deployment. Everything in
              TokenCraft works without it.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 text-xs text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="h-10 justify-center text-sm"
              >
                Sign out
              </Button>
            ) : (
              PROVIDERS.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  onClick={() => void handleProvider(provider.id)}
                  disabled={!isConfigured || pending}
                  className={`h-10 justify-center gap-2 text-sm ${provider.className}`}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  {provider.label}
                </Button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-md py-2 text-sm text-ink-3 transition-colors hover:text-ink"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
