import { describe, expect, it, vi, beforeEach } from "vitest";

const signInWithPassword = vi.fn();
const redirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));

import { login } from "./actions";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("login", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    redirect.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("refuse sans email ni mot de passe, sans appeler Supabase", async () => {
    const result = await login(undefined, formData({ email: "", password: "" }));

    expect(result?.error).toBeDefined();
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("renvoie une erreur générique si les identifiants sont invalides", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials", code: "invalid_credentials", status: 400 },
    });

    const result = await login(
      undefined,
      formData({ email: "coach@example.com", password: "wrong" }),
    );

    expect(result?.error).toBe("Email ou mot de passe incorrect.");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("logue le détail de l'erreur Supabase côté serveur sans jamais logger le mot de passe", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials", code: "invalid_credentials", status: 400 },
    });

    await login(
      undefined,
      formData({ email: "coach@example.com", password: "secret-du-coach" }),
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("login"),
      expect.objectContaining({
        email: "coach@example.com",
        code: "invalid_credentials",
        status: 400,
      }),
    );
    const loggedPayload = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(loggedPayload).not.toContain("secret-du-coach");
  });

  it("explique comment confirmer le compte si l'email n'est pas confirmé", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed", code: "email_not_confirmed" },
    });

    const result = await login(
      undefined,
      formData({ email: "coach@example.com", password: "correct" }),
    );

    expect(result?.error).toMatch(/pas confirmé/);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirige vers /dashboard si les identifiants sont valides", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    await login(
      undefined,
      formData({ email: "coach@example.com", password: "correct" }),
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "coach@example.com",
      password: "correct",
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
