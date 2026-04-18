"use client";

import { addTextbox, addTextComboGroup } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface TextPanelProps {
  canvas: Canvas | null;
}

/* ── Quick-add text style buttons ────────────────────────────── */
const TEXT_STYLES = [
  { label: "Heading", fontSize: 48, fontWeight: "bold", text: "Heading" },
  { label: "Subheading", fontSize: 28, fontWeight: "600", text: "Subheading" },
  { label: "Body Text", fontSize: 16, fontWeight: "normal", text: "Body text" },
];

/* ── Combination definitions ─────────────────────────────────── */
interface ComboItem {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
}

interface TextCombo {
  id: string;
  previewBg?: string;           // card background colour
  previewTextColor?: string;    // dominant text colour on card
  previewSrc: string;
  previewWidth: number;
  previewHeight: number;
  items: ComboItem[];
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function balanceLine(line: string): string[] {
  const normalized = line.trim();
  if (normalized.length <= 20 || !normalized.includes(" ")) {
    return [normalized];
  }

  const words = normalized.split(/\s+/);
  let bestSplitIndex = 1;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (let i = 1; i < words.length; i += 1) {
    const left = words.slice(0, i).join(" ");
    const right = words.slice(i).join(" ");
    const delta = Math.abs(left.length - right.length);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestSplitIndex = i;
    }
  }

  return [
    words.slice(0, bestSplitIndex).join(" "),
    words.slice(bestSplitIndex).join(" "),
  ];
}

function createComboPreviewSrc(lines: string[], previewBg = "#f8fafc", previewTextColor = "#111827"): string {
  const width = 220;
  const height = 140;
  const rawLines = lines
    .slice(0, 3)
    .flatMap((line, index) => (index === 0 ? balanceLine(line) : [line]));
  const safeLines = rawLines.slice(0, 4);
  const firstLineSize = safeLines.length > lines.length ? 12 : 14;
  const lineGap = 6;
  const lineBoxes = safeLines.map((_, index) => ({
    fontSize: index === 0 ? firstLineSize : 10,
    fontWeight: index === 0 ? 700 : 500,
    letterSpacing: index === 0 ? 0.8 : 0.2,
  }));
  const totalTextHeight =
    lineBoxes.reduce((sum, line) => sum + line.fontSize, 0) + lineGap * Math.max(0, lineBoxes.length - 1);
  let cursorY = (height - totalTextHeight) / 2;

  const textNodes = safeLines
    .map((line, index) => {
      const metrics = lineBoxes[index];
      cursorY += metrics.fontSize;
      const node = `<text x="${width / 2}" y="${cursorY}" text-anchor="middle" fill="${previewTextColor}" font-size="${metrics.fontSize}" font-weight="${metrics.fontWeight}" letter-spacing="${metrics.letterSpacing}">${escapeSvgText(line)}</text>`;
      cursorY += lineGap;
      return node;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="12" fill="${previewBg}" />
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="11" fill="#ffffff" opacity="0.74" />
  <line x1="36" y1="24" x2="184" y2="24" stroke="${previewTextColor}" stroke-opacity="0.2" />
  ${textNodes}
  <line x1="36" y1="104" x2="184" y2="104" stroke="${previewTextColor}" stroke-opacity="0.2" />
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const COMBO_PREVIEW_SIZE = { width: 220, height: 140 } as const;

const TEXT_COMBOS: TextCombo[] = [
  {
    id: "certificate-title",
    previewSrc: createComboPreviewSrc(["CERTIFICATE", "OF ACHIEVEMENT"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "CERTIFICATE", fontSize: 36, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "OF ACHIEVEMENT", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#555555" },
    ],
  },
  {
    id: "certificate-completion",
    previewSrc: createComboPreviewSrc(["CERTIFICATE OF COMPLETION", "[recipient.name]"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "CERTIFICATE OF COMPLETION", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "[recipient.name]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
    ],
  },
  {
    id: "signature-block",
    previewSrc: createComboPreviewSrc(["Signature", "Name Surname", "Program Mentor"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "Signature", fontSize: 32, fontWeight: "normal", fontFamily: "'Great Vibes', cursive", fontStyle: "italic", textAlign: "center" },
      { text: "Name Surname", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "Program Mentor", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
  {
    id: "issue-date",
    previewSrc: createComboPreviewSrc(["[certificate.issued_on]", "Issue Date"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "[certificate.issued_on]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
      { text: "Issue Date", fontSize: 14, fontWeight: "600", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
  {
    id: "name-role",
    previewSrc: createComboPreviewSrc(["Name Surname", "Program Mentor"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "Name Surname", fontSize: 16, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "Program Mentor", fontSize: 12, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
    ],
  },
  {
    id: "certificate-id",
    previewSrc: createComboPreviewSrc(["[certificate.uuid]", "Certificate ID"]),
    previewWidth: COMBO_PREVIEW_SIZE.width,
    previewHeight: COMBO_PREVIEW_SIZE.height,
    items: [
      { text: "[certificate.uuid]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
      { text: "Certificate ID", fontSize: 14, fontWeight: "600", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
];

/* ── Component ───────────────────────────────────────────────── */
export function TextPanel({ canvas }: TextPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  const handleAddCombo = (combo: TextCombo) => {
    addTextComboGroup(canvas, combo.items);
  };

  return (
    <div className="space-y-5">
      {/* Text Styles */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Text Styles</h3>
        <div className="space-y-1.5">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.label}
              onClick={() =>
                addTextbox(canvas, s.text, {
                  fontSize: s.fontSize,
                  fontWeight: s.fontWeight,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 transition-colors text-center hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span
                style={{
                  fontSize: Math.min(s.fontSize, 20),
                  fontWeight: s.fontWeight,
                }}
                className="text-gray-800"
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Combinations grid */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
          Combinations
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {TEXT_COMBOS.map((combo) => {
            return (
              <button
                key={combo.id}
                onClick={() => handleAddCombo(combo)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition-all hover:border-indigo-300 hover:shadow-sm"
                style={{ aspectRatio: `${combo.previewWidth} / ${combo.previewHeight}` }}
              >
                <img
                  src={combo.previewSrc}
                  alt={`${combo.id} preview`}
                  className="h-full w-full bg-white object-cover"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
