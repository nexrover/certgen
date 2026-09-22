"use client";

import { useState } from "react";
import { LuUpload, LuTrash2, LuLoader } from "react-icons/lu";
import type { BrandKit } from "@/lib/types";

interface LogoTabProps {
  editingBrandKit: BrandKit | null;
  onUpdateLogos: (logos: string[]) => void;
}

export function LogoTab({ editingBrandKit, onUpdateLogos }: LogoTabProps) {
  const [uploading, setUploading] = useState(false);

  if (!editingBrandKit) return null;
  const logos = editingBrandKit.logos || [];

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
        onUpdateLogos([...logos, data.data.url]);
      } else {
        alert(data.error || "Failed to upload logo.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload logo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onUpdateLogos(logos.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Logos</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Upload Button Box */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 p-6 text-center hover:bg-indigo-50/40 transition-colors h-40">
          {uploading ? (
            <LuLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          ) : (
            <LuUpload className="w-8 h-8 text-indigo-500 mb-2" />
          )}
          <span className="text-xs font-semibold text-gray-700 mt-1">
            {uploading ? "Uploading..." : "Upload Logo"}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG (Max 5MB)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {logos.map((logoUrl, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-center border border-gray-200 bg-white rounded-2xl p-4 h-40 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={`Logo ${index + 1}`} className="max-h-full max-w-full object-contain" />
            
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all shadow-sm"
              title="Remove Logo"
            >
              <LuTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {logos.length === 0 && !uploading && (
        <div className="text-center py-6 text-xs text-gray-400">
          No logos uploaded for this brand kit yet.
        </div>
      )}
    </div>
  );
}
