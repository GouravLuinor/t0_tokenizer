import { describe, it, expect } from "vitest";
import {
  callCost,
  cacheSavingPercent,
  contextFit,
  crossesPriceTier,
  formatMoney,
  formatRate,
  formatCompact,
  isExactCount,
  rampPosition,
  rankByCost,
} from "../costs";
import type { ModelPricing } from "../modelTypes";

const base: ModelPricing = {
  id: "x/a",
  name: "Alpha",
  provider: "X",
  family: "Claude BPE",
  encoding: "o200k_base",
  contextWindow: 1000,
  inputCostPer1M: 2,
  cachedInputCostPer1M: 0.2,
  outputCostPer1M: 10,
  badgeText: "1k",
};

describe("callCost", () => {
  it("prices input, cached input and output per 1M", () => {
    const c = callCost(base, 1_000_000, 500_000);
    expect(c.input).toBeCloseTo(2);
    expect(c.cachedInput).toBeCloseTo(0.2);
    expect(c.output).toBeCloseTo(5);
    expect(c.total).toBeCloseTo(7);
    expect(c.totalCached).toBeCloseTo(5.2);
  });

  it("ignores the cached rate when the model has no cache tier", () => {
    const c = callCost({ ...base, noCache: true, cachedInputCostPer1M: 0 }, 1_000_000, 0);
    expect(c.cachedInput).toBeCloseTo(2);
  });
});

describe("cacheSavingPercent", () => {
  it("returns the rounded saving", () => expect(cacheSavingPercent(base)).toBe(90));
  it("is null without a cache tier", () =>
    expect(cacheSavingPercent({ ...base, noCache: true })).toBeNull());
  it("is null when cached equals standard", () =>
    expect(cacheSavingPercent({ ...base, cachedInputCostPer1M: 2 })).toBeNull());
});

describe("contextFit", () => {
  it("reports fits / tight / over", () => {
    expect(contextFit(base, 100, 100).status).toBe("fits");
    expect(contextFit(base, 700, 200).status).toBe("tight");
    expect(contextFit(base, 900, 200).status).toBe("over");
  });
  it("never lets shares exceed the bar", () => {
    const f = contextFit(base, 900, 500);
    expect(f.inputShare + f.outputShare).toBeLessThanOrEqual(1);
    expect(f.remaining).toBe(0);
  });
});

describe("helpers", () => {
  it("flags only the encodings we run as exact", () => {
    expect(isExactCount(base)).toBe(false);
    expect(isExactCount({ ...base, family: "o200k_base" })).toBe(true);
  });
  it("detects tier crossings", () => {
    expect(crossesPriceTier({ ...base, tieredAboveTokens: 200 }, 201)).toBe(true);
    expect(crossesPriceTier(base, 10_000)).toBe(false);
  });
  it("keeps the ramp monotonic and bounded", () => {
    expect(rampPosition(0)).toBe(0);
    expect(rampPosition(0.01)).toBeLessThan(rampPosition(1));
    expect(rampPosition(1e6)).toBe(1);
  });
  it("ranks by total cost and drops models that cannot hold the call", () => {
    const reg = {
      a: base,
      b: { ...base, name: "Beta", inputCostPer1M: 0.1, outputCostPer1M: 0.1 },
      c: { ...base, name: "Gamma", contextWindow: 10, inputCostPer1M: 0.01 },
    };
    expect(rankByCost(reg, 100, 50).map((r) => r.key)).toEqual(["b", "a"]);
  });
  it("leaves unpriced catalog entries out of the ranking", () => {
    const reg = { a: base, free: { ...base, name: "Free", inputCostPer1M: 0, outputCostPer1M: 0 } };
    expect(rankByCost(reg, 100, 50).map((r) => r.key)).toEqual(["a"]);
  });
});

describe("formatting", () => {
  it("never prints a non-zero amount as zero", () => {
    expect(formatMoney(0.000232)).toBe("$0.00023");
    expect(formatMoney(0.0011)).toBe("$0.0011");
    expect(formatMoney(1.394)).toBe("$1.39");
    expect(formatMoney(2320.4)).toBe("$2,320");
    expect(formatMoney(0)).toBe("$0");
    expect(formatMoney(1e-9)).toBe("<$0.000001");
  });
  it("formats rates and compact counts", () => {
    expect(formatRate(2)).toBe("2.00");
    expect(formatRate(0.75)).toBe("0.75");
    expect(formatRate(0.0099)).toBe("0.0099");
    expect(formatRate(30)).toBe("30.00");
    expect(formatCompact(1_000_000)).toBe("1M");
    expect(formatCompact(1_050_000)).toBe("1.05M");
    expect(formatCompact(10_000)).toBe("10k");
  });
});
