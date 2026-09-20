import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Consumer() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return (
    <div>
      <p>Préférence : {preference}</p>
      <p>Résolu : {resolvedTheme}</p>
      <button onClick={() => setPreference("dark")}>Sombre</button>
      <button onClick={() => setPreference("light")}>Clair</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reprend la préférence déjà stockée sur l'appareil", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(await screen.findByText("Préférence : dark")).toBeInTheDocument();
    expect(screen.getByText("Résolu : dark")).toBeInTheDocument();
  });

  it("met à jour l'attribut data-theme et persiste le choix", async () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Sombre" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: "Clair" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("lève une erreur explicite si useTheme est appelé hors ThemeProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      "useTheme doit être utilisé à l'intérieur de ThemeProvider",
    );
    consoleError.mockRestore();
  });
});
