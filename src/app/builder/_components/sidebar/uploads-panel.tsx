"use client";

import { useState, useCallback, useEffect } from "react";
import { addImageFromUrl } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

interface UploadsPanelProps {
  canvas: Canvas | null;
}

export function UploadsPanel({ canvas }: UploadsPanelProps) {
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuIndex(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/uploads");
        const data = await res.json();
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Failed to load images", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

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
        const generatedName = data.data.path?.split('/').pop() || file.name;
        setImages((prev) => [{ url: data.data.url, name: generatedName }, ...prev]);
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

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <div key={i} className="group relative">
              <button
                onClick={() => canvas && addImageFromUrl(canvas, img.url)}
                className="block h-full w-full overflow-hidden rounded border border-gray-200 hover:border-indigo-400"
                title={img.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="h-16 w-full object-cover" />
              </button>
              
              <div className={`absolute right-1 top-1 transition-opacity ${activeMenuIndex === i ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100 z-10'}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.nativeEvent) {
                      e.nativeEvent.stopImmediatePropagation();
                    }
                    setActiveMenuIndex(activeMenuIndex === i ? null : i);
                  }}
                  className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                
                {activeMenuIndex === i && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(`/api/uploads?name=${encodeURIComponent(img.name)}`, { method: "DELETE" });
                          const data = await res.json();
                          if (data.success) {
                            setImages((prev) => prev.filter((_, idx) => idx !== i));
                          }
                        } catch (err) {
                          console.error("Failed to delete image", err);
                        } finally {
                          setActiveMenuIndex(null);
                        }
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
