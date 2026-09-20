import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSettings } from "./ThemeSettings";

const { useTheme } = vi.hoisted(() => ({ useTheme: vi.fn() }));
vi.mock("@/app/ThemeProvider", () => ({ useTheme }));

describe("ThemeSettings", () => {
  it("affiche les trois options et coche celle en cours", () => {
    useTheme.mockReturnValue({ preference: "dark", setPreference: vi.fn() });

    render(<ThemeSettings />);

    expect(screen.getByRole("radio", { name: /Clair/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("radio", { name: /Sombre/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      screen.getByRole("radio", { name: /Selon le téléphone/ }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("appelle setPreference au clic sur une option", async () => {
    const setPreference = vi.fn();
    useTheme.mockReturnValue({ preference: "system", setPreference });

    render(<ThemeSettings />);
    await userEvent.click(screen.getByRole("radio", { name: /Sombre/ }));

    expect(setPreference).toHaveBeenCalledWith("dark");
  });
});
