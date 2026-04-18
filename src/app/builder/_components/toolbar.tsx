"use client";

import Link from "next/link";
import type { PaperSize } from "@/lib/types";

interface ToolbarProps {
  templateName: string;
  onNameChange: (name: string) => void;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  onPreview: () => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  saving: boolean;
  dirty: boolean;
}

const PAPER_OPTIONS: { value: PaperSize; label: string }[] = [
  { value: "A4", label: "A4 Portrait" },
  { value: "A4_LANDSCAPE", label: "A4 Landscape" },
  { value: "US_LETTER", label: "US Letter" },
  { value: "US_LETTER_LANDSCAPE", label: "US Letter Landscape" },
  { value: "CUSTOM", label: "Custom (1920×1080)" },
];

export function Toolbar({
  templateName, onNameChange, paperSize, onPaperSizeChange,
  onPreview, onSave, onDownloadPdf, saving, dirty,
}: ToolbarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard?view=templates" className="text-lg font-bold text-indigo-600">
          CertGen
        </Link>
        <div className="h-6 w-px bg-gray-200" />
        <input
          type="text"
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          className="rounded border border-transparent px-2 py-1 text-sm font-medium text-gray-800 hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
          placeholder="Untitled Template"
        />
        {dirty && <span className="text-xs text-amber-500">Unsaved</span>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard?view=templates"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
        <select
          value={paperSize}
          onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-700"
        >
          {PAPER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button onClick={onPreview} className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
          Preview
        </button>
        <button onClick={onDownloadPdf} className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
          Export PDF
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
