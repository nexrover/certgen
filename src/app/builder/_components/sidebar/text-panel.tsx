"use client";

import { addTextbox } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface TextPanelProps {
  canvas: Canvas | null;
}

const TEXT_STYLES = [
  { label: "Heading", fontSize: 48, fontWeight: "bold", text: "Heading" },
  { label: "Subheading", fontSize: 28, fontWeight: "600", text: "Subheading" },
  { label: "Body Text", fontSize: 16, fontWeight: "normal", text: "Body text" },
];

const TEXT_COMBOS = [
  {
    label: "Certificate Title",
    items: [
      { text: "Certificate of Completion", fontSize: 42, fontWeight: "bold" },
      { text: "This certifies that", fontSize: 16, fontWeight: "normal" },
      { text: "{{name}}", fontSize: 32, fontWeight: "bold" },
    ],
  },
  {
    label: "Signature Block",
    items: [
      { text: "________________________", fontSize: 14, fontWeight: "normal" },
      { text: "{{issuer_name}}", fontSize: 16, fontWeight: "600" },
      { text: "{{issuer_email}}", fontSize: 12, fontWeight: "normal" },
    ],
  },
  {
    label: "Certificate ID + Date",
    items: [
      { text: "Certificate ID: {{certificate_id}}", fontSize: 12, fontWeight: "normal" },
      { text: "Issued: {{issued_date}}", fontSize: 12, fontWeight: "normal" },
    ],
  },
];

export function TextPanel({ canvas }: TextPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Text Styles</h3>
        <div className="space-y-1.5">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.label}
              onClick={() => addTextbox(canvas, s.text, { fontSize: s.fontSize, fontWeight: s.fontWeight })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span style={{ fontSize: Math.min(s.fontSize, 20), fontWeight: s.fontWeight }} className="text-gray-800">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Combinations</h3>
        <div className="space-y-1.5">
          {TEXT_COMBOS.map((combo) => (
            <button
              key={combo.label}
              onClick={() => {
                let offsetY = canvas.height! / 2 - (combo.items.length * 30) / 2;
                for (const item of combo.items) {
                  addTextbox(canvas, item.text, { fontSize: item.fontSize, fontWeight: item.fontWeight, top: offsetY });
                  offsetY += item.fontSize + 16;
                }
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              {combo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
