"use client";

import { useState } from "react";
import { LuChevronDown, LuCheck, LuChevronRight } from "react-icons/lu";
import type { BrandKit, BrandKitLayout, PaperSize } from "@/lib/types";
import type { PromptGeneratorSelections, SelectedElement, SelectedImage } from "../_shared/types";
import { TEMPLATE_SKILL_SETS } from "../_shared/types";
import { ALL_PAPER_OPTIONS } from "../../toolbar";
import {
  BUILDER_ELEMENT_SHAPES,
  BUILDER_ELEMENT_ICONS,
} from "@/lib/builder/decorative-assets";
import { DEFAULT_LAYOUTS } from "../ai-panel/brand-kit-modal/layouts-data";

interface PromptGeneratorLeftPanelProps {
  selections: PromptGeneratorSelections;
  onUpdateSelections: (updates: Partial<PromptGeneratorSelections>) => void;
  brandKits: BrandKit[];
  customLayouts: BrandKitLayout[];
}

const DEFAULT_ASSET_IMAGES = [
  { name: "Abstract Stripes", url: "/Images/ImageCards/abstract-stripes-qhd.jpg" },
  { name: "Alien Planet", url: "/Images/ImageCards/aien-planet-4k-gj-1366x768.jpg" },
  { name: "Blue Wave", url: "/Images/ImageCards/blue-abstract-wave-flow-minimalist-1k-1366x768.jpg" },
  { name: "Boat at Dawn", url: "/Images/ImageCards/boat-and-duck-in-the-calm-of-dawn-us-1366x768.jpg" },
  { name: "Balance", url: "/Images/ImageCards/balance-110850.jpg" },
  { name: "Lake Louise", url: "/Images/ImageCards/lake-louise-hamlet-in-canada-7g-1366x768.jpg" },
];

function DropdownSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-left"
      >
        <span className="text-xs font-semibold text-gray-700 truncate">
          {selected?.label || "None selected"}
        </span>
        <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] max-h-[200px] overflow-y-auto custom-scrollbar py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors hover:bg-gray-50 ${
                value === opt.value ? "bg-indigo-50/50" : ""
              }`}
            >
              <span className={`font-medium ${value === opt.value ? "text-indigo-700" : "text-gray-600"}`}>
                {opt.label}
              </span>
              {value === opt.value && <LuCheck className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  count,
}: {
  title: string;
  children: React.ReactNode;
  count: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors text-left"
      >
        <span className="text-xs font-bold text-gray-700">{title}</span>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
              {count} selected
            </span>
          )}
          <LuChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isOpen && <div className="p-3 border-t border-gray-100 bg-white max-h-[220px] overflow-y-auto custom-scrollbar">{children}</div>}
    </div>
  );
}

export function PromptGeneratorLeftPanel({
  selections,
  onUpdateSelections,
  brandKits,
  customLayouts,
}: PromptGeneratorLeftPanelProps) {
  const paperOptions = [
    { value: "", label: "Random / Let AI Decide" },
    ...ALL_PAPER_OPTIONS.filter((o) => o.value !== "CUSTOM").map((o) => ({
      value: o.value,
      label: o.label,
    })),
  ];

  const brandKitOptions = [
    { value: "", label: "None" },
    ...brandKits.map((k) => ({ value: k.id, label: k.name })),
  ];

  const layoutOptions = [
    { value: "", label: "None" },
    ...customLayouts.map((l) => ({ value: l.id, label: `${l.title ?? l.name} (Custom)` })),
    ...DEFAULT_LAYOUTS.map((l) => ({ value: l.id, label: l.name })),
  ];

  const skillSetOptions = [
    { value: "", label: "Random / Let AI Decide" },
    ...TEMPLATE_SKILL_SETS.map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ];

  const allElements = [
    ...BUILDER_ELEMENT_SHAPES.slice(0, 8),
    ...BUILDER_ELEMENT_ICONS.slice(0, 8),
  ];

  const handleToggleElement = (el: { url: string; label: string }) => {
    const exists = selections.elements.some((e) => e.url === el.url);
    const updated = exists
      ? selections.elements.filter((e) => e.url !== el.url)
      : [...selections.elements, el];
    onUpdateSelections({ elements: updated });
  };

  const handleToggleImage = (img: { name: string; url: string }) => {
    const exists = selections.images.some((i) => i.url === img.url);
    const updated = exists
      ? selections.images.filter((i) => i.url !== img.url)
      : [...selections.images, { url: img.url, name: img.name, isCustom: false }];
    onUpdateSelections({ images: updated });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-gray-800">Configure Design</h3>

      <DropdownSelect
        label="Brand Kit"
        value={selections.brandKit?.id ?? ""}
        options={brandKitOptions}
        onChange={(val) => {
          const kit = brandKits.find((k) => k.id === val) ?? null;
          onUpdateSelections({ brandKit: kit });
        }}
      />

      <DropdownSelect
        label="Layout"
        value={selections.layout?.id ?? ""}
        options={layoutOptions}
        onChange={(val) => {
          const layout =
            customLayouts.find((l) => l.id === val) ||
            DEFAULT_LAYOUTS.find((l) => l.id === val) ||
            null;
          onUpdateSelections({ layout });
        }}
      />

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          Asset Collections
        </label>
        
        <CollapsibleSection title="Elements & Icons" count={selections.elements.length}>
          <div className="grid grid-cols-4 gap-2">
            {allElements.map((el, idx) => {
              const isSelected = selections.elements.some((e) => e.url === el.url);
              return (
                <button
                   key={idx}
                   onClick={() => handleToggleElement(el)}
                   className={`relative p-1.5 rounded-xl border flex items-center justify-center aspect-square transition-all ${
                     isSelected
                       ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                       : "border-gray-200 bg-white hover:border-gray-300"
                   }`}
                   title={el.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={el.url} alt={el.label} className="w-8 h-8 object-contain" />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Images & Photos" count={selections.images.length}>
          <div className="grid grid-cols-3 gap-2">
            {DEFAULT_ASSET_IMAGES.map((img, idx) => {
              const isSelected = selections.images.some((i) => i.url === img.url);
              return (
                <button
                  key={idx}
                  onClick={() => handleToggleImage(img)}
                  className={`relative rounded-xl border overflow-hidden aspect-video transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  title={img.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-600/25 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
      </div>

      <DropdownSelect
        label="Canvas Size"
        value={selections.canvasSize ?? ""}
        options={paperOptions}
        onChange={(val) => onUpdateSelections({ canvasSize: val ? (val as PaperSize) : null })}
      />

      <DropdownSelect
        label="Template Skill Set"
        value={selections.templateSkillSet ?? ""}
        options={skillSetOptions}
        onChange={(val) => onUpdateSelections({ templateSkillSet: val ? val : null })}
      />

      {/* Selections summary */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Summary</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Elements</span>
            <span className="font-semibold text-gray-700">{selections.elements.length} selected</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Images</span>
            <span className="font-semibold text-gray-700">{selections.images.length} selected</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Brand Kit</span>
            <span className="font-semibold text-gray-700">{selections.brandKit?.name ?? "None"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Layout</span>
            <span className="font-semibold text-gray-700">{selections.layout?.title ?? selections.layout?.name ?? "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
