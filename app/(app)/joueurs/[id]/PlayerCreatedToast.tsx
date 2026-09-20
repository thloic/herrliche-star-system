"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function PlayerCreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bienvenue = searchParams.get("bienvenue");

  useEffect(() => {
    if (!bienvenue) return;
    toast.success("Enfant inscrit avec succès.");
    router.replace(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bienvenue]);

  return null;
}
