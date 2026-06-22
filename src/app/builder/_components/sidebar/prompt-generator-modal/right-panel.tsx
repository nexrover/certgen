"use client";

import { useRef, useState } from "react";
import {
  LuLayoutGrid,
  LuPalette,
  LuShapes,
  LuImage,
  LuRuler,
  LuChevronLeft,
  LuChevronRight,
  LuX,
  LuCheck,
  LuUpload,
} from "react-icons/lu";
import type { BrandKit, BrandKitLayout, PaperSize } from "@/lib/types";
import type { PromptGeneratorSelections, SelectedElement, SelectedImage } from "../_shared/types";
import { TEMPLATE_SKILL_SETS } from "../_shared/types";
import { ALL_PAPER_OPTIONS } from "../../toolbar";
import {
  BUILDER_ELEMENT_SHAPES,
  BUILDER_ELEMENT_ICONS,
  BUILDER_ELEMENT_RIBBONS,
  BUILDER_ELEMENT_BASES,
} from "@/lib/builder/decorative-assets";
import { DEFAULT_LAYOUTS } from "../ai-panel/brand-kit-modal/layouts-data";
import { RAW_PAPER_OPTIONS } from "../../toolbar";

interface PromptGeneratorRightPanelProps {
  selections: PromptGeneratorSelections;
  onUpdateSelections: (updates: Partial<PromptGeneratorSelections>) => void;
  brandKits: BrandKit[];
  customLayouts: BrandKitLayout[];
}

const DEFAULT_ASSET_IMAGES = [
  { name: "Abstract Stripes", url: "/Images/ImageCards/abstract-stripes-qhd.jpg" },
  { name: "Alien Planet", url: "/Images/ImageCards/aien-planet-4k-gj-1366x768.jpg" },
  { name: "Backtrack Linux", url: "/Images/ImageCards/backtrack-linux-h8.jpg" },
  { name: "Balance", url: "/Images/ImageCards/balance-110850.jpg" },
  { name: "Blue Wave", url: "/Images/ImageCards/blue-abstract-wave-flow-minimalist-1k-1366x768.jpg" },
  { name: "Boat at Dawn", url: "/Images/ImageCards/boat-and-duck-in-the-calm-of-dawn-us-1366x768.jpg" },
  { name: "Buttermere Lake", url: "/Images/ImageCards/buttermere-7051403_1920.jpg" },
  { name: "Couple in Love", url: "/Images/ImageCards/couple-in-love-lu_copy.jpg" },
  { name: "Couple Silhouette", url: "/Images/ImageCards/couple-silhouette-art-5k-8a.jpg" },
  { name: "Eid Celebration", url: "/Images/ImageCards/eid-8683303_1280.png" },
  { name: "Emerald Lake", url: "/Images/ImageCards/emerald-lake-landscape-mountains-5k-la-1366x768.jpg" },
  { name: "Fisherman Mist", url: "/Images/ImageCards/fisherman-on-the-misty-lake-qhd-1366x768.jpg" },
  { name: "Fog Lake Duck", url: "/Images/ImageCards/fog-lake-duck-evening-4k-pl-1366x768.jpg" },
  { name: "Geometry Print", url: "/Images/ImageCards/geometry-print-4k-gj-1366x768.jpg" },
  { name: "Iceland Rocks", url: "/Images/ImageCards/iceland-rocks-dawn-black-sand-zb-1366x768.jpg" },
  { name: "Island Moon", url: "/Images/ImageCards/island-sky-moon-tree-5q-1366x768.jpg" },
  { name: "Jupiter Dark", url: "/Images/ImageCards/jupiter-dark-5k-sx-1366x768.jpg" },
  { name: "Lake Louise", url: "/Images/ImageCards/lake-louise-hamlet-in-canada-7g-1366x768.jpg" },
  { name: "Leather Texture", url: "/Images/ImageCards/leather-texture-blue-4k-si-1366x768.jpg" },
  { name: "Parrot Security", url: "/Images/ImageCards/parrot-security-linux-debian-img-1920x1080.jpg" },
];

type ActiveModal = "brandKit" | "layout" | "elements" | "images" | "canvasSize" | "templateSkill" | null;

function getDisplayDims(sizeValue: string): string {
  const found = RAW_PAPER_OPTIONS.find((o) => o.value === sizeValue);
  return found?.displayDims ?? "";
}

function getSkillsetLabel(value: string): string {
  return TEMPLATE_SKILL_SETS.find((s) => s.value === value)?.label ?? value;
}

export function PromptGeneratorRightPanel({
  selections,
  onUpdateSelections,
  brandKits,
  customLayouts,
}: PromptGeneratorRightPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth",
      });
    }
  };

  const handleCloseModal = () => setActiveModal(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Active Selections</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-750 transition-colors shadow-sm"
            title="Scroll Left"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-750 transition-colors shadow-sm"
            title="Scroll Right"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Card 1: Brand Kit */}
        <button
          type="button"
          onClick={() => setActiveModal("brandKit")}
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
            selections.brandKit
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60 hover:opacity-100"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuPalette className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Brand Kit</p>
            <p className={`text-xs font-bold truncate ${selections.brandKit ? "text-gray-800" : "text-gray-400"}`}>
              {selections.brandKit?.name ?? "Not selected"}
            </p>
          </div>
          <div>
            {selections.brandKit ? (
              <div className="flex gap-1 border border-gray-100 rounded-lg p-1.5 bg-gray-50/50">
                {selections.brandKit.colors.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Click to choose a brand kit</p>
            )}
          </div>
        </button>

        {/* Card 2: Layout */}
        <button
          type="button"
          onClick={() => setActiveModal("layout")}
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
            selections.layout
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60 hover:opacity-100"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuLayoutGrid className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Layout</p>
            <p className={`text-xs font-bold truncate ${selections.layout ? "text-gray-800" : "text-gray-400"}`}>
              {selections.layout?.title ?? selections.layout?.name ?? "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 line-clamp-2">
              {selections.layout?.description ?? "Click to choose layout guidelines"}
            </p>
          </div>
        </button>

        {/* Card 3: Elements */}
        <button
          type="button"
          onClick={() => setActiveModal("elements")}
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
            selections.elements.length > 0
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60 hover:opacity-100"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuShapes className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Elements</p>
            <p className={`text-xs font-bold truncate ${selections.elements.length > 0 ? "text-gray-800" : "text-gray-400"}`}>
              {selections.elements.length > 0 ? `${selections.elements.length} Selected` : "Not selected"}
            </p>
          </div>
          <div>
            {selections.elements.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {selections.elements.slice(0, 4).map((el, i) => (
                  <div key={i} className="w-7 h-7 rounded-lg border border-gray-150 bg-white p-1 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={el.url} alt={el.label} className="w-full h-full object-contain" />
                  </div>
                ))}
                {selections.elements.length > 4 && (
                  <div className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 flex items-center justify-center shrink-0 select-none">
                    +{selections.elements.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Click to add design elements</p>
            )}
          </div>
        </button>

        {/* Card 4: Images */}
        <button
          type="button"
          onClick={() => setActiveModal("images")}
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
            selections.images.length > 0
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60 hover:opacity-100"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuImage className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Images</p>
            <p className={`text-xs font-bold truncate ${selections.images.length > 0 ? "text-gray-800" : "text-gray-400"}`}>
              {selections.images.length > 0 ? `${selections.images.length} Selected` : "Not selected"}
            </p>
          </div>
          <div>
            {selections.images.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {selections.images.slice(0, 3).map((img, i) => (
                  <div key={i} className="w-9 h-7 rounded-lg border border-gray-150 bg-white overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {selections.images.length > 3 && (
                  <div className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 flex items-center justify-center shrink-0 select-none">
                    +{selections.images.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Click to add asset images</p>
            )}
          </div>
        </button>

        {/* Card 5: Canvas Size */}
        <button
          type="button"
          onClick={() => setActiveModal("canvasSize")}
          className="shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02]"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuRuler className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Canvas Size</p>
            <p className="text-xs font-bold text-gray-800 truncate">
              {selections.canvasSize.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            {getDisplayDims(selections.canvasSize) ? (
              <p className="text-[10px] text-gray-500 font-medium">{getDisplayDims(selections.canvasSize)} px</p>
            ) : (
              <p className="text-[10px] text-gray-400">Click to change size</p>
            )}
          </div>
        </button>

        {/* Card 6: Template Skill Set */}
        <button
          type="button"
          onClick={() => setActiveModal("templateSkill")}
          className="shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 cursor-pointer hover:shadow-lg hover:scale-[1.02] border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuLayoutGrid className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Template Type</p>
            <p className="text-xs font-bold text-gray-800 truncate">
              {getSkillsetLabel(selections.templateSkillSet)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-medium">Click to change type</p>
          </div>
        </button>
      </div>

      {/* ── Sub-Modals ────────────────────────────────────────── */}
      {activeModal === "brandKit" && (
        <BrandKitSelectionModal
          brandKits={brandKits}
          selectedKitId={selections.brandKit?.id ?? null}
          onSelect={(kit) => {
            onUpdateSelections({ brandKit: kit });
            handleCloseModal();
          }}
          onClear={() => {
            onUpdateSelections({ brandKit: null });
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === "layout" && (
        <LayoutSelectionModal
          customLayouts={customLayouts}
          selectedLayoutId={selections.layout?.id ?? null}
          onSelect={(layout) => {
            onUpdateSelections({ layout });
            handleCloseModal();
          }}
          onClear={() => {
            onUpdateSelections({ layout: null });
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === "elements" && (
        <ElementsSelectionModal
          selectedElements={selections.elements}
          onToggle={(el) => {
            const exists = selections.elements.some((e) => e.url === el.url);
            const updated = exists
              ? selections.elements.filter((e) => e.url !== el.url)
              : [...selections.elements, el];
            onUpdateSelections({ elements: updated });
          }}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === "images" && (
        <ImagesSelectionModal
          selectedImages={selections.images}
          onToggle={(img) => {
            const exists = selections.images.some((i) => i.url === img.url);
            const updated = exists
              ? selections.images.filter((i) => i.url !== img.url)
              : [...selections.images, { url: img.url, name: img.name, isCustom: false }];
            onUpdateSelections({ images: updated });
          }}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === "canvasSize" && (
        <CanvasSizeSelectionModal
          selectedSize={selections.canvasSize}
          onSelect={(size) => {
            onUpdateSelections({ canvasSize: size });
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}

      {activeModal === "templateSkill" && (
        <TemplateSkillSelectionModal
          selectedValue={selections.templateSkillSet}
          onSelect={(val) => {
            onUpdateSelections({ templateSkillSet: val });
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Brand Kit Selection Modal
   ═══════════════════════════════════════════════════════════════ */
function BrandKitSelectionModal({
  brandKits,
  selectedKitId,
  onSelect,
  onClear,
  onClose,
}: {
  brandKits: BrandKit[];
  selectedKitId: string | null;
  onSelect: (kit: BrandKit) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [activeView, setActiveView] = useState<"default" | "custom">("default");

  const defaultKits = brandKits.filter((k) => k.id.startsWith("default-"));
  const customKits = brandKits.filter((k) => !k.id.startsWith("default-"));
  const displayedKits = activeView === "default" ? defaultKits : customKits;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuPalette className="w-5 h-5 text-violet-600" />
              Select Brand Kit
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose a brand identity for your design</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => setActiveView("default")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeView === "default"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Default Brands ({defaultKits.length})
          </button>
          <button
            onClick={() => setActiveView("custom")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeView === "custom"
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Custom Brands ({customKits.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {selectedKitId && (
            <button
              onClick={onClear}
              className="mb-4 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              Clear Selection
            </button>
          )}

          {displayedKits.length === 0 ? (
            <div className="text-center py-12">
              <LuPalette className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                {activeView === "default" ? "No default brand kits" : "No custom brand kits yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeView === "default" ? "Default kits are not available" : "Create a brand kit to see it here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayedKits.map((kit) => {
                const isSelected = selectedKitId === kit.id;
                return (
                  <button
                    key={kit.id}
                    onClick={() => onSelect(kit)}
                    className={`group relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                      isSelected
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 shadow-lg ring-2 ring-indigo-200"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                        <LuCheck className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <div className="flex w-full h-8 rounded-lg overflow-hidden mb-3 border border-gray-100">
                      {(kit.colors.length > 0 ? kit.colors : ["#cccccc"]).map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                      {kit.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Layout Selection Modal
   ═══════════════════════════════════════════════════════════════ */

function LayoutPreview({ layout }: { layout: BrandKitLayout }) {
  const posMap: Record<string, { x: number; y: number }> = {
    "top-left": { x: 8, y: 6 },
    "top-center": { x: 38, y: 6 },
    "top-center-large": { x: 25, y: 4 },
    "top-center-spanning": { x: 20, y: 4 },
    "top-center-above-heading": { x: 38, y: 2 },
    "top-center-below-heading": { x: 30, y: 18 },
    "top-right": { x: 68, y: 6 },
    "top-left-large": { x: 4, y: 4 },
    "top-left-below-heading": { x: 4, y: 18 },
    "top-banner-center": { x: 30, y: 4 },
    "top-banner-left": { x: 4, y: 4 },
    "top-banner-right": { x: 72, y: 4 },
    "center-left": { x: 8, y: 36 },
    center: { x: 30, y: 36 },
    "center-right": { x: 62, y: 36 },
    "center-upper": { x: 30, y: 26 },
    "center-full-width": { x: 10, y: 30 },
    "upper-center": { x: 30, y: 24 },
    "middle-center": { x: 30, y: 38 },
    "left-top": { x: 4, y: 6 },
    "left-center": { x: 4, y: 36 },
    "left-bottom": { x: 4, y: 62 },
    "left-center-heading": { x: 4, y: 32 },
    "left-below-heading": { x: 4, y: 44 },
    "right-top": { x: 62, y: 6 },
    "right-center": { x: 62, y: 36 },
    "right-bottom": { x: 62, y: 62 },
    "right-half-diagonal": { x: 55, y: 20 },
    "right-large": { x: 52, y: 12 },
    "right-column-full-height": { x: 62, y: 10 },
    "below-banner-center": { x: 30, y: 18 },
    "bottom-left": { x: 8, y: 62 },
    "bottom-center": { x: 38, y: 62 },
    "bottom-center-above-heading": { x: 30, y: 54 },
    "bottom-right": { x: 68, y: 62 },
    "bottom-center-inside-frame": { x: 38, y: 62 },
    "center-bottom-inside-frame": { x: 38, y: 62 },
    "center-top-inside-frame": { x: 38, y: 8 },
    "center-below-subtitle": { x: 30, y: 46 },
    "full-background": { x: 0, y: 0 },
    "card-top-center": { x: 28, y: 18 },
    "card-center": { x: 28, y: 36 },
    "card-top-left": { x: 18, y: 18 },
    "card-bottom-center": { x: 28, y: 56 },
    "grid-cells": { x: 10, y: 30 },
    "top-half": { x: 10, y: 10 },
  };

  const getPos = (key: string) => posMap[key] ?? { x: 40, y: 40 };

  const h = getPos(layout.headingPosition);
  const s = getPos(layout.subtitlePosition);
  const l = getPos(layout.logoPosition);
  const img = getPos(layout.imagePosition);
  const ic = getPos(layout.iconPosition);

  return (
    <svg viewBox="0 0 90 78" className="w-full h-full" aria-hidden>
      <rect x="0" y="0" width="90" height="78" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />

      {layout.imagePosition === "full-background" ? (
        <rect x="2" y="2" width="86" height="74" rx="2" fill="#dbeafe" opacity="0.4" />
      ) : layout.imagePosition === "right-column-full-height" ? (
        <rect x={img.x} y={img.y} width="24" height="58" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "right-large" ? (
        <rect x={img.x} y={img.y} width="34" height="50" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "top-half" ? (
        <rect x={img.x} y={img.y} width="70" height="28" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "grid-cells" ? (
        <>
          <rect x="8" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
          <rect x="34" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
          <rect x="60" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
        </>
      ) : (
        <rect x={img.x} y={img.y} width="28" height="18" rx="2" fill="#dbeafe" opacity="0.6" />
      )}

      <rect x={h.x} y={h.y} width={layout.headingPosition.includes("large") ? 40 : 26} height="4" rx="1" fill="#6366f1" />
      <rect x={s.x} y={s.y} width={20} height="2.5" rx="0.8" fill="#a5b4fc" />
      <rect x={l.x} y={l.y} width="8" height="8" rx="2" fill="#f59e0b" opacity="0.7" />
      <circle cx={ic.x + 2} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
      <circle cx={ic.x + 9} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
    </svg>
  );
}

function LayoutSelectionModal({
  customLayouts,
  selectedLayoutId,
  onSelect,
  onClear,
  onClose,
}: {
  customLayouts: BrandKitLayout[];
  selectedLayoutId: string | null;
  onSelect: (layout: BrandKitLayout) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const displayedLayouts = activeTab === "default" ? DEFAULT_LAYOUTS : customLayouts;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[75vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuLayoutGrid className="w-5 h-5 text-indigo-600" />
              Select Layout
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose a layout to guide element positioning</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => setActiveTab("default")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "default"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Default Layouts ({DEFAULT_LAYOUTS.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "custom"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Custom Layouts ({customLayouts.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {selectedLayoutId && (
            <button
              onClick={onClear}
              className="mb-4 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              Clear Selection
            </button>
          )}

          {displayedLayouts.length === 0 ? (
            <div className="text-center py-12">
              <LuLayoutGrid className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                {activeTab === "default" ? "No default layouts" : "No custom layouts yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === "default" ? "Default layouts are not available" : "Create a custom layout to see it here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {displayedLayouts.map((layout) => {
                const isSelected = selectedLayoutId === layout.id;
                return (
                  <button
                    key={layout.id}
                    onClick={() => onSelect(layout)}
                    className={`group relative flex flex-col rounded-2xl border-2 p-2.5 transition-all duration-200 text-left hover:shadow-lg ${
                      isSelected
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 shadow-lg ring-2 ring-indigo-200"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                        <LuCheck className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2">
                      <LayoutPreview layout={layout} />
                    </div>
                    <p className={`text-[11px] font-bold leading-tight ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                      {layout.title ?? layout.name}
                    </p>
                    <p className="text-[9px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
                      {layout.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6366f1" }} />
              Heading
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#a5b4fc" }} />
              Subtitle
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
              Logo
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#dbeafe" }} />
              Image
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
              Icons
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Elements Selection Modal
   ═══════════════════════════════════════════════════════════════ */
function ElementsSelectionModal({
  selectedElements,
  onToggle,
  onClose,
}: {
  selectedElements: SelectedElement[];
  onToggle: (el: SelectedElement) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Shapes", "Icons", "Ribbons", "Bases"];

  const defaultElements = [...BUILDER_ELEMENT_SHAPES, ...BUILDER_ELEMENT_ICONS, ...BUILDER_ELEMENT_RIBBONS, ...BUILDER_ELEMENT_BASES];

  const filteredElements = defaultElements.filter((el) => {
    if (category === "All") return true;
    if (category === "Shapes") return BUILDER_ELEMENT_SHAPES.some((s) => s.url === el.url);
    if (category === "Icons") return BUILDER_ELEMENT_ICONS.some((s) => s.url === el.url);
    if (category === "Ribbons") return BUILDER_ELEMENT_RIBBONS.some((s) => s.url === el.url);
    if (category === "Bases") return BUILDER_ELEMENT_BASES.some((s) => s.url === el.url);
    return true;
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuShapes className="w-5 h-5 text-emerald-600" />
              Select Elements
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedElements.length} element{selectedElements.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs: Default / Custom */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => { setActiveTab("default"); setCategory("All"); }}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "default"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Default Elements ({defaultElements.length})
          </button>
          <button
            onClick={() => { setActiveTab("custom"); setCategory("All"); }}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "custom"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Uploaded Elements
          </button>
        </div>

        {/* Category Filters (only for default tab) */}
        {activeTab === "default" && (
          <div className="px-6 pt-3 pb-1">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    category === cat
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === "default" ? (
            <div className="grid grid-cols-4 gap-2">
              {filteredElements.map((el, idx) => {
                const isSelected = selectedElements.some((e) => e.url === el.url);
                return (
                  <button
                    key={idx}
                    onClick={() => onToggle(el)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center aspect-square transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    title={el.label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={el.url} alt={el.label} className="w-8 h-8 object-contain" />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                        ✓
                      </span>
                    )}
                    <span className="text-[8px] text-gray-400 mt-1 truncate w-full text-center">{el.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom / Uploaded Elements - empty state for now */
            <div className="text-center py-12">
              <LuUpload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">No uploaded elements yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload custom SVGs or images from the Elements sidebar</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
          >
            Done ({selectedElements.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Images Selection Modal
   ═══════════════════════════════════════════════════════════════ */
function ImagesSelectionModal({
  selectedImages,
  onToggle,
  onClose,
}: {
  selectedImages: SelectedImage[];
  onToggle: (img: { name: string; url: string }) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (data.success && data.data?.url) {
        const name = data.data.path?.split("/").pop() || file.name;
        setUploadedImages((prev) => [{ url: data.data.url, name }, ...prev]);
      }
    } catch {
      // silently ignore
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const displayedImages = activeTab === "default" ? DEFAULT_ASSET_IMAGES : uploadedImages;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[75vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuImage className="w-5 h-5 text-amber-600" />
              Select Images
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => setActiveTab("default")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "default"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Default Images ({DEFAULT_ASSET_IMAGES.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "custom"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Uploaded Images ({uploadedImages.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === "custom" && (
            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-amber-400 hover:text-amber-600 mb-4">
              <LuUpload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Click to upload image (PNG, JPG, SVG)"}
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleUpload} />
            </label>
          )}

          {displayedImages.length === 0 ? (
            <div className="text-center py-12">
              <LuImage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                {activeTab === "default" ? "No default images" : "No uploaded images yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activeTab === "default" ? "Default images are not available" : "Upload images to see them here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {displayedImages.map((img, idx) => {
                const isSelected = selectedImages.some((i) => i.url === img.url);
                return (
                  <button
                    key={idx}
                    onClick={() => onToggle(img)}
                    className={`relative rounded-xl border overflow-hidden aspect-video transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    title={img.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          ✓
                        </span>
                      </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[9px] font-medium text-white truncate">
                      {img.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-colors"
          >
            Done ({selectedImages.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Canvas Size Selection Modal
   ═══════════════════════════════════════════════════════════════ */
function CanvasSizeSelectionModal({
  selectedSize,
  onSelect,
  onClose,
}: {
  selectedSize: PaperSize;
  onSelect: (size: PaperSize) => void;
  onClose: () => void;
}) {
  const paperOptions = ALL_PAPER_OPTIONS.filter((o) => o.value !== "CUSTOM");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuRuler className="w-5 h-5 text-rose-600" />
              Select Canvas Size
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose your target dimensions</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-2">
            {paperOptions.map((opt) => {
              const isSelected = selectedSize === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSelect(opt.value as PaperSize)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-semibold ${isSelected ? "text-rose-700" : "text-gray-700"}`}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {opt.displayDims} px{opt.dpi ? ` · ${opt.dpi}` : ""}
                    </span>
                  </div>
                  {isSelected && <LuCheck className="w-4 h-4 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Template Skill Selection Modal
   ═══════════════════════════════════════════════════════════════ */
function TemplateSkillSelectionModal({
  selectedValue,
  onSelect,
  onClose,
}: {
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md max-h-[70vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <LuLayoutGrid className="w-5 h-5 text-cyan-600" />
              Select Template Type
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose the type of template to generate</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-2">
            {TEMPLATE_SKILL_SETS.map((skill) => {
              const isSelected = selectedValue === skill.value;
              return (
                <button
                  key={skill.value}
                  onClick={() => onSelect(skill.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? "text-cyan-700" : "text-gray-700"}`}>
                    {skill.label}
                  </span>
                  {isSelected && <LuCheck className="w-4 h-4 text-cyan-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
