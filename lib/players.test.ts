import { describe, expect, it } from "vitest";
import { initials } from "./players";

describe("initials", () => {
  it("prend la première lettre des deux premiers mots", () => {
    expect(initials("AGBETOKA Kodjo Kevin")).toBe("AK");
  });

  it("gère un nom composé d'un seul mot", () => {
    expect(initials("Madonna")).toBe("M");
  });

  it("ignore les espaces multiples", () => {
    expect(initials("  Ama   Dosseh  ")).toBe("AD");
  });
});
