import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const PIN_LENGTH = 6;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const UNLOCK_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 heures

export const DEVICE_ID_COOKIE = "hs_device_id";
export const UNLOCK_COOKIE = "hs_unlocked";

export function isValidPinFormat(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

// scrypt (Node natif) : pas de dépendance de hachage supplémentaire pour un
// petit projet. Le sel est stocké à côté du hash, séparé par ":".
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPinHash(pin: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const expected = Buffer.from(derivedHex, "hex");
  const actual = scryptSync(pin, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isLockedOut(
  lockedUntil: string | null,
  now: Date = new Date(),
): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > now.getTime();
}

export function computeLockoutUntil(now: Date = new Date()): string {
  return new Date(now.getTime() + LOCKOUT_DURATION_MS).toISOString();
}

export function remainingLockoutSeconds(
  lockedUntil: string,
  now: Date = new Date(),
): number {
  return Math.max(
    0,
    Math.ceil((new Date(lockedUntil).getTime() - now.getTime()) / 1000),
  );
}
