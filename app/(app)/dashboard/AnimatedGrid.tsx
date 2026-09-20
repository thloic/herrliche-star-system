"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Enveloppe des enfants déjà rendus côté serveur (les vraies stat cards) pour
// leur appliquer une entrée en fondu/décalage au montage — le seul usage
// GSAP du dashboard, volontairement discret (voir docs/DESIGN.md, motion
// "intentionnel mais discret").
export function AnimatedGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
    );
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
