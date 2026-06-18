"use client";

import { useState } from "react";
import { LuSearch, LuX, LuPlus, LuTrash2, LuCheck } from "react-icons/lu";
import { DEFAULT_PALETTES, type ColorPalette } from "@/lib/color-converter";
import { ColorPalettePopup } from "./color-palette-popup";
import type { BrandKit } from "@/lib/types";

interface ColorPaletteTabProps {
  editingBrandKit: BrandKit | null;
  onUpdateColors: (colors: string[]) => void;
  customPalettes: ColorPalette[];
  onAddCustomPalette: (newPalette: ColorPalette) => void;
  onDeleteCustomPalette: (paletteId: string) => void;
}

export function ColorPaletteTab({
  editingBrandKit,
  onUpdateColors,
  customPalettes,
  onAddCustomPalette,
  onDeleteCustomPalette,
}: ColorPaletteTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);

  const query = searchQuery.toLowerCase().trim();

  const filteredDefault = DEFAULT_PALETTES.filter((p) => {
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.colors.some((c) => c.toLowerCase().includes(query))
    );
  });

  const filteredCustom = customPalettes.filter((p) => {
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.colors.some((c) => c.toLowerCase().includes(query))
    );
  });

  const handleDeleteCustomPalette = (e: React.MouseEvent, paletteId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this custom color palette?")) return;
    onDeleteCustomPalette(paletteId);
  };

  const renderPaletteCard = (palette: ColorPalette, isCustom: boolean) => {
    const isSelected =
      editingBrandKit &&
      editingBrandKit.colors.length === palette.colors.length &&
      editingBrandKit.colors.every(
        (c, idx) => c.toLowerCase() === palette.colors[idx].toLowerCase()
      );

    return (
      <div
        key={palette.id}
        onClick={() => onUpdateColors(palette.colors)}
        className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isSelected
            ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/20 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        {/* Selection & Delete icons */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors pointer-events-auto ${
              isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
            }`}
          >
            {isSelected && <LuCheck className="w-2.5 h-2.5 text-white" />}
          </div>
          {isCustom && (
            <button
              type="button"
              onClick={(e) => handleDeleteCustomPalette(e, palette.id)}
              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
              title="Delete Custom Palette"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Color Blocks */}
        <div className="flex w-full h-8 rounded-lg overflow-hidden mt-6 mb-2.5 border border-gray-100 shadow-inner">
          {palette.colors.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 h-full hover:scale-110 transition-transform duration-150"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Title */}
        <p className="text-[11px] font-semibold text-gray-700 text-center truncate px-1">
          {palette.name}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Search Header Row */}
      <div className="flex justify-between items-center border-b pb-3 gap-4">
        <h3 className="text-lg font-bold text-gray-800">Color Palette</h3>
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search palettes or colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pl-8 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-600"
          />
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-6 custom-scrollbar">
        {/* Custom Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            My color palette
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Create Palette Card */}
            <div
              onClick={() => setIsColorPopupOpen(true)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-indigo-50/20 hover:border-indigo-400 transition-all duration-200 cursor-pointer min-h-[105px]"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                <LuPlus className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Add Palette
              </p>
            </div>

            {/* Custom Palettes */}
            {filteredCustom.map((palette) => renderPaletteCard(palette, true))}
          </div>
          {query && filteredCustom.length === 0 && (
            <p className="text-[11px] text-gray-400 mt-2 italic pl-1">
              No custom palettes match &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Default Section */}
        <div className="border-t border-gray-150 pt-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Default
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {filteredDefault.map((palette) => renderPaletteCard(palette, false))}
          </div>
          {filteredDefault.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center italic">
              No default palettes match &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </div>

      {isColorPopupOpen && (
        <ColorPalettePopup
          onClose={() => setIsColorPopupOpen(false)}
          onSave={(newPalette) => {
            onAddCustomPalette(newPalette);
            setIsColorPopupOpen(false);
          }}
        />
      )}
    </div>
  );
}
