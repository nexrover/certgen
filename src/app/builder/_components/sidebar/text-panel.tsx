"use client";

import { useState, useRef, useCallback } from "react";
import { addTextbox, addTextComboGroup } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface TextPanelProps {
  canvas: Canvas | null;
}

const TEXT_STYLES = [
  { label: "Heading", fontSize: 48, fontWeight: "bold", text: "Heading" },
  { label: "Subheading", fontSize: 28, fontWeight: "600", text: "Subheading" },
  { label: "Body Text", fontSize: 16, fontWeight: "normal", text: "Body text" },
];

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
  return [words.slice(0, bestSplitIndex).join(" "), words.slice(bestSplitIndex).join(" ")];
}

function createComboPreviewSrc(lines: string[], previewBg = "#f8fafc", previewTextColor = "#111827"): string {
  const width = 220;
  const height = 140;
  const rawLines = lines.slice(0, 3).flatMap((line, index) => (index === 0 ? balanceLine(line) : [line]));
  const safeLines = rawLines.slice(0, 4);
  const firstLineSize = safeLines.length > lines.length ? 12 : 14;
  const lineGap = 6;
  const lineBoxes = safeLines.map((_, index) => ({
    fontSize: index === 0 ? firstLineSize : 10,
    fontWeight: index === 0 ? 700 : 500,
    letterSpacing: index === 0 ? 0.8 : 0.2,
  }));
  const totalTextHeight = lineBoxes.reduce((sum, line) => sum + line.fontSize, 0) + lineGap * Math.max(0, lineBoxes.length - 1);
  let cursorY = (height - totalTextHeight) / 2;
  const textNodes = safeLines.map((line, index) => {
    const metrics = lineBoxes[index];
    cursorY += metrics.fontSize;
    const node = `<text x="${width / 2}" y="${cursorY}" text-anchor="middle" fill="${previewTextColor}" font-size="${metrics.fontSize}" font-weight="${metrics.fontWeight}" letter-spacing="${metrics.letterSpacing}">${escapeSvgText(line)}</text>`;
    cursorY += lineGap;
    return node;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="12" fill="${previewBg}" />
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="11" fill="#ffffff" opacity="0.74" />
  <line x1="36" y1="24" x2="184" y2="24" stroke="${previewTextColor}" stroke-opacity="0.2" />
  ${textNodes}
  <line x1="36" y1="104" x2="184" y2="104" stroke="${previewTextColor}" stroke-opacity="0.2" />
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const TEXT_COMBOS: TextCombo[] = [
  { id: "certificate-title", previewSrc: createComboPreviewSrc(["CERTIFICATE", "OF ACHIEVEMENT"]), previewWidth: 220, previewHeight: 140, items: [{ text: "CERTIFICATE", fontSize: 36, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" }, { text: "OF ACHIEVEMENT", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#555555" }] },
  { id: "certificate-completion", previewSrc: createComboPreviewSrc(["CERTIFICATE OF COMPLETION", "[recipient.name]"]), previewWidth: 220, previewHeight: 140, items: [{ text: "CERTIFICATE OF COMPLETION", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" }, { text: "[recipient.name]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" }] },
  { id: "signature-block", previewSrc: createComboPreviewSrc(["Signature", "Name Surname", "Program Mentor"]), previewWidth: 220, previewHeight: 140, items: [{ text: "Signature", fontSize: 32, fontWeight: "normal", fontFamily: "'Great Vibes', cursive", fontStyle: "italic", textAlign: "center" }, { text: "Name Surname", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" }, { text: "Program Mentor", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center" }] },
  { id: "issue-date", previewSrc: createComboPreviewSrc(["[certificate.issued_on]", "Issue Date"]), previewWidth: 220, previewHeight: 140, items: [{ text: "[certificate.issued_on]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" }, { text: "Issue Date", fontSize: 14, fontWeight: "600", fontFamily: "Georgia", textAlign: "center" }] },
];

const TEXT_CATEGORIES = ["All", "Basic", "Combinations", "Recent"];

export function TextPanel({ canvas }: TextPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentlyUsed, setRecentlyUsed] = useState<any[]>([]);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  const handleAddText = (text: string, options: any) => {
    addTextbox(canvas, text, options);
    setRecentlyUsed(prev => {
      const id = `${text}-${options.fontSize}`;
      const filtered = prev.filter(i => i.id !== id);
      return [{ id, text, options }, ...filtered].slice(0, 10);
    });
  };

  const handleAddCombo = (combo: TextCombo) => {
    addTextComboGroup(canvas, combo.items);
    setRecentlyUsed(prev => {
      const filtered = prev.filter(i => i.id !== combo.id);
      return [{ id: combo.id, combo }, ...filtered].slice(0, 10);
    });
  };

  const scrollRecent = (dir: "left" | "right") => {
    recentScrollRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <div className="-mx-3 -mt-3 flex flex-col">
      {/* Category Filter - Restore default look */}
      <div className="border-b border-gray-100 bg-white">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2.5" style={{ scrollbarWidth: "none" }}>
          {TEXT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium transition-all ${
                selectedCategory === cat
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Used - Restore default look */}
      {recentlyUsed.length > 0 && (
        <div className="px-3 py-4 border-b border-gray-100 bg-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-700">Recently Used</span>
            <div className="flex gap-1">
              <button onClick={() => scrollRecent("left")} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={() => scrollRecent("right")} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
          <div
            ref={recentScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {recentlyUsed.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.combo ? handleAddCombo(item.combo) : handleAddText(item.text, item.options)}
                className="group relative flex h-14 w-28 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <span className="truncate text-[10px] font-bold text-gray-700">{item.combo ? "Combo" : item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 px-3 py-4 pb-10">
        {(selectedCategory === "All" || selectedCategory === "Basic") && (
          <div>
            <div className="mb-3 px-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Text Styles</h3>
            </div>
            <div className="flex flex-col gap-2">
              {TEXT_STYLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleAddText(s.text, { fontSize: s.fontSize, fontWeight: s.fontWeight })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 transition-colors text-center hover:border-blue-300 hover:bg-blue-50"
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
        )}

        {(selectedCategory === "All" || selectedCategory === "Combinations") && (
          <div>
            <div className="mb-3 px-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Combinations</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEXT_COMBOS.map((combo) => (
                <button
                  key={combo.id}
                  onClick={() => handleAddCombo(combo)}
                  className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-sm"
                  style={{ aspectRatio: `${combo.previewWidth} / ${combo.previewHeight}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={combo.previewSrc} alt={combo.id} className="h-full w-full object-cover transition-transform group-hover:scale-105" draggable={false} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
