"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

  const scale = Math.min(600 / width, 500 / height, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="max-h-[90vh] w-[900px] overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="flex gap-6 p-6">
          <div className="flex-1">
            <div className="overflow-auto rounded border border-gray-200 bg-gray-50 p-4">
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: width * scale, height: height * scale }}>
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          <div className="w-56 shrink-0">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Sample Data</h3>
            <div className="space-y-2">
              {variables.map((v) => (
                <div key={v}>
                  <label className="mb-0.5 block text-xs text-gray-500">{v}</label>
                  <input
                    type="text"
                    value={data[v] ?? ""}
                    onChange={(e) => setData((prev) => ({ ...prev, [v]: e.target.value }))}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const reset: Record<string, string> = {};
                for (const v of variables) reset[v] = DEFAULT_DATA[v] ?? `Sample ${v}`;
                setData(reset);
              }}
              className="mt-3 w-full rounded bg-gray-100 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Reset to Default Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
