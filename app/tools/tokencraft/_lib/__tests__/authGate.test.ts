import { describe, it, expect } from "vitest";
import {
  nextSessionCount,
  readSessionCount,
  shouldPromptSignIn,
  SESSION_COUNT_KEY,
} from "../authGate";

describe("nextSessionCount", () => {
  it("treats a first visit as session 1", () => {
    expect(nextSessionCount(null)).toBe(1);
    expect(nextSessionCount(undefined)).toBe(1);
  });

  it("increments on every later visit", () => {
    expect(nextSessionCount("1")).toBe(2);
    expect(nextSessionCount("2")).toBe(3);
    expect(nextSessionCount("41")).toBe(42);
  });

  it("resets corrupt or non-positive values to 1", () => {
    expect(nextSessionCount("")).toBe(1);
    expect(nextSessionCount("abc")).toBe(1);
    expect(nextSessionCount("NaN")).toBe(1);
    expect(nextSessionCount("0")).toBe(1);
    expect(nextSessionCount("-7")).toBe(1);
  });

  it("never returns NaN", () => {
    ["", "0", "-1", "junk", "1e999", null].forEach((raw) => {
      expect(Number.isFinite(nextSessionCount(raw))).toBe(true);
    });
  });

  it("parses a leading-numeric value without trailing garbage", () => {
    expect(nextSessionCount("3abc")).toBe(4);
  });
});

describe("readSessionCount", () => {
  it("reads the documented storage key", () => {
    const store = { getItem: () => "5" };
    expect(readSessionCount(store)).toBe(6);
    expect(SESSION_COUNT_KEY).toBe("tc_session_count");
  });

  it("falls back to 1 when storage is unavailable (SSR, private mode)", () => {
    expect(readSessionCount(null)).toBe(1);
    expect(readSessionCount(undefined)).toBe(1);
  });
});

describe("shouldPromptSignIn", () => {
  const base = { isAuthenticated: false, sessionCount: 1 };

  it("leaves a first session completely alone", () => {
    expect(shouldPromptSignIn({ ...base, trigger: "return-visit" })).toBe(
      false
    );
  });

  it("prompts on return visits from session 2 onward", () => {
    expect(
      shouldPromptSignIn({ ...base, sessionCount: 2, trigger: "return-visit" })
    ).toBe(true);
    expect(
      shouldPromptSignIn({ ...base, sessionCount: 9, trigger: "return-visit" })
    ).toBe(true);
  });

  it("always offers on an explicit export click, even on the first session", () => {
    expect(shouldPromptSignIn({ ...base, trigger: "export" })).toBe(true);
  });

  it("always offers on a manual header click", () => {
    expect(shouldPromptSignIn({ ...base, trigger: "manual" })).toBe(true);
    expect(
      shouldPromptSignIn({ ...base, sessionCount: 99, trigger: "manual" })
    ).toBe(true);
  });

  it("never prompts an authenticated user for any trigger", () => {
    (["export", "return-visit", "manual"] as const).forEach((trigger) => {
      expect(
        shouldPromptSignIn({ isAuthenticated: true, trigger, sessionCount: 1 })
      ).toBe(false);
      expect(
        shouldPromptSignIn({ isAuthenticated: true, trigger, sessionCount: 50 })
      ).toBe(false);
    });
  });
});
