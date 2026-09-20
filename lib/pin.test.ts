import { describe, expect, it } from "vitest";
import {
  computeLockoutUntil,
  hashPin,
  isLockedOut,
  isValidPinFormat,
  remainingLockoutSeconds,
  verifyPinHash,
} from "./pin";

describe("isValidPinFormat", () => {
  it("accepte un code à 6 chiffres", () => {
    expect(isValidPinFormat("123456")).toBe(true);
    expect(isValidPinFormat("000000")).toBe(true);
  });

  it("refuse tout ce qui n'est pas exactement 6 chiffres", () => {
    expect(isValidPinFormat("12345")).toBe(false);
    expect(isValidPinFormat("1234567")).toBe(false);
    expect(isValidPinFormat("12a456")).toBe(false);
    expect(isValidPinFormat("")).toBe(false);
  });
});

describe("hashPin / verifyPinHash", () => {
  it("vérifie un code correct", () => {
    const hash = hashPin("123456");
    expect(verifyPinHash("123456", hash)).toBe(true);
  });

  it("rejette un code incorrect", () => {
    const hash = hashPin("123456");
    expect(verifyPinHash("654321", hash)).toBe(false);
  });

  it("produit un sel différent à chaque hash (deux hash différents pour le même PIN)", () => {
    expect(hashPin("123456")).not.toBe(hashPin("123456"));
  });

  it("rejette un stockage malformé sans lever d'exception", () => {
    expect(verifyPinHash("123456", "pas-un-hash-valide")).toBe(false);
  });
});

describe("isLockedOut / computeLockoutUntil / remainingLockoutSeconds", () => {
  it("n'est pas verrouillé sans date de verrouillage", () => {
    expect(isLockedOut(null)).toBe(false);
  });

  it("est verrouillé tant que locked_until est dans le futur", () => {
    const now = new Date("2026-09-19T12:00:00.000Z");
    const future = new Date("2026-09-19T12:03:00.000Z").toISOString();
    const past = new Date("2026-09-19T11:00:00.000Z").toISOString();

    expect(isLockedOut(future, now)).toBe(true);
    expect(isLockedOut(past, now)).toBe(false);
  });

  it("calcule une date de déverrouillage 5 minutes dans le futur", () => {
    const now = new Date("2026-09-19T12:00:00.000Z");
    expect(computeLockoutUntil(now)).toBe("2026-09-19T12:05:00.000Z");
  });

  it("calcule le nombre de secondes restantes avant déverrouillage", () => {
    const now = new Date("2026-09-19T12:00:00.000Z");
    const lockedUntil = new Date("2026-09-19T12:00:30.000Z").toISOString();
    expect(remainingLockoutSeconds(lockedUntil, now)).toBe(30);
  });

  it("ne renvoie jamais un nombre négatif de secondes", () => {
    const now = new Date("2026-09-19T12:10:00.000Z");
    const lockedUntil = new Date("2026-09-19T12:00:00.000Z").toISOString();
    expect(remainingLockoutSeconds(lockedUntil, now)).toBe(0);
  });
});
