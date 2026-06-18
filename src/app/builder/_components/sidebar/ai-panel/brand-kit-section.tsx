"use client";

import { useState } from "react";
import { LuPalette, LuSparkles, LuX, LuPen, LuPaintbrush, LuTrash2, LuPlus } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { BrandKit } from "@/lib/types";

interface BrandKitSectionProps {
  brandKits: BrandKit[];
  brandKitsLoading: boolean;
  useBrandKit: boolean;
  onToggleUseBrandKit: (val: boolean) => void;
  activeBrandKitId: string | null;
  onBrandKitSelect: (id: string | null) => void;
  onEditKit: (kit: BrandKit) => void;
  onRenameKit: (kitId: string, newName: string) => Promise<void>;
  onRemoveKit: (kitId: string) => Promise<void>;
  onAddCustomKit: () => void;
}

export function BrandKitSection({
  brandKits,
  brandKitsLoading,
  useBrandKit,
  onToggleUseBrandKit,
  activeBrandKitId,
  onBrandKitSelect,
  onEditKit,
  onRenameKit,
  onRemoveKit,
  onAddCustomKit,
}: BrandKitSectionProps) {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <LuPalette className="w-3.5 h-3.5 text-gray-400" />
          Brand Kit Presets
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400">
            {useBrandKit ? "Active" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={() => onToggleUseBrandKit(!useBrandKit)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              useBrandKit ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                useBrandKit ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Loading skeleton */}
        {brandKitsLoading && brandKits.length <= 2 && (
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl border border-gray-200 bg-gray-50/50 min-h-[100px] animate-pulse">
            <div className="w-full h-8 bg-gray-200 rounded-lg mb-2" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        )}

        {/* Brand kit cards */}
        {brandKits.map((kit) => {
          const isActive = useBrandKit && activeBrandKitId === kit.id;
          return (
            <div
              key={kit.id}
              onClick={() => {
                if (!useBrandKit) {
                  onToggleUseBrandKit(true);
                }
                onBrandKitSelect(kit.id);
              }}
              className={`group relative flex flex-col p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              } ${!useBrandKit ? "opacity-60 hover:opacity-100 grayscale-[20%]" : ""} ${
                activeMenuId === kit.id ? "z-50" : "z-10"
              }`}
            >
              {/* Top Row: Checkbox & Menu */}
              <div className="flex justify-between items-start w-full mb-2">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isActive ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                  }`}
                >
                  {isActive && <LuSparkles className="w-2.5 h-2.5 text-white" />}
                </div>

                <button
                  onClick={(e) => handleMenuToggle(e, kit.id)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors relative z-[51]"
                >
                  {activeMenuId === kit.id ? (
                    <LuX className="w-3.5 h-3.5 text-gray-600" />
                  ) : (
                    <BsThreeDotsVertical className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Context Menu Popup */}
                {activeMenuId === kit.id && (
                  <div className="absolute top-8 right-1 w-28 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in zoom-in-95 origin-top-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameStart(kit);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <LuPen className="w-3 h-3" /> Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditKit(kit);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <LuPaintbrush className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveKit(kit.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2.5 text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LuTrash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Center: Color Strip Preview */}
              <div className="flex w-full h-8 rounded-lg overflow-hidden mb-2 border border-gray-100">
                {(kit.colors.length > 0 ? kit.colors : ["#cccccc"]).map((c, i) => (
                  <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                ))}
              </div>

              {/* Bottom: Title with font or renaming input */}
              <div
                className="text-center w-full px-1"
                onClick={(e) => {
                  if (renamingKitId === kit.id) e.stopPropagation();
                }}
              >
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
                    className="w-full text-[11px] font-medium text-gray-700 bg-gray-50 border border-indigo-500 rounded px-1 text-center outline-none"
                  />
                ) : (
                  <p
                    className="text-[11px] font-medium text-gray-700 truncate"
                    style={{ fontFamily: kit.typography?.title ?? "inherit" }}
                  >
                    {kit.name}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Custom Brand Kit Card */}
        <div
          onClick={onAddCustomKit}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer min-h-[100px] ${
            !useBrandKit ? "opacity-60 hover:opacity-100" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2">
            <LuPlus className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase">Custom Kit</p>
        </div>
      </div>
    </div>
  );
}
