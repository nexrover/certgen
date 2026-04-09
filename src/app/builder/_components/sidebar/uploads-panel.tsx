"use client";

import { useState, useCallback } from "react";
import { addImageFromUrl } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface UploadsPanelProps {
  canvas: Canvas | null;
}

export function UploadsPanel({ canvas }: UploadsPanelProps) {
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setImages((prev) => [{ url: data.data.url, name: file.name }, ...prev]);
        if (canvas) await addImageFromUrl(canvas, data.data.url);
      }
    } catch {
      // silently ignore
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [canvas]);

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Upload Images</h3>
      <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600">
        {uploading ? "Uploading…" : "Click to upload (PNG, JPG, SVG)"}
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleUpload} />
      </label>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => canvas && addImageFromUrl(canvas, img.url)}
              className="overflow-hidden rounded border border-gray-200 hover:border-indigo-400"
              title={img.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
