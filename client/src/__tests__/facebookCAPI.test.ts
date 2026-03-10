/**
 * Tests for Facebook Conversions API helper (facebookCAPI.ts)
 * Validates pixel ID format and hashing logic without making real API calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ─── Helpers (duplicated from facebookCAPI.ts for unit testing) ───────────────

function hashValue(value: string | undefined | null): string {
  if (!value) return "";
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("967") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+967${digits.slice(1)}`;
  if (digits.length === 9) return `+967${digits}`;
  return `+${digits}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Meta Pixel ID validation", () => {
  const PIXEL_ID = "31769433639338165";

  it("should be a non-empty numeric string", () => {
    expect(PIXEL_ID).toBeTruthy();
    expect(/^\d+$/.test(PIXEL_ID)).toBe(true);
  });

  it("should have a valid length (10-20 digits)", () => {
    expect(PIXEL_ID.length).toBeGreaterThanOrEqual(10);
    expect(PIXEL_ID.length).toBeLessThanOrEqual(20);
  });
});

describe("hashValue", () => {
  it("should return a 64-char hex string for non-empty input", () => {
    const result = hashValue("test@example.com");
    expect(result).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("should normalise to lowercase before hashing", () => {
    expect(hashValue("Test@Example.COM")).toBe(hashValue("test@example.com"));
  });

  it("should trim whitespace before hashing", () => {
    expect(hashValue("  hello  ")).toBe(hashValue("hello"));
  });

  it("should return empty string for falsy values", () => {
    expect(hashValue(null)).toBe("");
    expect(hashValue(undefined)).toBe("");
    expect(hashValue("")).toBe("");
  });
});

describe("normalizePhone", () => {
  it("should handle 9-digit Yemeni numbers (7XXXXXXXX)", () => {
    expect(normalizePhone("734000018")).toBe("+967734000018");
  });

  it("should handle numbers starting with 07", () => {
    expect(normalizePhone("0734000018")).toBe("+967734000018");
  });

  it("should handle numbers with +967 prefix", () => {
    expect(normalizePhone("+967734000018")).toBe("+967734000018");
  });

  it("should handle numbers with 967 prefix (no +)", () => {
    expect(normalizePhone("967734000018")).toBe("+967734000018");
  });
});
