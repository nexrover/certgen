"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface HSV { h: number; s: number; v: number; }
interface RGB { r: number; g: number; b: number; }

function hsvToRgb(h: number, s: number, v: number): RGB {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h * 10) / 10, s: Math.round(s * 10) / 10, v: Math.round(v * 10) / 10 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface ModernColorPickerProps {
  initialColor?: string;
  onChange?: (hex: string) => void;
  onConfirm?: (hex: string) => void;
  onCancel?: () => void;
}

export default function ModernColorPicker({
  initialColor = "#FF0000",
  onChange,
  onConfirm,
  onCancel,
}: ModernColorPickerProps) {
  const initRgb = hexToRgb(initialColor) || { r: 255, g: 0, b: 0 };
  const initHsv = rgbToHsv(initRgb.r, initRgb.g, initRgb.b);

  const [hsv, setHsv] = useState<HSV>(initHsv);
  const [alpha, setAlpha] = useState(100);

  const [hexInput, setHexInput] = useState(rgbToHex(initRgb.r, initRgb.g, initRgb.b));
  const [rInput, setRInput] = useState(String(initRgb.r));
  const [gInput, setGInput] = useState(String(initRgb.g));
  const [bInput, setBInput] = useState(String(initRgb.b));
  const [aInput, setAInput] = useState("100");

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"sv" | "hue" | "alpha" | null>(null);

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const newHsv = rgbToHsv(r, g, b);
    setHsv(newHsv);
    const newHex = rgbToHex(r, g, b);
    setHexInput(newHex);
    setRInput(String(r));
    setGInput(String(g));
    setBInput(String(b));
    onChange?.(newHex);
  }, [onChange]);

  const updateFromHsv = useCallback((newHsv: HSV) => {
    setHsv(newHsv);
    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(newHex);
    setRInput(String(newRgb.r));
    setGInput(String(newRgb.g));
    setBInput(String(newRgb.b));
    onChange?.(newHex);
  }, [onChange]);

  const getPointerPosition = useCallback((e: React.MouseEvent | MouseEvent, rect: DOMRect) => {
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
    };
  }, []);

  const handleSvPointer = useCallback((clientX: number, clientY: number) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    updateFromHsv({ h: hsv.h, s: x * 100, v: (1 - y) * 100 });
  }, [hsv.h, updateFromHsv]);

  const handleHuePointer = useCallback((clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    updateFromHsv({ ...hsv, h: x * 360 });
  }, [hsv, updateFromHsv]);

  const handleAlphaPointer = useCallback((clientX: number) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const newAlpha = Math.round(x * 100);
    setAlpha(newAlpha);
    setAInput(String(newAlpha));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current === "sv") handleSvPointer(e.clientX, e.clientY);
      else if (draggingRef.current === "hue") handleHuePointer(e.clientX);
      else if (draggingRef.current === "alpha") handleAlphaPointer(e.clientX);
    };
    const onUp = () => { draggingRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [handleSvPointer, handleHuePointer, handleAlphaPointer]);

  const handleSvMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = "sv";
    handleSvPointer(e.clientX, e.clientY);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = "hue";
    handleHuePointer(e.clientX);
  };

  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = "alpha";
    handleAlphaPointer(e.clientX);
  };

  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const cleaned = val.startsWith("#") ? val : `#${val}`;
    const parsed = hexToRgb(cleaned);
    if (parsed) updateFromRgb(parsed.r, parsed.g, parsed.b);
  };

  const handleRChange = (val: string) => {
    setRInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      updateFromRgb(num, parseInt(gInput) || 0, parseInt(bInput) || 0);
    }
  };

  const handleGChange = (val: string) => {
    setGInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      updateFromRgb(parseInt(rInput) || 0, num, parseInt(bInput) || 0);
    }
  };

  const handleBChange = (val: string) => {
    setBInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      updateFromRgb(parseInt(rInput) || 0, parseInt(gInput) || 0, num);
    }
  };

  const handleAChange = (val: string) => {
    setAInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setAlpha(num);
    }
  };

  // Positions for indicators
  const svX = hsv.s / 100;
  const svY = 1 - hsv.v / 100;
  const hueX = hsv.h / 360;
  const alphaX = alpha / 100;

  const pureHue = hsvToRgb(hsv.h, 100, 100);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Saturation/Brightness gradient area */}
      <div
        ref={svRef}
        onMouseDown={handleSvMouseDown}
        className="relative w-full h-36 rounded-xl overflow-hidden cursor-crosshair shadow-inner border border-gray-200"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
        }}
      >
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.3)] pointer-events-none"
          style={{ left: `${svX * 100}%`, top: `${svY * 100}%` }}
        />
      </div>

      {/* Hue slider */}
      <div className="flex items-center gap-2.5">
        <div className="w-4 h-4 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: `rgb(${pureHue.r}, ${pureHue.g}, ${pureHue.b})` }} />
        <div
          ref={hueRef}
          onMouseDown={handleHueMouseDown}
          className="relative flex-1 h-3.5 rounded-full cursor-pointer shadow-sm border border-gray-200"
          style={{
            background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
          }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] pointer-events-none"
            style={{ left: `${hueX * 100}%` }}
          />
        </div>
      </div>

      {/* Alpha slider */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase w-4 text-center flex-shrink-0">A</span>
        <div
          ref={alphaRef}
          onMouseDown={handleAlphaMouseDown}
          className="relative flex-1 h-3.5 rounded-full cursor-pointer shadow-sm border border-gray-200"
          style={{
            background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`,
          }}
        >
          {/* Checkerboard background for transparency */}
          <div
            className="absolute inset-0 rounded-full -z-10"
            style={{
              backgroundImage: "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)",
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] pointer-events-none"
            style={{ left: `${alphaX * 100}%` }}
          />
        </div>
      </div>

      {/* Inputs row: Hex + RGB + A */}
      <div className="flex items-stretch gap-2 pt-1.5 border-t border-gray-100">
        {/* Color preview swatch */}
        <div
          className="w-10 h-auto min-h-[36px] rounded-lg border border-gray-200 shadow-sm flex-shrink-0 self-stretch"
          style={{
            backgroundColor: hex,
            backgroundImage: alpha < 100 ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)" : "none",
            backgroundSize: "8px 8px",
          }}
        />

        {/* Hex */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[9px] font-bold text-gray-400 uppercase">Hex</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInputChange(e.target.value)}
            className="w-full text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all uppercase"
          />
        </div>

        {/* R */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[9px] font-bold text-gray-400 uppercase">R</span>
          <input
            type="number"
            min={0}
            max={255}
            value={rInput}
            onChange={(e) => handleRChange(e.target.value)}
            className="w-full text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* G */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[9px] font-bold text-gray-400 uppercase">G</span>
          <input
            type="number"
            min={0}
            max={255}
            value={gInput}
            onChange={(e) => handleGChange(e.target.value)}
            className="w-full text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* B */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[9px] font-bold text-gray-400 uppercase">B</span>
          <input
            type="number"
            min={0}
            max={255}
            value={bInput}
            onChange={(e) => handleBChange(e.target.value)}
            className="w-full text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* A */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[9px] font-bold text-gray-400 uppercase">A</span>
          <input
            type="number"
            min={0}
            max={100}
            value={aInput}
            onChange={(e) => handleAChange(e.target.value)}
            className="w-full text-[11px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
