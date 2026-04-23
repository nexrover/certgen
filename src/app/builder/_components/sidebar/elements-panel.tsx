"use client";

import { useState } from "react";
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

export function ElementsPanel({ canvas }: ElementsPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="space-y-8 pb-10">
      <ElementSection title="Shapes" items={BUILDER_ELEMENT_SHAPES} canvas={canvas} />

      <div>
        <div className="mb-3 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Lines</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addLine(canvas, true)}
            className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-indigo-400 hover:bg-indigo-50/50"
          >
            <span className="text-xl font-light">―</span>
            <span className="text-[10px] text-gray-400">Horizontal</span>
          </button>
          <button
            onClick={() => addLine(canvas, false)}
            className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-indigo-400 hover:bg-indigo-50/50"
          >
            <span className="text-xl font-light rotate-90">―</span>
            <span className="text-[10px] text-gray-400">Vertical</span>
          </button>
        </div>
      </div>

      <ElementSection title="Icons" items={BUILDER_ELEMENT_ICONS} canvas={canvas} />
      <ElementSection title="Ribbons" items={BUILDER_ELEMENT_RIBBONS} canvas={canvas} />
      <ElementSection title="Bases & Frames" items={BUILDER_ELEMENT_BASES} canvas={canvas} />
    </div>
  );
}

function ElementSection({ title, items, canvas }: { title: string; items: { url: string; label: string }[]; canvas: Canvas }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? items : items.slice(0, 6);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        {items.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {displayedItems.map((item, idx) => (
          <ElementButton key={idx} url={item.url} label={item.label} onClick={() => addSvgFromUrl(canvas, item.url)} />
        ))}
      </div>
    </div>
  );
}

function ElementButton({ url, label, onClick }: { url: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-sm"
    >
      <div className="flex h-16 w-full items-center justify-center p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="h-full w-full object-contain transition-transform group-hover:scale-110"
        />
      </div>
      <span className="w-full truncate text-center text-[10px] font-medium text-gray-500 mt-2">{label}</span>
    </button>
  );
}
