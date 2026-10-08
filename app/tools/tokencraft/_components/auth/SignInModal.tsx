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
    className: "border-white/15 bg-surface-elevated text-zinc-100 hover:bg-white/10",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    className: "border-surface-border bg-surface-default text-zinc-200 hover:bg-surface-elevated",
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
        title: "Sign in to Export Reports",
        description:
          "Exporting CSV, JSON, and Markdown cost reports requires a free Nor AI account. Token counting and analysis stay free forever.",
      };
    }
    if (trigger === "return-visit") {
      return {
        title: "Welcome back to TokenCraft",
        description:
          "Sign in to unlock report exports, sync custom presets, and keep your model pricing history.",
      };
    }
    return {
      title: "Sign in to TokenCraft",
      description:
        "Connect with Google or GitHub to save custom presets, export reports, and access account preferences.",
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
            <DialogDescription className="mt-2 font-sans normal-case leading-relaxed text-zinc-400">
              {description}
            </DialogDescription>
          </DialogHeader>

          {!isConfigured && (
            <p className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-3 text-xs leading-relaxed text-amber-300/90">
              Sign-in is not enabled on this deployment. Everything in
              TokenCraft works without it.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 text-xs text-rose-300">
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
            className="mt-4 w-full rounded-lg py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
