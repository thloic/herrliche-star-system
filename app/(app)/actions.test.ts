import { describe, expect, it, vi, beforeEach } from "vitest";

const signOut = vi.fn();
const redirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signOut },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));

import { logout } from "./actions";

describe("logout", () => {
  beforeEach(() => {
    signOut.mockReset();
    redirect.mockReset();
  });

  it("déconnecte de Supabase puis redirige vers /login", async () => {
    await logout();

    expect(signOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
