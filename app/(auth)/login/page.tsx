import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-brand px-6 pb-[max(3rem,calc(1rem+env(safe-area-inset-bottom)))] pt-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[3px] border-white/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border-[3px] border-white/10"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-10">
        <div className="flex flex-col gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent text-lg font-extrabold">
            HS
          </span>
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Bonjour,
              <br />
              Content de te revoir !
            </h1>
            <p className="mt-2 text-white/70">
              Connecte-toi pour gérer l&apos;équipe Herrliche Stars.
            </p>
          </div>
        </div>

        <LoginForm />
      </div>

      <p className="relative z-10 text-center text-xs text-white/50">
        Herrliche Stars
      </p>
    </main>
  );
}
