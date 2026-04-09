"use client";

import { addRect, addCircle, addTriangle, addLine, addSvgPath } from "@/lib/builder/fabric-utils";
import { ICONS, RIBBONS, type IconKey, type RibbonKey } from "@/lib/builder/decorative-assets";
import type { Canvas } from "fabric";

interface ElementsPanelProps {
  canvas: Canvas | null;
}

export function ElementsPanel({ canvas }: ElementsPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Shapes</h3>
        <div className="grid grid-cols-3 gap-2">
          <ShapeButton label="Rect" onClick={() => addRect(canvas, true)} icon="▬" />
          <ShapeButton label="Rect ○" onClick={() => addRect(canvas, false)} icon="▭" />
          <ShapeButton label="Circle" onClick={() => addCircle(canvas, true)} icon="●" />
          <ShapeButton label="Circle ○" onClick={() => addCircle(canvas, false)} icon="○" />
          <ShapeButton label="Triangle" onClick={() => addTriangle(canvas, true)} icon="▲" />
          <ShapeButton label="Tri ○" onClick={() => addTriangle(canvas, false)} icon="△" />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Lines</h3>
        <div className="grid grid-cols-2 gap-2">
          <ShapeButton label="Horizontal" onClick={() => addLine(canvas, true)} icon="—" />
          <ShapeButton label="Vertical" onClick={() => addLine(canvas, false)} icon="|" />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Icons</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ICONS) as IconKey[]).map((key) => (
            <ShapeButton key={key} label={ICONS[key].label} onClick={() => addSvgPath(canvas, ICONS[key].path, { fill: ICONS[key].fill })} icon="✦" />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Ribbons</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(RIBBONS) as RibbonKey[]).map((key) => (
            <ShapeButton key={key} label={RIBBONS[key].label} onClick={() => addSvgPath(canvas, RIBBONS[key].path, { fill: RIBBONS[key].fill, scale: 2 })} icon="⚑" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShapeButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-2 text-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-gray-600">{label}</span>
    </button>
  );
}
