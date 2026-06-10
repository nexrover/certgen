"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { LuX, LuLink, LuFileText, LuDownload, LuArrowRight } from "react-icons/lu";

interface CanvaImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CanvaImportModal({ open, onClose }: CanvaImportModalProps) {
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsImporting(true);
    // Simulation
    setTimeout(() => {
      setIsImporting(false);
      alert("Canva template import feature will be connected in the next step!");
      onClose();
    }, 1500);
  };

  const steps = [
    {
      icon: <LuLink className="text-indigo-600 w-5 h-5" />,
      title: "Get Canva Template Link",
      desc: "Open your design in Canva, click 'Share' at the top-right, and select 'Template link' or 'Public view link'.",
    },
    {
      icon: <LuDownload className="text-indigo-600 w-5 h-5" />,
      title: "Or Export to PDF",
      desc: "Download your certificate design as a PDF print/standard from Canva to import directly.",
    },
    {
      icon: <LuFileText className="text-indigo-600 w-5 h-5" />,
      title: "Paste & Import",
      desc: "Paste the copied link in the input section below or drag your exported PDF file here.",
    },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative flex w-full max-w-[650px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all animate-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Import from Canva</h2>
            <p className="text-xs text-gray-500">Follow these instructions to import your template</p>
          </div>
          <button 
            onClick={onClose} 
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
          >
            <LuX className="text-xl transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Instructions</h3>
            <div className="grid gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleImport} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Canva Template or PDF Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.canva.com/design/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm transition-all placeholder:text-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <LuLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isImporting || !url.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isImporting ? "Importing..." : "Import Design"}
                <LuArrowRight />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
