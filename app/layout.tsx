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
    colorScheme: "dark",
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
      <head>
        {/*
          Arma la animación de entrada ANTES del primer pintado, para que no
          haya flash de contenido visible -> oculto -> visible.

          El failsafe es lo importante: pase lo que pase, a los 2.5s se quita
          el atributo y todo queda visible. No depende de React ni del
          observer. Si la hidratación falla o el JS del bundle revienta, el
          contenido aparece igual — que es exactamente el modo de fallo que
          rompió este sitio cuatro veces.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
if(typeof IntersectionObserver==="undefined")return;
if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var h=document.documentElement;
h.setAttribute("data-reveal","on");
setTimeout(function(){if(!h.hasAttribute("data-reveal-ready"))h.removeAttribute("data-reveal")},2500);
}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
