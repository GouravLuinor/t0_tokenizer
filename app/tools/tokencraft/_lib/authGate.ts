export const SESSION_COUNT_KEY = "tc_session_count";

export type AuthTrigger = "export" | "return-visit" | "manual";

/**
 * Resolves the stored visit counter. A first visit has no stored value and
 * resolves to 1; every later visit increments. Corrupt or non-positive values
 * reset to 1 rather than propagating NaN into the gate.
 */
export function nextSessionCount(raw: string | null | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed + 1;
}

export function readSessionCount(
  storage: Pick<Storage, "getItem"> | null | undefined
): number {
  if (!storage) return 1;
  return nextSessionCount(storage.getItem(SESSION_COUNT_KEY));
}

/**
 * Decides whether to *offer* sign-in. This never blocks the action that
 * triggered it — an export proceeds whether or not the prompt was shown or
 * dismissed, per the "never hard-lock the user out" rule.
 */
export function shouldPromptSignIn({
  isAuthenticated,
  trigger,
  sessionCount,
}: {
  isAuthenticated: boolean;
  trigger: AuthTrigger;
  sessionCount: number;
}): boolean {
  if (isAuthenticated) return false;
  if (trigger === "manual") return true;
  if (trigger === "export") return true;
  return sessionCount >= 2;
}
