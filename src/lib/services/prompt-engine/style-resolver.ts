import type { BrandKit } from "@/lib/types";
import type { ResolvedPalette, ResolvedTypography } from "./types";
import { resolveFont } from "./schema-rules";

/* ──────────────────────────────────────────────────────────
 * Style Configuration Resolver
 *
 * Derives a deterministic color palette and typography binding
 * from a brand kit (if present) or from sensible defaults.
 * ────────────────────────────────────────────────────────── */

/** Default palette when no brand kit is active. */
const DEFAULT_PALETTE: ResolvedPalette = {
  primary: "#1e3a5f",
  accent: "#c9a84c",
  textDark: "#333333",
  textMuted: "#777777",
  background: "#ffffff",
  all: ["#1e3a5f", "#c9a84c", "#333333", "#777777"],
};

/** Default typography when no brand kit is active. */
const DEFAULT_TYPOGRAPHY: ResolvedTypography = {
  title: "Georgia",
  subtitle: "Georgia",
  body: "Helvetica",
};

/** Resolve a palette from a brand kit. */
export function resolvePalette(brandKit: BrandKit | null): ResolvedPalette {
  if (!brandKit || !brandKit.colors || brandKit.colors.length === 0) {
    return DEFAULT_PALETTE;
  }

  const { colors } = brandKit;
  return {
    primary: colors[0] ?? DEFAULT_PALETTE.primary,
    accent: colors[1] ?? DEFAULT_PALETTE.accent,
    textDark: colors[2] ?? DEFAULT_PALETTE.textDark,
    textMuted: colors[3] ?? DEFAULT_PALETTE.textMuted,
    background: "#ffffff",
    all: colors,
  };
}

/** Resolve typography bindings from a brand kit. */
export function resolveTypography(brandKit: BrandKit | null): ResolvedTypography {
  if (!brandKit || !brandKit.typography) {
    return DEFAULT_TYPOGRAPHY;
  }

  const { typography } = brandKit;
  return {
    title: resolveFont(typography.title) ?? DEFAULT_TYPOGRAPHY.title,
    subtitle: resolveFont(typography.subtitle) ?? resolveFont(typography.title) ?? DEFAULT_TYPOGRAPHY.subtitle,
    body: resolveFont(typography.body) ?? DEFAULT_TYPOGRAPHY.body,
  };
}

/**
 * Builds the style constraint block for the LLM prompt.
 * When a brand kit is active, this is a strict constraint section.
 * When no brand kit is active, this provides flexible guidance.
 */
export function buildStyleBlock(
  brandKit: BrandKit | null,
  style: string
): { header: string; content: string; weight: number } {
  const palette = resolvePalette(brandKit);
  const typography = resolveTypography(brandKit);

  if (brandKit) {
    return {
      header: "STYLE_CONFIGURATIONS",
      content: `═══════════════════════════════════════════════════════
 BRAND KIT CONSTRAINT MODE (ACTIVE)
 Brand: "${brandKit.name}"
═══════════════════════════════════════════════════════

ALLOWED_COLORS — You MUST ONLY use these hex values throughout the
entire design (background, fills, strokes, text fills). Using any
colour outside this list is a CRITICAL VIOLATION:
  ${palette.all.join(", ")}

Colour role mapping:
  • Primary / headings / borders   → ${palette.primary}
  • Accent / decorations / dividers → ${palette.accent}
  • Body text (dark)               → ${palette.textDark}
  • Muted / secondary text         → ${palette.textMuted}
  • Background                     → Use white (#ffffff) or the lightest brand colour

TYPOGRAPHY BINDINGS — Every Textbox MUST use these exact fontFamily values:
  • Title / heading Textbox  → fontFamily: "${typography.title}"
  • Subtitle Textbox         → fontFamily: "${typography.subtitle}"
  • Body / paragraph Textbox → fontFamily: "${typography.body}"

STYLE DIRECTION: ${style}

STRICT OVERRIDES:
- Do NOT randomly generate colours or fonts. Strictly follow the brand constraints above.
- Do NOT use any colour hex value that is not listed in ALLOWED_COLORS.
- The overall design should feel cohesive with the "${brandKit.name}" brand identity.`,
      weight: 100,
    };
  }

  return {
    header: "STYLE_CONFIGURATIONS",
    content: `═══════════════════════════════════════════════════════
 STYLE CONFIGURATION (Default Mode)
═══════════════════════════════════════════════════════

Style direction: ${style}
Typography defaults:
  • Title / heading  → "${typography.title}"
  • Subtitle         → "${typography.subtitle}"
  • Body / paragraph → "${typography.body}"

You have creative freedom with colors. Choose a cohesive palette
that complements the "${style}" style direction. Use the typography
bindings above as your primary font choices.`,
    weight: 100,
  };
}
