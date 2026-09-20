"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log serveur uniquement (jamais renvoyé au client) : email + détails
    // Supabase pour diagnostiquer. Ne jamais logger le mot de passe, un token
    // ou la session — uniquement des métadonnées d'erreur.
    console.error("[login] échec de connexion Supabase", {
      email,
      status: error.status,
      code: error.code,
      message: error.message,
    });

    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Ce compte n'est pas confirmé. Dans Supabase, ouvre Authentication → Users, sélectionne le compte et confirme l'email (ou recrée-le avec « Auto Confirm User » coché).",
      };
    }
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}
