"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LuX, LuRefreshCw } from "react-icons/lu";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  canvasJson: Record<string, unknown>;
  width: number;
  height: number;
}

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

function extractVarsFromJson(json: Record<string, unknown>): string[] {
  const vars = new Set<string>();
  const text = JSON.stringify(json);
  let match;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    vars.add(match[1]);
  }
  VARIABLE_REGEX.lastIndex = 0;
  return Array.from(vars);
}

function substituteInJson(json: Record<string, unknown>, data: Record<string, string>): Record<string, unknown> {
  const text = JSON.stringify(json);
  const replaced = text.replace(VARIABLE_REGEX, (_, key: string) => data[key] ?? `{{${key}}}`);
  return JSON.parse(replaced);
}

const DEFAULT_DATA: Record<string, string> = {
  name: "John Smith",
  email: "john@example.com",
  certificate_id: "CERT-2026-001",
  issued_date: "April 6, 2026",
  expiry_date: "April 6, 2027",
  issuer_name: "Jane Doe",
  issuer_email: "jane@example.com",
  verification_url: "https://certgen.example.com/verify/CERT-2026-001",
};

export function PreviewModal({ open, onClose, canvasJson, width, height }: PreviewModalProps) {
  const [variables, setVariables] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<unknown>(null);

  useEffect(() => {
    if (!open) return;
    const vars = extractVarsFromJson(canvasJson);
    setVariables(vars);
    const initial: Record<string, string> = {};
    for (const v of vars) initial[v] = DEFAULT_DATA[v] ?? `Sample ${v}`;
    setData(initial);
  }, [open, canvasJson]);

  const renderPreview = useCallback(async () => {
    if (!canvasRef.current || !open) return;
    const { Canvas } = await import("fabric");
    if (fabricRef.current) {
      (fabricRef.current as InstanceType<typeof Canvas>).dispose();
    }
    const fc = new Canvas(canvasRef.current, { width, height, backgroundColor: "#ffffff" });
    fabricRef.current = fc;

    const substituted = substituteInJson(canvasJson, data);
    await fc.loadFromJSON(substituted);
    fc.requestRenderAll();
    fc.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.evented = false;
    });
    fc.requestRenderAll();
  }, [open, canvasJson, data, width, height]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  useEffect(() => {
    return () => {
      if (fabricRef.current) {
        (fabricRef.current as { dispose: () => void }).dispose();
        fabricRef.current = null;
      }
    };
  }, []);

  if (!open) return null;

  // Calculate scale to fit in the preview area
  // We want to leave some padding around the canvas
  // Since we are in a flex-1 container, let's use more reliable estimates
  const scale = Math.min(700 / width, 550 / height, 1);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative flex h-[90vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all animate-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Live Preview</h2>
            <p className="text-sm text-gray-500">Preview your certificate with sample data</p>
          </div>
          <button 
            onClick={onClose} 
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
          >
            <LuX className="text-2xl transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex flex-1 items-center justify-center bg-[#F8FAFC] p-10 overflow-hidden">
            <div 
              className="relative shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out"
              style={{ 
                width: width * scale, 
                height: height * scale,
                background: "white" 
              }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="flex w-80 flex-col border-l border-gray-100 bg-white">
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Sample Data</h3>
                <button
                  onClick={() => {
                    const reset: Record<string, string> = {};
                    for (const v of variables) reset[v] = DEFAULT_DATA[v] ?? `Sample ${v}`;
                    setData(reset);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  <LuRefreshCw className="text-sm" />
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                {variables.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                      <LuRefreshCw className="text-2xl" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">
                      No dynamic variables found
                    </p>
                    <p className="mt-1 text-xs text-gray-300">
                      Use {"{{variable_name}}"} in text objects
                    </p>
                  </div>
                )}
                {variables.map((v) => (
                  <div key={v} className="group">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 transition-colors group-focus-within:text-indigo-600">
                      {v.replace(/_/g, ' ').toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={data[v] ?? ""}
                      onChange={(e) => setData((prev) => ({ ...prev, [v]: e.target.value }))}
                      placeholder={`Enter ${v}...`}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all placeholder:text-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 hover:shadow-gray-300 active:scale-[0.98]"
              >
                Done Previewing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
