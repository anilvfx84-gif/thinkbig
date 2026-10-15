import {
  formatCount,
  formatFunding,
  formatFundingFull,
  timestampToDate,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("funding formatting", () => {
  it("compacts large figures for cards", () => {
    expect(formatFunding(1_200_000n)).toBe("$1.2M");
    expect(formatFunding(450_000n)).toBe("$450K");
    expect(formatFunding(2_000_000_000n)).toBe("$2B");
    expect(formatFunding(500n)).toBe("$500");
  });

  it("shows Open when no funding target is set", () => {
    expect(formatFunding(undefined)).toBe("Open");
    expect(formatFunding(null)).toBe("Open");
  });

  it("renders a full figure for the detail page", () => {
    expect(formatFundingFull(1_250_000n)).toBe("$1,250,000");
    expect(formatFundingFull(undefined)).toBe("Open to offers");
  });
});

describe("count and timestamp formatting", () => {
  it("formats counts with thousands separators", () => {
    expect(formatCount(1_234n)).toBe("1,234");
    expect(formatCount(0n)).toBe("0");
    expect(formatCount(undefined)).toBe("0");
  });

  it("converts nanosecond timestamps to dates", () => {
    // 2024-01-01T00:00:00Z in nanoseconds.
    const ns = 1_704_067_200_000_000_000n;
    const date = timestampToDate(ns);
    expect(date?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(timestampToDate(null)).toBeNull();
  });
});
