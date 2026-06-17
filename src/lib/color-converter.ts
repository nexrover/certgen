export interface RGB {
  r: number; // 0..255
  g: number; // 0..255
  b: number; // 0..255
}

export interface OKLCH {
  l: number; // 0..1
  c: number; // 0..0.4 (approx max)
  h: number; // 0..360
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

// RGB -> HEX
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (val: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(val))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// HEX -> RGB
export function hexToRgb(hex: string): RGB | null {
  const sanitized = hex.trim().replace(/^#/, "");
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  } else if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }
  return null;
}

// OKLCH -> OKLAB -> LMS -> Linear sRGB -> sRGB (RGB)
export function oklchToRgb({ l, c, h }: OKLCH): RGB {
  // Convert h to radians
  const hRad = (h * Math.PI) / 180;
  const okA = c * Math.cos(hRad);
  const okB = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * okA + 0.2158037573 * okB;
  const m_ = l - 0.1055613458 * okA - 0.0638541728 * okB;
  const s_ = l - 0.0894841775 * okA - 1.2914855480 * okB;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const transfer = (cVal: number) => {
    return cVal > 0.0031308
      ? 1.055 * Math.pow(cVal, 1 / 2.4) - 0.055
      : 12.92 * cVal;
  };

  const rOut = Math.max(0, Math.min(255, Math.round(transfer(rLinear) * 255)));
  const gOut = Math.max(0, Math.min(255, Math.round(transfer(gLinear) * 255)));
  const bOut = Math.max(0, Math.min(255, Math.round(transfer(bLinear) * 255)));

  return { r: rOut, g: gOut, b: bOut };
}

// RGB -> Linear sRGB -> LMS -> OKLAB -> OKLCH
export function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;

  const transferInverse = (cVal: number) => {
    return cVal > 0.04045
      ? Math.pow((cVal + 0.055) / 1.055, 2.4)
      : cVal / 12.92;
  };

  const rLinear = transferInverse(rN);
  const gLinear = transferInverse(gN);
  const bLinear = transferInverse(bN);

  const l_ = Math.cbrt(0.4122214708 * rLinear + 0.536311362 * gLinear + 0.051457384 * bLinear);
  const m_ = Math.cbrt(0.1167080661 * rLinear + 0.6858485458 * gLinear + 0.1973238776 * bLinear);
  const s_ = Math.cbrt(0.0893354016 * rLinear + 0.2885764062 * gLinear + 0.7145756795 * bLinear);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const okA = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const okB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(okA * okA + okB * okB);
  let hRad = Math.atan2(okB, okA);
  let h = (hRad * 180) / Math.PI;
  if (h < 0) h += 360;

  // Round values nicely
  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(h * 10) / 10,
  };
}

// HEX -> OKLCH
export function hexToOklch(hex: string): OKLCH | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToOklch(rgb);
}

// OKLCH -> HEX
export function oklchToHex(oklch: OKLCH): string {
  const rgb = oklchToRgb(oklch);
  return rgbToHex(rgb);
}

export function parseHex(val: string): string | null {
  const match = val.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return null;
  const raw = match[1];
  if (raw.length === 3) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toUpperCase();
  }
  return `#${raw}`.toUpperCase();
}

export function parseRgb(val: string): RGB | null {
  const trimmed = val.trim().toLowerCase();
  
  let content = trimmed;
  if (trimmed.startsWith("rgb")) {
    const match = trimmed.match(/^rgba?\((.*)\)$/);
    if (!match) return null;
    content = match[1];
  }

  const parts = content.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const parsePart = (p: string, limit: number) => {
    if (p.endsWith("%")) {
      const pct = parseFloat(p.slice(0, -1));
      return isNaN(pct) ? 0 : Math.round((pct / 100) * limit);
    }
    const num = parseFloat(p);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const r = parsePart(parts[0], 255);
  const g = parsePart(parts[1], 255);
  const b = parsePart(parts[2], 255);

  if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    return { r, g, b };
  }
  return null;
}

export function parseOklch(val: string): OKLCH | null {
  const trimmed = val.trim().toLowerCase();
  
  let content = trimmed;
  if (trimmed.startsWith("oklch")) {
    const match = trimmed.match(/^oklch\((.*)\)$/);
    if (!match) return null;
    content = match[1];
  }

  const parts = content.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const parseL = (p: string) => {
    if (p.endsWith("%")) {
      return parseFloat(p.slice(0, -1)) / 100;
    }
    return parseFloat(p);
  };

  const parseC = (p: string) => {
    if (p.endsWith("%")) {
      return parseFloat(p.slice(0, -1)) / 100;
    }
    return parseFloat(p);
  };

  const parseH = (p: string) => {
    let raw = p;
    if (p.endsWith("deg")) raw = p.slice(0, -3);
    else if (p.endsWith("rad")) return (parseFloat(p.slice(0, -3)) * 180) / Math.PI;
    else if (p.endsWith("turn")) return parseFloat(p.slice(0, -4)) * 360;
    return parseFloat(raw);
  };

  const l = parseL(parts[0]);
  const c = parseC(parts[1]);
  const h = parseH(parts[2]);

  if (!isNaN(l) && !isNaN(c) && !isNaN(h)) {
    return {
      l: Math.max(0, Math.min(1, l)),
      c: Math.max(0, c),
      h: ((h % 360) + 360) % 360
    };
  }
  
  return null;
}

export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: "preset-autumn-forest",
    name: "Autumn Forest",
    colors: ["#7C2D12", "#9A3412", "#B45309", "#D97706", "#F59E0B"],
  },
  {
    id: "preset-berry-delight",
    name: "Berry Delight",
    colors: ["#831843", "#9D174D", "#BE185D", "#D01C6A", "#F472B6"],
  },
  {
    id: "preset-citrus-splash",
    name: "Citrus Splash",
    colors: ["#15803D", "#16A34A", "#CA8A04", "#EAB308", "#FDE047"],
  },
  {
    id: "preset-classic-navy",
    name: "Classic Navy",
    colors: ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B"],
  },
  {
    id: "preset-cyberpunk-neon",
    name: "Cyberpunk Neon",
    colors: ["#030712", "#4C1D95", "#8B5CF6", "#EC4899", "#F43F5E"],
  },
  {
    id: "preset-desert-sand",
    name: "Desert Sand",
    colors: ["#78350F", "#92400E", "#D97706", "#F59E0B", "#FEF3C7"],
  },
  {
    id: "preset-emerald-garden",
    name: "Emerald Garden",
    colors: ["#064E3B", "#065F46", "#047857", "#059669", "#34D399"],
  },
  {
    id: "preset-forest-pine",
    name: "Forest Pine",
    colors: ["#022C22", "#064E3B", "#065F46", "#047857", "#10B981"],
  },
  {
    id: "preset-lavender-fields",
    name: "Lavender Fields",
    colors: ["#4C1D95", "#5B21B6", "#6D28D9", "#7C3AED", "#A78BFA"],
  },
  {
    id: "preset-midnight-blue",
    name: "Midnight Blue",
    colors: ["#172554", "#1E3A8A", "#1E40AF", "#2563EB", "#3B82F6"],
  },
  {
    id: "preset-midnight-cyber",
    name: "Midnight Cyber",
    colors: ["#020617", "#0F172A", "#1E293B", "#F43F5E", "#10B981"],
  },
  {
    id: "preset-ocean-breeze",
    name: "Ocean Breeze",
    colors: ["#047857", "#0D9488", "#06B6D4", "#22D3EE", "#ECFEFF"],
  },
  {
    id: "preset-pastel-dreams",
    name: "Pastel Dreams",
    colors: ["#FBCFE8", "#F59E0B", "#A7F3D0", "#BAE6FD", "#C7D2FE"],
  },
  {
    id: "preset-rose-petal",
    name: "Rose Petal",
    colors: ["#9F1239", "#BE123C", "#E11D48", "#F43F5E", "#FB7185"],
  },
  {
    id: "preset-sakura-blossom",
    name: "Sakura Blossom",
    colors: ["#4A0404", "#9F1239", "#FDA4AF", "#FECDD3", "#FFF1F2"],
  },
  {
    id: "preset-sunset-glow",
    name: "Sunset Glow",
    colors: ["#7C2D12", "#9A3412", "#C2410C", "#EA580C", "#F97316"],
  },
  {
    id: "preset-tech-indigo",
    name: "Tech Indigo",
    colors: ["#312E81", "#3730A3", "#4338CA", "#4F46E5", "#6366F1"],
  },
  {
    id: "preset-tropical-paradise",
    name: "Tropical Paradise",
    colors: ["#1E3A8A", "#0D9488", "#059669", "#F59E0B", "#E11D48"],
  },
  {
    id: "preset-vintage-retro",
    name: "Vintage Retro",
    colors: ["#451A03", "#78350F", "#B45309", "#CA8A04", "#FDE047"],
  },
  {
    id: "preset-warm-copper",
    name: "Warm Copper",
    colors: ["#29130C", "#4E2415", "#7C3E2D", "#A75D4E", "#D1887B"],
  },
].sort((a, b) => a.name.localeCompare(b.name));
