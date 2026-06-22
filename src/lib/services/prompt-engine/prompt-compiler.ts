import type { PromptCompilationInput, CompiledPrompt, PromptBlock } from "./types";
import { buildCoreIdentityBlock } from "./core-identity";
import { buildSchemaRulesBlock } from "./schema-rules";
import { getSkillSet } from "./skill-set-registry";
import { buildStyleBlock } from "./style-resolver";
import { buildLayoutBlock } from "./layout-engine";
import { buildAssetBlock } from "./asset-injector";

/* ──────────────────────────────────────────────────────────
 * Prompt Compiler
 *
 * The central adapter that translates structural UI inputs
 * into deterministic, block-assembled LLM instructions.
 *
 * Architecture:
 *   Input → [Block Assembly] → Sorted Blocks → Final Prompt
 *
 * Each block is an independent, composable unit. Blocks are
 * sorted by weight (lower = earlier) and concatenated with
 * clear section delimiters.
 * ────────────────────────────────────────────────────────── */

const BLOCK_DELIMITER = "\n\n";

/**
 * Compiles a set of structural UI inputs into a fully-formed
 * system instruction and user message ready for the LLM API.
 */
export function compilePrompt(input: PromptCompilationInput): CompiledPrompt {
  const blocks: PromptBlock[] = [];

  // ── Block 0: Core Identity (Weight 0 — Foundational) ────
  blocks.push({
    id: "core_identity",
    header: "CORE_IDENTITY",
    content: buildCoreIdentityBlock(),
    weight: 0,
  });

  // ── Block 1: System Skill Set Instruction ───────────────
  const skillSet = getSkillSet(input.skillSet);
  blocks.push({
    id: "skill_set",
    header: "SYSTEM_SKILL_SET",
    content: buildSkillSetBlock(input, skillSet),
    weight: 10,
  });

  // ── Block 2: Target Canvas ──────────────────────────────
  blocks.push({
    id: "target_canvas",
    header: "TARGET_CANVAS",
    content: buildCanvasBlock(input),
    weight: 20,
  });

  // ── Block 3: Style Configurations ───────────────────────
  const styleBlock = buildStyleBlock(input.brandKit, input.style);
  blocks.push({
    id: "style",
    header: styleBlock.header,
    content: styleBlock.content,
    weight: styleBlock.weight,
  });

  // ── Block 4: Layout & Wireframe Strategy ────────────────
  const layoutBlock = buildLayoutBlock(input.layout, input.width, input.height);
  if (layoutBlock) {
    blocks.push({
      id: "layout",
      header: layoutBlock.header,
      content: layoutBlock.content,
      weight: layoutBlock.weight,
    });
  }

  // ── Block 5: Injected Assets ────────────────────────────
  const assetBlock = buildAssetBlock(input.assets);
  if (assetBlock) {
    blocks.push({
      id: "assets",
      header: assetBlock.header,
      content: assetBlock.content,
      weight: assetBlock.weight,
    });
  }

  // ── Block 6: Core Schema Rules ──────────────────────────
  blocks.push({
    id: "schema_rules",
    header: "SCHEMA_RULES",
    content: buildSchemaRulesBlock(input.width, input.height),
    weight: 200,
  });

  // ── Block 7: Design Instructions (from skill set) ───────
  blocks.push({
    id: "design_instructions",
    header: "DESIGN_INSTRUCTIONS",
    content: skillSet.designInstructions,
    weight: 300,
  });

  // ── Block 8: Example Template ───────────────────────────
  blocks.push({
    id: "example_template",
    header: "EXAMPLE_TEMPLATE",
    content: buildExampleBlock(skillSet, input),
    weight: 400,
  });

  // ── Block 9: User Explicit Instructions ─────────────────
  if (input.userPrompt.trim()) {
    blocks.push({
      id: "user_prompt",
      header: "USER_INSTRUCTIONS",
      content: `═══════════════════════════════════════════════════════
 USER EXPLICIT INSTRUCTIONS
═══════════════════════════════════════════════════════

The user has provided the following specific directives.
These OVERRIDE any default design decisions:

"${input.userPrompt.trim()}"`,
      weight: 500,
    });
  }

  // ── Assemble ────────────────────────────────────────────
  blocks.sort((a, b) => a.weight - b.weight);

  const systemInstruction = assembleSystemInstruction(blocks, input);
  const userMessage = buildUserMessage(input);

  const temperature = input.temperature ?? (input.brandKit ? 0.6 : 0.8);

  return {
    systemInstruction,
    userMessage,
    temperature,
    meta: {
      skillSet: input.skillSet,
      hasBrandKit: !!input.brandKit,
      hasLayout: !!input.layout,
      assetCount: input.assets.length,
      blockOrder: blocks.map((b) => b.id),
    },
  };
}

/* ── Block Builders ─────────────────────────────────────── */

function buildSkillSetBlock(
  input: PromptCompilationInput,
  skillSet: { label: string; mergeTags: string[] }
): string {
  return `You are an expert designer specializing in ${skillSet.label} design.
You are designing a ${input.skillSet} template.
Available merge tags for this skill set: ${skillSet.mergeTags.join(", ")}
You MUST return ONLY valid JSON. No markdown, no code fences, no explanation.`;
}

function buildCanvasBlock(input: PromptCompilationInput): string {
  return `TARGET CANVAS:
- Width: ${input.width}px
- Height: ${input.height}px
- Paper Size: ${input.paperSize}
- Aspect Ratio: ${(input.width / input.height).toFixed(2)}:1
- Orientation: ${input.width > input.height ? "landscape" : input.width < input.height ? "portrait" : "square"}`;
}

function buildExampleBlock(
  skillSet: { exampleFactory: (w: number, h: number, ps: string) => Record<string, unknown> },
  input: PromptCompilationInput
): string {
  const example = skillSet.exampleFactory(input.width, input.height, input.paperSize);
  return `HERE IS AN EXCELLENT EXAMPLE of the exact JSON structure you must follow:
${JSON.stringify(example, null, 2)}

Now generate a DIFFERENT, unique, beautiful template based on the user's prompt.
Use a different color scheme and layout than the example.
Be creative with the design while following the exact same JSON structure.${input.layout ? ` Follow the "${input.layout.name}" layout positioning rules precisely.` : ""}`;
}

/* ── Assembly ───────────────────────────────────────────── */

function assembleSystemInstruction(
  blocks: PromptBlock[],
  input: PromptCompilationInput
): string {
  const header = `═══════════════════════════════════════════════════════
 PROMPT COMPILATION ENGINE v2.0
 Skill Set: ${input.skillSet} | Canvas: ${input.width}×${input.height}px
 Mode: ${input.brandKit ? "Brand Kit Constrained" : "Creative自由"}
═══════════════════════════════════════════════════════`;

  const blockStrings = blocks.map(
    (b) => `/* ── ${b.header} ────────────────────────────── */\n${b.content}`
  );

  return [header, ...blockStrings].join(BLOCK_DELIMITER);
}

function buildUserMessage(input: PromptCompilationInput): string {
  const parts: string[] = [];

  parts.push(
    `Design a stunning ${input.skillSet} template: "${input.userPrompt || "Create a beautiful, professional design"}".`
  );

  parts.push(
    `Use ${input.width > input.height ? "landscape" : input.width < input.height ? "portrait" : "square"} orientation (${input.width}×${input.height}px) with ${input.style} style.`
  );

  if (input.brandKit) {
    parts.push(`Apply the "${input.brandKit.name}" brand kit constraints.`);
  }

  if (input.layout) {
    parts.push(`Follow the "${input.layout.name}" layout structure.`);
  }

  if (input.assets.length > 0) {
    parts.push(`Incorporate ${input.assets.length} user-provided asset(s) as placeholders.`);
  }

  parts.push("Return ONLY valid JSON matching the required schema.");

  return parts.join(" ");
}
