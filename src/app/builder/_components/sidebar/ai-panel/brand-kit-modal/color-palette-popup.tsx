"use client";

import { useState } from "react";
import { LuPalette, LuX, LuPlus } from "react-icons/lu";
import ModernColorPicker from "@/components/ui/modern-color-picker";
import type { ColorPalette } from "@/lib/color-converter";

interface ColorPalettePopupProps {
  onClose: () => void;
  onSave: (newPalette: ColorPalette) => void;
}

export function ColorPalettePopup({ onClose, onSave }: ColorPalettePopupProps) {
  const [popupPaletteName, setPopupPaletteName] = useState("My Custom Palette");
  const [popupColors, setPopupColors] = useState<string[]>([
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1"
  ]);
  const [selectedPopupColorIndex, setSelectedPopupColorIndex] = useState(0);

  const handleSave = () => {
    if (!popupPaletteName.trim()) {
      alert("Palette name is required");
      return;
    }
    const newPalette: ColorPalette = {
      id: "custom-palette-" + Date.now(),
      name: popupPaletteName.trim(),
      colors: popupColors,
    };
    onSave(newPalette);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <LuPalette className="w-4 h-4 text-indigo-600" />
            Create Custom Palette
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-3 space-y-2.5">
          {/* Palette Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Palette Name
            </label>
            <input
              type="text"
              value={popupPaletteName}
              onChange={(e) => setPopupPaletteName(e.target.value)}
              placeholder="e.g. Electric Teal"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-700"
            />
          </div>

          {/* Swatch Strip Builder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
              <span>Palette Colors ({popupColors.length}/10)</span>
              <span className="text-[9px] text-gray-400 font-normal normal-case">
                Click swatch to edit
              </span>
            </label>
            <div className="flex flex-wrap gap-2 items-center p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl">
              {popupColors.map((color, idx) => {
                const isEditing = idx === selectedPopupColorIndex;
                return (
                  <div key={idx} className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPopupColorIndex(idx);
                      }}
                      className={`w-8 h-8 rounded-lg border-2 shadow-sm transition-all ${
                        isEditing
                          ? "border-indigo-600 ring-2 ring-indigo-600/20 scale-105"
                          : "border-white hover:scale-105 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    {popupColors.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newColors = popupColors.filter((_, i) => i !== idx);
                          setPopupColors(newColors);
                          const newIdx =
                            selectedPopupColorIndex >= newColors.length
                              ? Math.max(0, newColors.length - 1)
                              : selectedPopupColorIndex;
                          setSelectedPopupColorIndex(newIdx);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-650"
                        title="Delete color"
                      >
                        <LuX className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Color Swatch Button */}
              {popupColors.length < 10 && (
                <button
                  type="button"
                  onClick={() => {
                    const newColor = "#6366F1";
                    const updated = [...popupColors, newColor];
                    setPopupColors(updated);
                    setSelectedPopupColorIndex(updated.length - 1);
                  }}
                  className="w-8 h-8 rounded-lg border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 flex items-center justify-center transition-all group"
                  title="Add color swatch"
                >
                  <LuPlus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </button>
              )}
            </div>
          </div>

          {/* Modern Color Picker */}
          <ModernColorPicker
            key={selectedPopupColorIndex}
            initialColor={popupColors[selectedPopupColorIndex]}
            onChange={(hex) => {
              const updated = [...popupColors];
              updated[selectedPopupColorIndex] = hex;
              setPopupColors(updated);
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
