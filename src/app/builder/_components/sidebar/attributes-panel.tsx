"use client";

import { addTextbox } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface AttributesPanelProps {
  canvas: Canvas | null;
}

const CATEGORIES = [
  {
    label: "Recipient",
    vars: [
      { name: "name", placeholder: "{{name}}" },
      { name: "email", placeholder: "{{email}}" },
    ],
  },
  {
    label: "Certificate",
    vars: [
      { name: "certificate_id", placeholder: "{{certificate_id}}" },
      { name: "issued_date", placeholder: "{{issued_date}}" },
      { name: "expiry_date", placeholder: "{{expiry_date}}" },
    ],
  },
  {
    label: "Issuer",
    vars: [
      { name: "issuer_name", placeholder: "{{issuer_name}}" },
      { name: "issuer_email", placeholder: "{{issuer_email}}" },
    ],
  },
];

export function AttributesPanel({ canvas }: AttributesPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{cat.label}</h3>
          <div className="space-y-1">
            {cat.vars.map((v) => (
              <button
                key={v.name}
                onClick={() => addTextbox(canvas, v.placeholder, { fontSize: 20, fill: "#4f46e5", fontWeight: "600" })}
                className="flex w-full items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50"
              >
                <code className="text-indigo-600">{v.placeholder}</code>
                <span className="text-gray-400">Use</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Custom</h3>
        <p className="text-xs text-gray-400">
          Type any <code className="text-indigo-500">{`{{variable}}`}</code> directly into a text object on the canvas.
        </p>
      </div>
    </div>
  );
}
