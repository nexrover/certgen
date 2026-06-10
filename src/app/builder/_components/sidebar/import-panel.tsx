"use client";

import { useState } from "react";
import type { Canvas } from "fabric";
import { CanvaImportModal } from "../canva-import-modal";
import { LuFilePlus, LuFileText } from "react-icons/lu";
import { SiCanva } from "react-icons/si";

interface ImportPanelProps {
  canvas: Canvas | null;
}

export function ImportPanel({ canvas }: ImportPanelProps) {
  const [isCanvaOpen, setIsCanvaOpen] = useState(false);

  const handlePdfClick = () => {
    // For now we just display alert as requested to focus on UI first
    alert("PDF upload/import feature will be connected in the next step!");
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
          className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 hover:from-indigo-50 hover:to-purple-50 hover:shadow-md transition-all cursor-pointer group"
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
          className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/40 to-orange-50/40 hover:from-rose-50 hover:to-orange-50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md shadow-rose-200 transition-transform group-hover:scale-105">
            <LuFileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 group-hover:text-rose-600 transition-colors">
              Import from PDF
            </h3>
            <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
              Upload PDF to import pages.
            </p>
          </div>
        </button>
      </div>

      {/* Canva Modal */}
      <CanvaImportModal open={isCanvaOpen} onClose={() => setIsCanvaOpen(false)} />
    </div>
  );
}
