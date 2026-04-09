"use client";

import { useState, useCallback } from "react";
import { addImageFromUrl } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface QrCodesPanelProps {
  canvas: Canvas | null;
}

export function QrCodesPanel({ canvas }: QrCodesPanelProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateQr = useCallback(async (text: string) => {
    if (!canvas || !text) return;
    setGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text, { width: 150, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
      await addImageFromUrl(canvas, dataUrl);
    } catch {
      // silently ignore
    } finally {
      setGenerating(false);
    }
  }, [canvas]);

  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Verification QR</h3>
        <button
          onClick={() => generateQr("{{verification_url}}")}
          disabled={generating}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
        >
          <div className="font-medium text-gray-800">Verification Page QR</div>
          <div className="text-xs text-gray-400">Uses {`{{verification_url}}`}</div>
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Custom URL QR</h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => generateQr(customUrl)}
            disabled={!customUrl || generating}
            className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
