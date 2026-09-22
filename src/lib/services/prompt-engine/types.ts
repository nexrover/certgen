import type { BrandKit, BrandKitLayout } from "@/lib/types";

/* ──────────────────────────────────────────────────────────
 * Prompt Compilation Engine — Type Definitions
 *
 * Structural inputs that map 1:1 to the UI controls in the
 * Prompt Generator Workspace and AI Panel.
 * ────────────────────────────────────────────────────────── */

/** A resolved color palette derived from a brand kit or intelligent defaults. */
export interface ResolvedPalette {
  primary: string;
  accent: string;
  textDark: string;
  textMuted: string;
  background: string;
  all: string[];
}

/** Typography bindings resolved from a brand kit or safe defaults. */
export interface ResolvedTypography {
  title: string;
  subtitle: string;
  body: string;
}

/** Injected asset descriptor — logo, element, or image the user selected. */
export interface InjectedAsset {
  kind: "logo" | "element" | "image";
  url: string;
  label: string;
}

/** The complete set of structural UI inputs for prompt compilation. */
export interface PromptCompilationInput {
  /** The design skill set (e.g., "certificate", "youtube", "resume"). */
  skillSet: string;

  /** Canvas width in pixels. */
  width: number;

  /** Canvas height in pixels. */
  height: number;

  /** Paper size identifier (e.g., "A4_LANDSCAPE", "YOUTUBE_THUMBNAIL"). */
  paperSize: string;

  /** Style direction (e.g., "modern", "classic", "bold"). */
  style: string;

  /** Optional brand kit that constrains colors, typography, and layout. */
  brandKit: BrandKit | null;

  /** Optional layout blueprint that constrains element positioning. */
  layout: BrandKitLayout | null;

  /** Assets the user wants injected into the design. */
  assets: InjectedAsset[];

  /** Free-form user instructions / notes. */
  userPrompt: string;

  /** Temperature override (0-1). If null, defaults based on brand kit presence. */
  temperature?: number;
}

/** The output of prompt compilation — ready for the LLM API. */
export interface CompiledPrompt {
  /** The full system instruction string. */
  systemInstruction: string;

  /** The user message to send alongside the system instruction. */
  userMessage: string;

  /** Temperature to use for this generation. */
  temperature: number;

  /** Metadata about what blocks were included. */
  meta: {
    skillSet: string;
    hasBrandKit: boolean;
    hasLayout: boolean;
    assetCount: number;
    blockOrder: string[];
  };
}

/** A single instruction block that gets assembled into the final prompt. */
export interface PromptBlock {
  /** Unique identifier for this block. */
  id: string;

  /** Section header displayed in the prompt. */
  header: string;

  /** The instruction text for this block. */
  content: string;

  /** Ordering weight (lower = earlier in the prompt). */
  weight: number;
}
