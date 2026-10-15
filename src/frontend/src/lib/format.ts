import type { Timestamp } from "@/backend";

/**
 * Motoko `Time.now()` values are nanosecond bigints. Convert through this
 * helper before any JavaScript `Date` operation.
 */
export function timestampToDate(
  timestamp: Timestamp | null | undefined,
): Date | null {
  if (timestamp === null || timestamp === undefined) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(timestamp: Timestamp | null | undefined): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(
  timestamp: Timestamp | null | undefined,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(timestamp);
}

/** Compact funding figure for cards, e.g. `$1.2M`, `$450K`. */
export function formatFunding(amount: bigint | null | undefined): string {
  if (amount === null || amount === undefined) return "Open";
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000_000) return `$${trim(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `$${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `$${trim(value / 1_000)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

/** Full funding figure for detail pages, e.g. `$1,250,000`. */
export function formatFundingFull(amount: bigint | null | undefined): string {
  if (amount === null || amount === undefined) return "Open to offers";
  return `$${Number(amount).toLocaleString("en-US")}`;
}

export function formatCount(value: bigint | number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("en-US");
}

function trim(value: number): string {
  return value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, "");
}
