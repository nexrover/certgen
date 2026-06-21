"use client";

import { useState } from "react";
import { LuPlus, LuPen, LuPaintbrush, LuTrash2, LuSparkles } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { BrandKit } from "@/lib/types";
import type { ColorPalette } from "@/lib/color-converter";
import type { ModalId } from "./_shared/types";

interface BrandKitPanelProps {
  brandKits: BrandKit[];
  brandKitsLoading: boolean;
  useBrandKit: boolean;
  onToggleUseBrandKit: (val: boolean) => void;
  activeBrandKitId: string | null;
  onBrandKitSelect: (id: string | null) => void;
  onOpenModal: (id: ModalId) => void;
  onAddCustomKit: () => void;
  onEditKit: (kit: BrandKit) => void;
  onRenameKit: (kitId: string, name: string) => Promise<void>;
  onRemoveKit: (kitId: string) => Promise<void>;
}

type BrandKitPanelView = "default-brands" | "custom-brands";

export function BrandKitPanel({
  brandKits,
  brandKitsLoading,
  useBrandKit,
  onToggleUseBrandKit,
  activeBrandKitId,
  onBrandKitSelect,
  onOpenModal,
  onAddCustomKit,
  onEditKit,
  onRenameKit,
  onRemoveKit,
}: BrandKitPanelProps) {
  const [activeView, setActiveView] = useState<BrandKitPanelView>("custom-brands");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingKitId, setRenamingKitId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");

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

  const handleCustomizeClick = (kit: BrandKit) => {
    onEditKit(kit);
    onOpenModal("brand-kit");
    setActiveMenuId(null);
  };

  const handleCreateCustomKit = () => {
    onAddCustomKit();
    onOpenModal("brand-kit");
  };

  const displayedKits = brandKits.filter((kit) => {
    const isDefault = kit.id.startsWith("default-");
    return activeView === "default-brands" ? isDefault : !isDefault;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-3 shrink-0">
        <button
          onClick={() => setActiveView("default-brands")}
          className={`px-3 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeView === "default-brands"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Default Brands
        </button>
        <button
          onClick={() => setActiveView("custom-brands")}
          className={`px-3 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeView === "custom-brands"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Custom Brands
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {brandKitsLoading && displayedKits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 mb-2" />
            <p className="text-[10px] text-gray-400">Loading brand kits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Brand kit cards */}
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
                  className={`group relative flex flex-col p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Top: Active status & menu toggle */}
                  <div className="flex justify-between items-start w-full mb-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isActive ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                      }`}
                    >
                      {isActive && <LuSparkles className="w-2.5 h-2.5 text-white" />}
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuToggle(e, kit.id)}
                        className="p-0.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <BsThreeDotsVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === kit.id && (
                        <div className="absolute top-6 right-0 w-24 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in zoom-in-95 origin-top-right">
                          {isDefault ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCustomizeClick(kit);
                              }}
                              className="w-full text-left px-2.5 py-2 text-[10px] text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                            >
                              <LuPaintbrush className="w-3 h-3" /> Customize
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameStart(kit);
                                }}
                                className="w-full text-left px-2.5 py-2 text-[10px] text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                              >
                                <LuPen className="w-3 h-3" /> Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCustomizeClick(kit);
                                }}
                                className="w-full text-left px-2.5 py-2 text-[10px] text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                              >
                                <LuPaintbrush className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveKit(kit.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-2 text-[10px] text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                              >
                                <LuTrash2 className="w-3 h-3" /> Remove
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colors Preview */}
                  <div className="flex w-full h-7 rounded-lg overflow-hidden mb-2 border border-gray-100">
                    {(kit.colors.length > 0 ? kit.colors : ["#cccccc"]).map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>

                  {/* Title */}
                  <div className="text-center w-full px-0.5">
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
                        className="w-full text-[10px] font-semibold text-gray-800 bg-gray-50 border border-indigo-500 rounded px-1 py-0.5 text-center outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p
                        className="text-[10px] font-semibold text-gray-800 truncate"
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
                onClick={handleCreateCustomKit}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer min-h-[120px]"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-1.5">
                  <LuPlus className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Create Custom Kit</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
