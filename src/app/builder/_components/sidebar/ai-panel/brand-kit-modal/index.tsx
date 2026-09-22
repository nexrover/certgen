"use client";

import { useState } from "react";
import { LuX, LuPalette, LuImage, LuType, LuPlus, LuPen, LuPaintbrush, LuTrash2, LuSparkles } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { BrandKit } from "@/lib/types";
import type { ColorPalette } from "@/lib/color-converter";
import { ColorPaletteTab } from "./color-palette-tab";
import { LogoTab } from "./logo-tab";
import { TypographyTab } from "./typography-tab";

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKits: BrandKit[];
  brandKitsLoading: boolean;
  useBrandKit: boolean;
  onToggleUseBrandKit: (val: boolean) => void;
  activeBrandKitId: string | null;
  onBrandKitSelect: (id: string | null) => void;
  
  editingBrandKit: BrandKit | null;
  onUpdateEditingBrandKit: (updated: BrandKit) => void;
  onEditKit: (kit: BrandKit) => void;
  onAddCustomKit: () => void;
  onRenameKit: (kitId: string, name: string) => Promise<void>;
  onRemoveKit: (kitId: string) => Promise<void>;
  
  customPalettes: ColorPalette[];
  onAddCustomPalette: (newPalette: ColorPalette) => void;
  onDeleteCustomPalette: (paletteId: string) => void;
  onSave: () => void;
}

type BrandKitModalView = "default-brands" | "custom-brands";

const CONTENT_TABS = [
  { name: "Color Palette", icon: LuPalette },
  { name: "Typography", icon: LuType },
  { name: "Logo", icon: LuImage },
];

export function BrandKitModal({
  isOpen,
  onClose,
  brandKits,
  brandKitsLoading,
  useBrandKit,
  onToggleUseBrandKit,
  activeBrandKitId,
  onBrandKitSelect,
  editingBrandKit,
  onUpdateEditingBrandKit,
  onEditKit,
  onAddCustomKit,
  onRenameKit,
  onRemoveKit,
  customPalettes,
  onAddCustomPalette,
  onDeleteCustomPalette,
  onSave,
}: BrandKitModalProps) {
  const [activeView, setActiveView] = useState<BrandKitModalView>("custom-brands");
  const [contentTab, setContentTab] = useState("Color Palette");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingKitId, setRenamingKitId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");

  if (!isOpen) return null;

  const isEditing = editingBrandKit !== null;

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleRenameStart = (kit: BrandKit) => {
    setRenamingKitId(kit.id);
    setRenamingName(kit.name);
    setActiveMenuId(null);
  };

  const handleRenameSaveLocal = async (kitId: string) => {
    if (!renamingName.trim()) {
      setRenamingKitId(null);
      return;
    }
    await onRenameKit(kitId, renamingName.trim());
    setRenamingKitId(null);
  };

  const displayedKits = brandKits.filter((kit) => {
    const isDefault = kit.id.startsWith("default-");
    return activeView === "default-brands" ? isDefault : !isDefault;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[80vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex-1 mr-4">
            {isEditing ? (
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
            ) : (
              <h2 className="text-xl font-bold text-gray-800">Brand Kit Library</h2>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isEditing ? "Customize your brand colors, fonts, and assets" : "Choose or create a brand identity to style your designs"}
            </p>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                onUpdateEditingBrandKit(null as any);
              } else {
                onClose();
              }
            }}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {isEditing ? (
          /* Editor Interface (Colors, Typography, Logos) */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Sub-tab Navigation */}
            <div className="flex gap-1 px-6 pt-4">
              {CONTENT_TABS.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setContentTab(tab.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    contentTab === tab.name
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              {contentTab === "Color Palette" && (
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
              {contentTab === "Typography" && (
                <TypographyTab
                  editingBrandKit={editingBrandKit}
                  onChange={onUpdateEditingBrandKit}
                />
              )}
              {contentTab === "Logo" && (
                <LogoTab
                  editingBrandKit={editingBrandKit}
                  onUpdateLogos={(logos) => {
                    if (editingBrandKit) {
                      onUpdateEditingBrandKit({ ...editingBrandKit, logos });
                    }
                  }}
                />
              )}
            </div>

            {/* Editor Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => onUpdateEditingBrandKit(null as any)}
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
        ) : (
          /* Brand Library List Interface (Default vs Custom tabs) */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top tab Navigation */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
              <button
                onClick={() => setActiveView("default-brands")}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
                  activeView === "default-brands"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Default Brands
              </button>
              <button
                onClick={() => setActiveView("custom-brands")}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
                  activeView === "custom-brands"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                My Custom Brands
              </button>
            </div>

            {/* List of Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
              {brandKitsLoading && displayedKits.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 mb-2" />
                  <p className="text-xs text-gray-400">Loading brand kits...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* brand kits grid */}
                  {displayedKits.map((kit) => {
                    const isActive = useBrandKit && activeBrandKitId === kit.id;
                    const isDefault = kit.id.startsWith("default-");
                    return (
                      <div
                        key={kit.id}
                        onClick={() => {
                          if (!useBrandKit) {
                            onToggleUseBrandKit(true);
                          }
                          onBrandKitSelect(kit.id);
                        }}
                        className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Top: Active status & menu toggle */}
                        <div className="flex justify-between items-start w-full mb-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isActive ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                            }`}
                          >
                            {isActive && <LuSparkles className="w-3 h-3 text-white" />}
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => handleMenuToggle(e, kit.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {activeMenuId === kit.id ? (
                                <LuX className="w-4 h-4 text-gray-600" />
                              ) : (
                                <BsThreeDotsVertical className="w-4 h-4" />
                              )}
                            </button>

                            {activeMenuId === kit.id && (
                              <div className="absolute top-8 right-0 w-28 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in zoom-in-95 origin-top-right">
                                {isDefault ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditKit(kit);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                  >
                                    <LuPaintbrush className="w-3.5 h-3.5" /> Customize
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRenameStart(kit);
                                      }}
                                      className="w-full text-left px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                      <LuPen className="w-3.5 h-3.5" /> Rename
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditKit(kit);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                      <LuPaintbrush className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveKit(kit.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                      <LuTrash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Colors Preview */}
                        <div className="flex w-full h-10 rounded-xl overflow-hidden mb-3 border border-gray-100">
                          {(kit.colors.length > 0 ? kit.colors : ["#cccccc"]).map((c, i) => (
                            <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>

                        {/* Title & typography preview */}
                        <div className="text-center w-full px-1">
                          {renamingKitId === kit.id ? (
                            <input
                              type="text"
                              value={renamingName}
                              onChange={(e) => setRenamingName(e.target.value)}
                              onBlur={() => handleRenameSaveLocal(kit.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSaveLocal(kit.id);
                                if (e.key === "Escape") setRenamingKitId(null);
                              }}
                              autoFocus
                              className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-indigo-500 rounded px-1 py-0.5 text-center outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p
                              className="text-xs font-semibold text-gray-800 truncate"
                              style={{ fontFamily: kit.typography?.title ?? "inherit" }}
                            >
                              {kit.name}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add custom brand kit card */}
                  {activeView === "custom-brands" && (
                    <div
                      onClick={onAddCustomKit}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                        <LuPlus className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Create Custom Kit</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Library Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors"
              >
                Close Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
