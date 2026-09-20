"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { gsap } from "gsap";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semibold text-brand shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Connexion…" : "Se connecter"}
      {!pending && (
        <ArrowRight
          size={18}
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );
  }, []);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm transition-colors focus-within:border-white/50 focus-within:bg-white/15">
        <Mail size={18} className="text-white/60" aria-hidden />
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Email"
          required
          className="w-full bg-transparent text-base text-white placeholder-white/60 outline-none"
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm transition-colors focus-within:border-white/50 focus-within:bg-white/15">
        <Lock size={18} className="text-white/60" aria-hidden />
        <label htmlFor="password" className="sr-only">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Mot de passe"
          required
          className="w-full bg-transparent text-base text-white placeholder-white/60 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={
            showPassword
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
          className="text-white/60 transition-colors hover:text-white"
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </button>
      </div>

      <div className="mt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
