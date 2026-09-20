import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_ID_COOKIE } from "@/lib/pin";

// Rafraîchit le cookie de session Supabase sur chaque requête. La
// redirection des routes protégées se fait dans (app)/layout.tsx, pas ici
// (voir la note "optimistic checks" dans le guide auth de Next.js : le
// proxy ne doit faire que des vérifications rapides basées sur le cookie).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const needsDeviceId = !request.cookies.get(DEVICE_ID_COOKIE);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Nécessaire pour rafraîchir le token expiré avant qu'il n'atteigne les
  // Server Components.
  await supabase.auth.getUser();

  // Identifiant d'appareil pour le PIN (Phase 4) : posé une fois, longue
  // durée, distinct du cookie de session Supabase. Appliqué en dernier car
  // le callback setAll ci-dessus peut remplacer `response` en cours de route.
  if (needsDeviceId) {
    response.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
