"use client";

import { addTextbox } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";
import { MdAdd } from "react-icons/md";
import { TbBraces } from "react-icons/tb";

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

  // Helper to format variable name (e.g. "certificate_id" -> "Certificate Id")
  const formatName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{cat.label}</h3>
          <div className="flex flex-col gap-2">
            {cat.vars.map((v) => (
              <button
                key={v.name}
                onClick={() => addTextbox(canvas, v.placeholder, { fontSize: 20, fill: "#4f46e5", fontWeight: "600" })}
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                    <TbBraces size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-900 transition-colors">
                      {formatName(v.name)}
                    </span>
                    <code className="text-[11px] text-gray-400 group-hover:text-indigo-500 transition-colors">
                      {v.placeholder}
                    </code>
                  </div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 opacity-0 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:opacity-100">
                  <MdAdd size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Custom</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => addTextbox(canvas, "{{custom_variable}}", { fontSize: 20, fill: "#4f46e5", fontWeight: "600" })}
            className="group flex w-full items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white p-2.5 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-gray-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                <TbBraces size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-900 transition-colors">
                  Custom Variable
                </span>
                <code className="text-[11px] text-gray-400 group-hover:text-indigo-500 transition-colors">
                  {"{{...}}"}
                </code>
              </div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 opacity-0 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:opacity-100">
              <MdAdd size={18} />
            </div>
          </button>
          <div className="mt-1 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs leading-relaxed text-gray-500 text-center">
              Or type <code className="rounded bg-indigo-100 px-1 py-0.5 font-semibold text-indigo-700">{`{{variable}}`}</code> directly into a text object.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
