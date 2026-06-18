"use client";

import type { BrandKit } from "@/lib/types";

interface TypographyTabProps {
  editingBrandKit: BrandKit | null;
  onChange: (updated: BrandKit) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Roboto",
  "Lora",
  "Montserrat",
  "Oswald",
  "Poppins",
  "Merriweather",
  "Outfit",
  "Dancing Script",
  "Cinzel"
];

const FIELDS = [
  { label: "Title Font (Headings)", key: "title" as const },
  { label: "Subtitle Font", key: "subtitle" as const },
  { label: "Body Font (Paragraphs)", key: "body" as const }
];

export function TypographyTab({ editingBrandKit, onChange }: TypographyTabProps) {
  if (!editingBrandKit) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Typography Hierarchy</h3>
      <div className="space-y-6 max-w-2xl">
        {FIELDS.map((item) => {
          const fontVal = editingBrandKit.typography?.[item.key] || "Inter";
          return (
            <div key={item.key} className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">{item.label}</label>
              <select
                value={fontVal}
                onChange={(e) => {
                  onChange({
                    ...editingBrandKit,
                    typography: {
                      ...editingBrandKit.typography,
                      [item.key]: e.target.value
                    }
                  });
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
