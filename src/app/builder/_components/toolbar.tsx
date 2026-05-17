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
  /** Template category slug — drives which format presets appear in the dropdown */
  category?: string;
}

/** All available paper/format options with their labels and category affinity. */
const ALL_PAPER_OPTIONS: { value: PaperSize; label: string; categories: string[] }[] = [
  // Certificate / print presets
  { value: "A4", label: "A4 Portrait (595×842)", categories: ["certificate", "email", "resume", "christmas-card", "invoice"] },
  { value: "A4_LANDSCAPE", label: "A4 Landscape (842×595)", categories: ["certificate", "real-estate"] },
  { value: "US_LETTER", label: "US Letter (612×792)", categories: ["certificate", "shipping-label", "receipt"] },
  { value: "US_LETTER_LANDSCAPE", label: "US Letter Landscape (792×612)", categories: ["certificate"] },
  // Digital presets
  { value: "YOUTUBE_THUMBNAIL", label: "YouTube 16:9 (1280×720)", categories: ["youtube"] },
  { value: "SOCIAL_1080", label: "Social Square (1080×1080)", categories: ["social-media"] },
  { value: "SQUARE_500", label: "Small Square (500×500)", categories: ["ecommerce"] },
  { value: "SQUARE_1024", label: "Large Square (1024×1024)", categories: ["ecommerce", "real-estate"] },
  { value: "SQUARE_1200", label: "Shipping Label (1200×1200)", categories: ["shipping-label"] },
  { value: "SOCIAL_STORY", label: "Social Story (1080×1920)", categories: ["real-estate", "social-media"] },
  { value: "OG_IMAGE", label: "Open Graph (1200×630)", categories: ["open-graph"] },
  { value: "CUSTOM_16_9", label: "Full HD 16:9 (1920×1080)", categories: ["ecommerce", "youtube"] },
  { value: "RESUME", label: "Resume Page (1020×1320)", categories: ["resume"] },
  { value: "INVOICE", label: "Invoice Page (1020×1320)", categories: ["invoice"] },
];

/**
 * Returns paper options relevant to the given category.
 * Always includes at least the full list if category is unknown.
 */
function getOptionsForCategory(category: string) {
  const relevant = ALL_PAPER_OPTIONS.filter((o) => o.categories.includes(category));
  // If nothing matched (unknown category), show everything
  return relevant.length > 0 ? relevant : ALL_PAPER_OPTIONS;
}

export function Toolbar({
  templateName, onNameChange, paperSize, onPaperSizeChange,
  onPreview, onSave, onDownloadPdf, saving, dirty, category = "certificate",
}: ToolbarProps) {
  const options = getOptionsForCategory(category);

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
        <select
          value={paperSize}
          onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-700"
        >
          {options.map((o) => (
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
