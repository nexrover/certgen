"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { LuX, LuLink, LuArrowRight, LuTriangleAlert, LuLoader } from "react-icons/lu";
import { SiCanva } from "react-icons/si";

interface CanvaImportModalProps {
  open: boolean;
  onClose: () => void;
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void | Promise<void>;
  onImportSuccess?: () => void;
}

function getImageDimensionsFromDataUrl(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("Failed to read imported image dimensions."));
    img.src = dataUrl;
  });
}

function buildCanvaImportCanvasJson(
  dataUrl: string,
  width: number,
  height: number
): Record<string, unknown> {
  const textWidth = Math.min(400, Math.round(width * 0.5));
  const textLeft = Math.round((width - textWidth) / 2);
  const textTop = Math.round(height * 0.42);

  return {
    version: "7.0.0",
    objects: [
      {
        type: "Image",
        version: "7.0.0",
        name: "Canva Design",
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        width,
        height,
        scaleX: 1,
        scaleY: 1,
        src: dataUrl,
        __isBackground: true,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
      },
      {
        type: "Textbox",
        version: "7.0.0",
        name: "Text Layer",
        originX: "left",
        originY: "top",
        left: textLeft,
        top: textTop,
        width: textWidth,
        text: "Your text here",
        fontSize: Math.max(18, Math.round(width * 0.04)),
        fontFamily: "Arial",
        fill: "#111827",
        textAlign: "center",
        selectable: true,
        editable: true,
        hasControls: true,
        hasBorders: true,
      },
    ],
    background: "#ffffff",
  };
}

export function CanvaImportModal({
  open,
  onClose,
  onLoadTemplate,
  onImportSuccess,
}: CanvaImportModalProps) {
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isImporting) return;

    setIsImporting(true);
    setError("");

    try {
      const res = await fetch("/api/import/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.success && data.dataUrl) {
        const imageDims = await getImageDimensionsFromDataUrl(data.dataUrl);
        const width = imageDims.width || data.width;
        const height = imageDims.height || data.height;

        if (!width || !height) {
          throw new Error("Could not determine imported design dimensions.");
        }

        await onLoadTemplate({
          canvasJson: buildCanvaImportCanvasJson(data.dataUrl, width, height),
          paperSize: "CUSTOM",
          width,
          height,
        });

        onImportSuccess?.();
        onClose();
        setUrl("");
      } else {
        setError(data.error || "Failed to import template. Please verify the URL is public.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while connecting to the import server.";
      setError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300"
      onClick={isImporting ? undefined : onClose}
    >
      <div
        className="relative flex w-full max-w-[550px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isImporting && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-[#00C4CC] to-[#7D2AE8] text-white shadow-lg">
              <LuLoader className="h-7 w-7 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Importing your design</p>
              <p className="mt-1 text-xs text-gray-500">Fetching from Canva and preparing layers…</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-[#00C4CC] to-[#7D2AE8] text-white shadow-md shadow-cyan-100">
              <SiCanva className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import from Canva</h2>
              <p className="text-xs text-gray-500">Import a public design as editable layers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            <LuX className="text-xl transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-cyan-100/80 bg-linear-to-br from-cyan-50/60 to-purple-50/60 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-900">
              How to get a public link
            </h3>
            <ol className="space-y-3 text-xs font-medium text-gray-800">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-[10px] font-bold text-cyan-800">
                  1
                </span>
                <span>
                  Open your design in Canva and click <strong>Share</strong> at the top-right.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-[10px] font-bold text-cyan-800">
                  2
                </span>
                <span>
                  Set access to <strong>Anyone with the link</strong> and permission to{" "}
                  <strong>Can view</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-[10px] font-bold text-cyan-800">
                  3
                </span>
                <span>
                  Copy the link and paste it below. Short links like{" "}
                  <code className="rounded bg-cyan-100/80 px-1 py-0.5 font-mono text-[11px] font-bold text-cyan-900">
                    canva.link/...
                  </code>{" "}
                  are supported.
                </span>
              </li>
            </ol>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Canva Public Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  disabled={isImporting}
                  placeholder="https://canva.link/... or https://www.canva.com/design/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition-all placeholder:text-gray-300 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-60"
                />
                <LuLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-medium leading-relaxed text-rose-700">
                <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImporting || !url.trim()}
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#00C4CC] to-[#7D2AE8] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-100 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <LuLoader className="h-4 w-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    Import Design
                    <LuArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
