import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getSiteTheme } from "@/lib/data/theme";
import { themeToCssVars } from "@/lib/theme/css-vars";
import { getSiteUrl } from "@/lib/seo/site-url";
import { oklchToHex, cssToOklch } from "@/lib/theme/color";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Geraldino — Casa Productora Audiovisual",
    template: "%s — Geraldino",
  },
  description:
    "Geraldino es la casa productora audiovisual de Rene Geraldino en República Dominicana: reels, campañas publicitarias, fotografía de producto, vehículos, gastronomía, fotografía corporativa y podcast.",
};

export async function generateViewport(): Promise<Viewport> {
  const theme = await getSiteTheme();
  return {
    themeColor: oklchToHex(cssToOklch(theme.background)),
    colorScheme: "light",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getSiteTheme();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
      style={themeToCssVars(theme)}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
