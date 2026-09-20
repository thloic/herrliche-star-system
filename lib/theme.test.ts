import { afterEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  getThemeInitScript,
  isThemePreference,
  resolveTheme,
} from "./theme";

describe("isThemePreference", () => {
  it("accepte light, dark et system", () => {
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("system")).toBe(true);
  });

  it("rejette toute autre valeur", () => {
    expect(isThemePreference("bleu")).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe("resolveTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renvoie directement light ou dark quand ce n'est pas system", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("résout system via la préférence OS", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    expect(resolveTheme("system")).toBe("dark");

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
    expect(resolveTheme("system")).toBe("light");
  });
});

describe("getThemeInitScript", () => {
  it("référence bien la clé de stockage utilisée par le ThemeProvider", () => {
    expect(getThemeInitScript()).toContain(THEME_STORAGE_KEY);
  });

  it("est un script autonome sans référence à un module externe", () => {
    const script = getThemeInitScript();
    expect(script).not.toMatch(/import |require\(/);
  });
});
