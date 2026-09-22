"use client";

import { useState, useRef } from "react";
import { LuUpload, LuEllipsis, LuInfo, LuDownload, LuTrash2, LuChevronLeft } from "react-icons/lu";
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

const ELEMENT_CATEGORIES = ["All", "Shapes", "Icons", "Ribbons", "Bases", "Lines"];

function ElementSection({ title, items, onAdd }: { title: string; items: { url: string; label: string }[]; onAdd: (url: string, label: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? items : items.slice(0, 6);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        {items.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {displayedItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onAdd(item.url, item.label)}
            className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-2 transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm"
          >
            <div className="flex h-14 w-full items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.label}
                className="h-full w-full object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-medium text-gray-500 mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ElementsPanel({ canvas }: ElementsPanelProps) {
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentlyUsed, setRecentlyUsed] = useState<{ url: string; label: string }[]>([]);
  const [customElements, setCustomElements] = useState<{ url: string; label: string }[]>([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const recentScrollRef = useRef<HTMLDivElement>(null);

  const handleAddElement = (url: string, label: string) => {
    if (canvas) addSvgFromUrl(canvas, url);
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      return [{ url, label }, ...filtered].slice(0, 10);
    });
  };

  const handleUploadCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCustomElements((prev) => [{ url, label: file.name }, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDownloadElement = (url: string, label: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = label;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getDataUrlSize = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1];
    if (!base64) return 0;
    return Math.round((base64.length * 3) / 4);
  };

  const scrollRecent = (dir: "left" | "right") => {
    recentScrollRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-3 shrink-0">
        <button
          onClick={() => setActiveTab("default")}
          className={`px-3 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === "default"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Default Assets
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-3 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === "custom"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Custom Uploads
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {activeTab === "default" ? (
          <>
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-3" style={{ scrollbarWidth: "none" }}>
              {ELEMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                    selectedCategory === cat
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recently Used */}
            {recentlyUsed.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-700">Recently Used</span>
                  <div className="flex gap-1">
                    <button onClick={() => scrollRecent("left")} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button onClick={() => scrollRecent("right")} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                </div>
                <div
                  ref={recentScrollRef}
                  className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {recentlyUsed.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddElement(item.url, item.label)}
                      className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.label} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Element Sections */}
            <div className="flex flex-col gap-5 pb-4">
              {(selectedCategory === "All" || selectedCategory === "Shapes") && (
                <ElementSection title="Shapes" items={BUILDER_ELEMENT_SHAPES} onAdd={handleAddElement} />
              )}
              {(selectedCategory === "All" || selectedCategory === "Lines") && (
                <div>
                  <div className="mb-3 px-1">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lines</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => canvas && addLine(canvas, true)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-blue-400 hover:bg-blue-50/50"
                    >
                      <span className="text-xl font-light">―</span>
                      <span className="text-[10px] text-gray-400">Horizontal</span>
                    </button>
                    <button
                      onClick={() => canvas && addLine(canvas, false)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white p-2.5 transition-all hover:border-blue-400 hover:bg-blue-50/50"
                    >
                      <span className="text-xl font-light rotate-90">―</span>
                      <span className="text-[10px] text-gray-400">Vertical</span>
                    </button>
                  </div>
                </div>
              )}
              {(selectedCategory === "All" || selectedCategory === "Icons") && (
                <ElementSection title="Icons" items={BUILDER_ELEMENT_ICONS} onAdd={handleAddElement} />
              )}
              {(selectedCategory === "All" || selectedCategory === "Ribbons") && (
                <ElementSection title="Ribbons" items={BUILDER_ELEMENT_RIBBONS} onAdd={handleAddElement} />
              )}
              {(selectedCategory === "All" || selectedCategory === "Bases") && (
                <ElementSection title="Bases & Frames" items={BUILDER_ELEMENT_BASES} onAdd={handleAddElement} />
              )}
            </div>
          </>
        ) : (
          /* Custom Uploads Tab */
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-xs text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600">
              <LuUpload className="w-4 h-4 mr-2" />
              Upload SVG or Image
              <input type="file" accept="image/svg+xml,image/png,image/jpeg" className="hidden" onChange={handleUploadCustom} />
            </label>

            {customElements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs font-semibold text-gray-500">No custom elements yet</p>
                <p className="text-[10px] text-gray-400 mt-1">Upload SVGs or images to use</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {customElements.map((item, idx) => (
                  <div key={idx} className={`group relative ${activeMenuIndex === idx ? 'z-50' : 'z-10'}`}>
                    <button
                      onClick={() => handleAddElement(item.url, item.label)}
                      className="block h-full w-full overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-400"
                      title={item.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.label} className="h-20 w-full object-cover" />
                    </button>

                    <div className={`absolute right-1 top-1 transition-opacity ${activeMenuIndex === idx ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100 z-10'}`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (activeMenuIndex !== idx) setShowDetails(false);
                          setActiveMenuIndex(activeMenuIndex === idx ? null : idx);
                        }}
                        className="rounded-md bg-[#6F42C1] p-1 text-white hover:bg-[#5a3e85] shadow-sm"
                      >
                        <LuEllipsis className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {activeMenuIndex === idx && (
                      <div
                        className={`absolute ${idx % 2 === 0 ? 'left-0' : 'right-0'} top-8 z-[9999] w-56 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden text-left`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!showDetails ? (
                          <>
                            <div className="px-3 py-2.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-gray-900 truncate pr-2">{item.label}</h4>
                              </div>
                              <p className="mt-0.5 text-[10px] text-gray-500">
                                {formatBytes(getDataUrlSize(item.url))}
                              </p>
                            </div>
                            <div className="border-t border-gray-100 py-1">
                              <button onClick={() => setShowDetails(true)} className="flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <LuInfo className="mr-2 h-3.5 w-3.5" />
                                Details
                              </button>
                              <button onClick={() => { handleDownloadElement(item.url, item.label); setActiveMenuIndex(null); setShowDetails(false); }} className="flex w-full items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                <LuDownload className="mr-2 h-3.5 w-3.5" />
                                Download
                              </button>
                              <button
                                onClick={() => {
                                  setCustomElements((prev) => prev.filter((_, i) => i !== idx));
                                  setActiveMenuIndex(null);
                                  setShowDetails(false);
                                }}
                                className="flex w-full items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                              >
                                <LuTrash2 className="mr-2 h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-2.5 border-b border-gray-100 flex items-center bg-gray-50/50">
                              <button onClick={() => setShowDetails(false)} className="mr-2 text-gray-500 hover:text-gray-900 transition-colors">
                                <LuChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <h4 className="text-xs font-semibold text-gray-900">Element Details</h4>
                            </div>
                            <div className="px-3 py-3 space-y-3 text-xs text-gray-700">
                              <div>
                                <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Name</span>
                                <span className="font-medium text-gray-900 break-all">{item.label}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Size</span>
                                <span className="font-medium text-gray-900">{formatBytes(getDataUrlSize(item.url))}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">Type</span>
                                <span className="font-medium text-gray-900">{item.label.endsWith('.svg') ? 'SVG Image' : 'Raster Image'}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
