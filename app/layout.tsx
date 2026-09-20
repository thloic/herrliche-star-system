import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { getThemeInitScript } from "@/lib/theme";
import { ThemeProvider } from "./ThemeProvider";
import { ToasterWithTheme } from "./ToasterWithTheme";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Herrliche Stars",
  description: "Gestion du club de basket Herrliche Stars",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Herrliche Stars",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2a6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      // Le script bloquant ci-dessous pose data-theme sur <html> avant que
      // React n'hydrate — attendu, voir lib/theme.ts. Sans ce
      // suppressHydrationWarning, React signale un faux mismatch sur cet
      // attribut à chaque chargement.
      suppressHydrationWarning
    >
      <head>
        {/* Pose data-theme avant le premier paint pour éviter un flash du
            mauvais thème (voir lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <ToasterWithTheme />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
