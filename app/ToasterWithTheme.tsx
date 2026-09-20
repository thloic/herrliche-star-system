"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

export function ToasterWithTheme() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster position="top-center" richColors closeButton theme={resolvedTheme} />
  );
}
