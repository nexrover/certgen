"use client";

import { useState, useRef } from "react";
import type { Canvas } from "fabric";
import { CanvaImportModal } from "../canva-import-modal";
import { LuFileText, LuLoader } from "react-icons/lu";
import { SiCanva } from "react-icons/si";

interface ImportPanelProps {
  canvas: Canvas | null;
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void | Promise<void>;
  onImportSuccess?: () => void;
}

export function ImportPanel({ canvas, onLoadTemplate, onImportSuccess }: ImportPanelProps) {
  const [isCanvaOpen, setIsCanvaOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfClick = () => {
    fileInputRef.current?.click();
  };

  const loadPdfJS = async () => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error("Failed to load PDF library."));
      document.head.appendChild(script);
    });
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPdfLoading(true);
    try {
      const pdfjsLib: any = await loadPdfJS();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      if (pdf.numPages < 1) {
        throw new Error("The selected PDF file has no pages.");
      }

      // Load first page
      const page = await pdf.getPage(1);
      
      // Render first page as high-res background image (2x scale for resolution)
      const viewport = page.getViewport({ scale: 2.0 });
      const offscreenCanvas = document.createElement("canvas");
      const ctx = offscreenCanvas.getContext("2d");
      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = offscreenCanvas.toDataURL("image/png");

      // Extract text layers
      const textContent = await page.getTextContent();
      const objects: any[] = [];

      // 1. Add background image layer
      objects.push({
        type: "Image",
        version: "7.0.0",
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        width: viewport.width,
        height: viewport.height,
        src: dataUrl,
        __isBackground: true,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
      });

      // 2. Add editable Textbox layers matching PDF text items
      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;

        const transform = item.transform;
        const pdfX = transform[4];
        const pdfY = transform[5];

        // Convert PDF coordinates to viewport coordinates
        const [vx, vy] = viewport.convertToViewportPoint(pdfX, pdfY + (item.height || 10));

        // Scale font size according to viewport scale
        const fontSize = Math.round(transform[3] * (viewport.scale / 1.33) * 0.95);
        const width = Math.round(item.width * viewport.scale * 1.05);

        objects.push({
          type: "Textbox",
          version: "7.0.0",
          originX: "left",
          originY: "top",
          left: Math.max(0, Math.round(vx)),
          top: Math.max(0, Math.round(vy)),
          width: Math.max(100, width),
          text: item.str,
          fontSize: Math.max(10, fontSize),
          fontFamily: "Arial",
          fill: "#000000",
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });
      }

      const canvasJson = {
        version: "7.0.0",
        objects,
        background: "#ffffff",
      };

      // Load into canvas
      onLoadTemplate({
        canvasJson,
        paperSize: "CUSTOM",
        width: viewport.width,
        height: viewport.height,
      });

    } catch (err: any) {
      console.error("PDF Parsing Error:", err);
      alert(err.message || "Failed to parse PDF certificate.");
    } finally {
      setIsPdfLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Import Template</h2>
        <p className="text-xs text-gray-500 mt-1">
          Import and edit certificates from Canva or PDF documents.
        </p>
      </div>

      <div className="space-y-4">
        {/* Canva Card */}
        <button
          onClick={() => setIsCanvaOpen(true)}
          disabled={isPdfLoading}
          className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 hover:from-indigo-50 hover:to-purple-50 hover:shadow-md transition-all cursor-pointer group disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#00C4CC] to-[#7D2AE8] text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
            <SiCanva className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
              Import from Canva
            </h3>
            <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
              Import designs using template links.
            </p>
          </div>
        </button>

        {/* PDF Card */}
        <button
          onClick={handlePdfClick}
          disabled={isPdfLoading}
          className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/40 to-orange-50/40 hover:from-rose-50 hover:to-orange-50 hover:shadow-md transition-all cursor-pointer group disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md shadow-rose-200 transition-transform group-hover:scale-105">
            {isPdfLoading ? (
              <LuLoader className="w-6 h-6 animate-spin" />
            ) : (
              <LuFileText className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 group-hover:text-rose-600 transition-colors">
              {isPdfLoading ? "Parsing PDF..." : "Import from PDF"}
            </h3>
            <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
              {isPdfLoading ? "Extracting editable elements..." : "Upload PDF to import pages."}
            </p>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfFileChange}
          className="hidden"
        />
      </div>

      {/* Canva Modal */}
      <CanvaImportModal
        open={isCanvaOpen}
        onClose={() => setIsCanvaOpen(false)}
        onLoadTemplate={onLoadTemplate}
        onImportSuccess={onImportSuccess}
      />
    </div>
  );
}
