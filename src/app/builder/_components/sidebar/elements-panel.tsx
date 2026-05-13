"use client";

import { useState, useRef, useCallback } from "react";
import { addLine, addSvgFromUrl } from "@/lib/builder/fabric-utils";
import {
  BUILDER_ELEMENT_ICONS,
  BUILDER_ELEMENT_SHAPES,
  BUILDER_ELEMENT_RIBBONS,
  BUILDER_ELEMENT_BASES,
} from "@/lib/builder/decorative-assets";
import type { Canvas } from "fabric";

interface ElementsPanelProps {
  canvas: Canvas | null;
}

const ELEMENT_CATEGORIES = ["All", "Shapes", "Icons", "Ribbons", "Bases", "Lines"];

export function ElementsPanel({ canvas }: ElementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentlyUsed, setRecentlyUsed] = useState<{ url: string; label: string }[]>([]);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  const handleAddElement = (url: string, label: string) => {
    addSvgFromUrl(canvas, url);
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      return [{ url, label }, ...filtered].slice(0, 10);
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
          {ELEMENT_CATEGORIES.map((cat) => (
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

      {/* Recently Used Section - Restore default look */}
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
                onClick={() => handleAddElement(item.url, item.label)}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 transition-all hover:border-blue-300 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.label} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 px-3 py-4 pb-10">
        {(selectedCategory === "All" || selectedCategory === "Shapes") && (
          <ElementSection title="Shapes" items={BUILDER_ELEMENT_SHAPES} onAdd={handleAddElement} />
        )}

        {(selectedCategory === "All" || selectedCategory === "Lines") && (
          <div>
            <div className="mb-3 px-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lines</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addLine(canvas, true)}
                className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-400 hover:bg-blue-50/50"
              >
                <span className="text-xl font-light">―</span>
                <span className="text-[10px] text-gray-400">Horizontal</span>
              </button>
              <button
                onClick={() => addLine(canvas, false)}
                className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-400 hover:bg-blue-50/50"
              >
                <span className="text-xl font-light rotate-90">―</span>
                <span className="text-[10px] text-gray-400">Vertical</span>
              </button>
            </div>
          </div>
        )}

        {(selectedCategory === "All" || selectedCategory === "Icons") && (
          <ElementSection title="Icons" items={BUILDER_ELEMENT_ICONS} onAdd={handleAddElement} />
        )}

        {(selectedCategory === "All" || selectedCategory === "Ribbons") && (
          <ElementSection title="Ribbons" items={BUILDER_ELEMENT_RIBBONS} onAdd={handleAddElement} />
        )}

        {(selectedCategory === "All" || selectedCategory === "Bases") && (
          <ElementSection title="Bases & Frames" items={BUILDER_ELEMENT_BASES} onAdd={handleAddElement} />
        )}
      </div>
    </div>
  );
}

function ElementSection({ title, items, onAdd }: { title: string; items: { url: string; label: string }[]; onAdd: (url: string, label: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? items : items.slice(0, 6);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        {items.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {displayedItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onAdd(item.url, item.label)}
            className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm"
          >
            <div className="flex h-16 w-full items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.label}
                className="h-full w-full object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-medium text-gray-500 mt-2">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
