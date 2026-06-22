/* ──────────────────────────────────────────────────────────
 * Prompt Engine — Public API
 *
 * Re-exports the compilation engine and all supporting modules
 * for use by the route handlers and frontend components.
 * ────────────────────────────────────────────────────────── */

export { compilePrompt } from "./prompt-compiler";
export type { PromptCompilationInput, CompiledPrompt, InjectedAsset, PromptBlock } from "./types";

export { buildCoreIdentityBlock } from "./core-identity";

export { getSkillSet, listSkillSets, registerSkillSet } from "./skill-set-registry";
export type { SkillSetEntry } from "./skill-set-registry";

export { resolvePalette, resolveTypography, buildStyleBlock } from "./style-resolver";
export type { ResolvedPalette, ResolvedTypography } from "./types";

export { buildLayoutBlock } from "./layout-engine";
export { buildAssetBlock } from "./asset-injector";
export { buildSchemaRulesBlock, resolveFont, getSafeFonts, cx } from "./schema-rules";
