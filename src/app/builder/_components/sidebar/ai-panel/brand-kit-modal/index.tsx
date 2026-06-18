"use client";

import { useState } from "react";
import { LuX, LuPalette, LuImage, LuType, LuShapes, LuImagePlus, LuSticker, LuLayoutGrid } from "react-icons/lu";
import type { BrandKit } from "@/lib/types";
import type { ColorPalette } from "@/lib/color-converter";
import { LayoutTab } from "./layout-tab";
import { ColorPaletteTab } from "./color-palette-tab";
import { LogoTab } from "./logo-tab";
import { TypographyTab } from "./typography-tab";
import { GraphicsTab } from "./graphics-tab";
import { PhotosTab } from "./photos-tab";
import { ElementsTab } from "./elements-tab";

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrandKit: BrandKit | null;
  onUpdateEditingBrandKit: (updated: BrandKit) => void;
  customPalettes: ColorPalette[];
  onAddCustomPalette: (newPalette: ColorPalette) => void;
  onDeleteCustomPalette: (paletteId: string) => void;
  onSave: () => void;
}

const TABS = [
  { name: "Layout", icon: LuLayoutGrid },
  { name: "Color Palette", icon: LuPalette },
  { name: "Logo", icon: LuImage },
  { name: "Typography", icon: LuType },
  { name: "Graphics", icon: LuShapes },
  { name: "Photos", icon: LuImagePlus },
  { name: "Elements", icon: LuSticker },
];

export function BrandKitModal({
  isOpen,
  onClose,
  editingBrandKit,
  onUpdateEditingBrandKit,
  customPalettes,
  onAddCustomPalette,
  onDeleteCustomPalette,
  onSave,
}: BrandKitModalProps) {
  const [modalTab, setModalTab] = useState("Layout");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[80vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={editingBrandKit?.name ?? ""}
              onChange={(e) => {
                if (editingBrandKit) {
                  onUpdateEditingBrandKit({ ...editingBrandKit, name: e.target.value });
                }
              }}
              placeholder="Brand Kit Name"
              className="text-xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 rounded transition-colors bg-transparent w-full max-w-md"
            />
            <p className="text-xs text-gray-500 mt-1">Customize your brand colors, fonts, and assets</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Two-panel architecture */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Navigation Tabs */}
          <div className="w-64 border-r border-gray-100 bg-gray-50 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setModalTab(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  modalTab === tab.name
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Right Panel: Dynamic Details View */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
            {modalTab === "Layout" && (
              <LayoutTab
                editingBrandKit={editingBrandKit}
                onChange={onUpdateEditingBrandKit}
              />
            )}
            {modalTab === "Color Palette" && (
              <ColorPaletteTab
                editingBrandKit={editingBrandKit}
                onUpdateColors={(colors) => {
                  if (editingBrandKit) {
                    onUpdateEditingBrandKit({ ...editingBrandKit, colors });
                  }
                }}
                customPalettes={customPalettes}
                onAddCustomPalette={onAddCustomPalette}
                onDeleteCustomPalette={onDeleteCustomPalette}
              />
            )}
            {modalTab === "Logo" && <LogoTab />}
            {modalTab === "Typography" && (
              <TypographyTab
                editingBrandKit={editingBrandKit}
                onChange={onUpdateEditingBrandKit}
              />
            )}
            {modalTab === "Graphics" && <GraphicsTab />}
            {modalTab === "Photos" && <PhotosTab />}
            {modalTab === "Elements" && <ElementsTab />}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
