"use client";

import { useState, useCallback, useEffect } from "react";
import { addImageFromUrl } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";
import { Loader2, MoreHorizontal, Trash2, Download, Info, Pencil } from "lucide-react";

interface UploadedImage {
  url: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "Unknown";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  // Example "1 year ago" format placeholder - we'll just show the local string for now
  // or a basic "uploaded on X" text. The UI image shows "Uploaded by whole uses 1 year ago"
  return d.toLocaleDateString();
}

interface UploadsPanelProps {
  canvas: Canvas | null;
}

export function UploadsPanel({ canvas }: UploadsPanelProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

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
        const generatedName = data.data.path?.split("/").pop() || file.name;
        setImages((prev) => [
          { url: data.data.url, name: generatedName, created_at: new Date().toISOString() },
          ...prev,
        ]);
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

      {/* Invisible fixed overlay to catch outside clicks for the dropdown */}
      {activeMenuIndex !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenuIndex(null)}
        />
      )}

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
                    setActiveMenuIndex(activeMenuIndex === i ? null : i);
                  }}
                  className="rounded-md bg-[#6F42C1] p-1 text-white hover:bg-[#5a3e85] shadow-sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                
                {activeMenuIndex === i && (
                  <div 
                    className="absolute right-0 top-9 z-[9999] w-64 rounded-xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                          {img.name}
                        </h4>
                        <Pencil className="h-3.5 w-3.5 text-gray-500 flex-shrink-0 cursor-pointer" />
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Uploaded by you on {formatDate(img.updated_at || img.created_at)}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 py-1">
                      <button className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Info className="mr-3 h-4 w-4" />
                        Details
                      </button>
                      <button 
                        onClick={() => {
                          handleDownload(img.url, img.name);
                          setActiveMenuIndex(null);
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="mr-3 h-4 w-4" />
                        Download
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/uploads?name=${encodeURIComponent(img.name)}`, { method: "DELETE" });
                            const data = await res.json();
                            if (data.success) {
                              setImages((prev) => prev.filter((_, idx) => idx !== i));
                              setActiveMenuIndex(null);
                            }
                          } catch (err) {
                            console.error("Failed to delete image", err);
                          }
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Remove
                      </button>
                    </div>
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
