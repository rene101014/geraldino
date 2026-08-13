// Conversión sRGB <-> OKLCH (algoritmo de Björn Ottosson) y utilidades para
// derivar una paleta completa de tokens shadcn a partir de 3 colores de marca
// (fondo, texto, acento). El admin solo edita esos 3 colores; el resto de los
// tokens (secondary, muted, border, ring, etc.) se calculan aquí.

export type Oklch = { l: number; c: number; h: number };

function srgbToLinear(v: number) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number) {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

export function hexToOklch(hex: string): Oklch {
  const clean = hex.replace("#", "");
  const r = srgbToLinear(parseInt(clean.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(clean.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(clean.slice(4, 6), 16));

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: round(L, 4), c: round(C, 4), h: round(C < 0.0005 ? 0 : H, 2) };
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lc = l_ ** 3;
  const mc = m_ ** 3;
  const sc = s_ ** 3;

  const r = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const b3 = -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc;

  const toHex = (v: number) => linearToSrgb(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b3)}`;
}

export function oklchToCss({ l, c, h }: Oklch): string {
  return `${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`;
}

export function cssToOklch(css: string): Oklch {
  const [l, c, h] = css.trim().split(/\s+/).map(Number);
  return { l: l ?? 0, c: c ?? 0, h: h ?? 0 };
}

function round(n: number, digits: number) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type BrandColors = {
  background: Oklch;
  foreground: Oklch;
  accent: Oklch;
};

export type ThemeTokens = {
  background: Oklch;
  foreground: Oklch;
  primary: Oklch;
  primaryForeground: Oklch;
  secondary: Oklch;
  secondaryForeground: Oklch;
  accent: Oklch;
  accentForeground: Oklch;
  muted: Oklch;
  mutedForeground: Oklch;
  border: Oklch;
  input: Oklch;
  ring: Oklch;
};

// A partir de 3 colores de marca (fondo, texto, acento), calcula el resto de
// los tokens que necesita shadcn/Tailwind manteniendo el naranja como acento
// puntual (botones, ring, active states) y no como color de fondo/hover.
export function deriveTheme({ background, foreground, accent }: BrandColors): ThemeTokens {
  const isLightBg = background.l >= 0.5;
  const neutralStep = isLightBg ? -0.03 : 0.08;
  const mutedStep = isLightBg ? -0.03 : 0.08;
  const borderT = 0.12;

  const contrastForeground: Oklch =
    accent.l < 0.62 ? { l: 1, c: 0, h: 0 } : { l: 0.145, c: 0, h: 0 };

  const secondary: Oklch = {
    l: clamp01(background.l + neutralStep),
    c: 0,
    h: 0,
  };

  const muted: Oklch = {
    l: clamp01(background.l + mutedStep),
    c: 0,
    h: 0,
  };

  const mutedForeground: Oklch = {
    l: round(lerp(background.l, foreground.l, 0.55), 4),
    c: 0,
    h: 0,
  };

  const border: Oklch = {
    l: round(lerp(background.l, foreground.l, borderT), 4),
    c: 0,
    h: 0,
  };

  // Tinte muy sutil del acento para fondos de hover: mismo hue, muy claro y
  // poco saturado para que el naranja marque sin "pintar" toda la interfaz.
  const accentTint: Oklch = {
    l: isLightBg ? 0.95 : 0.22,
    c: Math.min(accent.c, 0.2) * 0.18,
    h: accent.h,
  };

  return {
    background,
    foreground,
    primary: accent,
    primaryForeground: contrastForeground,
    secondary,
    secondaryForeground: foreground,
    accent: accentTint,
    accentForeground: foreground,
    muted,
    mutedForeground,
    border,
    input: border,
    ring: accent,
  };
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
