"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { PaperSize } from "@/lib/types";
import { LuCheck, LuChevronDown, LuFileText, LuCrop, LuMonitor, LuImage, LuMail, LuCreditCard, LuReceipt } from "react-icons/lu";
import { FaInstagram, FaTwitter, FaFacebookF, FaApple, FaYoutube, FaTiktok, FaLinkedinIn, FaShareAlt, FaFlag } from "react-icons/fa";

interface ToolbarProps {
  templateName: string;
  onNameChange: (name: string) => void;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  customWidth: number;
  customHeight: number;
  onCustomDimensionChange: (w: number, h: number) => void;
  onPreview: () => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  saving: boolean;
  dirty: boolean;
  category?: string;
}

export const RAW_PAPER_OPTIONS: { value: PaperSize; label: string; displayDims: string; icon: React.ReactNode; dpi?: string; categories: string[] }[] = [
  { value: "INSTAGRAM_STORY", label: "Instagram Story", displayDims: "1080×1920", icon: <FaInstagram className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "LANDSCAPE_POST", label: "Landscape Post", displayDims: "1080×608", icon: <FaInstagram className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "TWITTER_POST", label: "Twitter Post", displayDims: "1600×900", icon: <FaTwitter className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "TWITTER_BANNER", label: "Twitter Banner", displayDims: "1500×500", icon: <FaTwitter className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "FACEBOOK_POST", label: "Facebook Post", displayDims: "1200×630", icon: <FaFacebookF className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "APP_STORE_SCREENSHOT", label: "App Store Screenshot", displayDims: "1290×2796", icon: <FaApple className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "OPEN_GRAPH", label: "Open Graph", displayDims: "1200×630", icon: <FaShareAlt className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "YOUTUBE_THUMBNAIL", label: "YouTube Thumbnail", displayDims: "1280×720", icon: <FaYoutube className="w-3.5 h-3.5" />, categories: ["youtube", "social-media"] },
  { value: "TIKTOK_VIDEO", label: "TikTok Video", displayDims: "1080×1920", icon: <FaTiktok className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "LINKEDIN_POST", label: "LinkedIn Post", displayDims: "1200×627", icon: <FaLinkedinIn className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "BILLBOARD", label: "Billboard", displayDims: "970×250", icon: <FaFlag className="w-3.5 h-3.5" />, categories: ["social-media"] },
  
  { value: "A4", label: "A4", displayDims: "2480×3508", dpi: "300dpi", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["certificate", "email", "resume", "invoice"] },
  { value: "US_LETTER", label: "US Letter", displayDims: "2550×3300", dpi: "300dpi", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["certificate", "receipt"] },
  { value: "US_LEGAL", label: "US Legal", displayDims: "2550×4200", dpi: "300dpi", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["certificate"] },
  { value: "A4_LANDSCAPE", label: "A4 Landscape", displayDims: "3508×2480", dpi: "300dpi", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["certificate", "real-estate"] },
  { value: "US_LETTER_LANDSCAPE", label: "US Letter Landscape", displayDims: "3300×2550", dpi: "300dpi", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["certificate"] },

  { value: "SOCIAL_1080", label: "Social Square", displayDims: "1080×1080", icon: <LuImage className="w-3.5 h-3.5" />, categories: ["social-media"] },
  { value: "SQUARE_500", label: "Small Square", displayDims: "500×500", icon: <LuImage className="w-3.5 h-3.5" />, categories: ["ecommerce"] },
  { value: "SQUARE_1024", label: "Large Square", displayDims: "1024×1024", icon: <LuImage className="w-3.5 h-3.5" />, categories: ["ecommerce", "real-estate"] },
  { value: "SQUARE_1200", label: "Square Large", displayDims: "1200×1200", icon: <LuImage className="w-3.5 h-3.5" />, categories: ["shipping-label", "social-media"] },
  { value: "SOCIAL_STORY", label: "Social Story", displayDims: "1080×1920", icon: <LuImage className="w-3.5 h-3.5" />, categories: ["real-estate", "social-media"] },
  { value: "CUSTOM_16_9", label: "Full HD 16:9", displayDims: "1920×1080", icon: <LuMonitor className="w-3.5 h-3.5" />, categories: ["ecommerce", "youtube"] },
  { value: "RESUME", label: "Resume Page", displayDims: "1020×1320", icon: <LuFileText className="w-3.5 h-3.5" />, categories: ["resume"] },
  { value: "INVOICE", label: "Invoice Page", displayDims: "1020×1320", icon: <LuReceipt className="w-3.5 h-3.5" />, categories: ["invoice"] },
  { value: "RECEIPT", label: "Receipt Tape", displayDims: "820×1360", icon: <LuCreditCard className="w-3.5 h-3.5" />, categories: ["receipt"] },
  { value: "CHRISTMAS_CARD", label: "Christmas Card", displayDims: "1050×600", icon: <LuMail className="w-3.5 h-3.5" />, categories: ["christmas-card"] },

  { value: "CUSTOM", label: "Custom Size", displayDims: "Custom", icon: <LuCrop className="w-3.5 h-3.5" />, categories: [] },
];

export const ALL_PAPER_OPTIONS = [
  RAW_PAPER_OPTIONS.find((o) => o.value === "CUSTOM")!,
  ...RAW_PAPER_OPTIONS.filter((o) => o.value !== "CUSTOM").sort((a, b) => a.label.localeCompare(b.label)),
];

export function Toolbar({
  templateName, onNameChange, paperSize, onPaperSizeChange,
  customWidth, customHeight, onCustomDimensionChange,
  onPreview, onSave, onDownloadPdf, saving, dirty, category = "certificate",
}: ToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = ALL_PAPER_OPTIONS;
  const selectedOption = options.find((o) => o.value === paperSize) || options[0];

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 relative z-[9999]">
      <div className="flex items-center gap-4">
        <Link href="/dashboard?view=templates" className="text-lg font-bold text-indigo-600">
          CertGen
        </Link>
        <div className="h-6 w-px bg-gray-200" />
        <input
          type="text"
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          className="rounded border border-transparent px-2 py-1 text-sm font-medium text-gray-800 hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
          placeholder="Untitled Template"
        />
        {dirty && <span className="text-xs text-amber-500 font-medium">Unsaved</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            style={{ minWidth: "240px" }}
          >
            <span className="text-gray-800 font-medium truncate flex items-center">
              {selectedOption.label} 
              {selectedOption.value !== "CUSTOM" ? (
                <span className="text-gray-500 font-normal ml-1.5">({selectedOption.displayDims})</span>
              ) : (
                <span className="text-gray-500 font-normal ml-1.5">({customWidth}×{customHeight})</span>
              )}
            </span>
            <LuChevronDown className={`text-gray-500 w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-[300px] max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 custom-scrollbar">
              {options.map((o) => {
                if (o.value === "CUSTOM") {
                  const isSelected = paperSize === "CUSTOM";
                  return (
                    <div
                      key={o.value}
                      className={`mx-2 mb-3 mt-1 flex flex-col border rounded-lg shadow-sm transition-colors overflow-hidden ${
                        isSelected ? "border-indigo-300 ring-1 ring-indigo-500/20 bg-indigo-50/30" : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onPaperSizeChange(o.value);
                          // Do not close the dropdown when selecting CUSTOM so they can type immediately
                        }}
                        className="flex items-center justify-between w-full p-2 px-3 text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center justify-center w-5 ${isSelected ? "text-green-500" : "text-gray-400"}`}>
                            {isSelected ? <LuCheck className="w-4 h-4" /> : o.icon}
                          </span>
                          <span className={`text-sm ${isSelected ? "font-semibold text-indigo-900" : "font-medium text-gray-700"}`}>
                            {o.label}
                          </span>
                        </div>
                      </button>

                      {/* Always show inputs for custom size in this box, or just when selected? 
                          Showing always lets them click the input directly. */}
                      <div className={`px-3 pb-3 flex items-center gap-2 transition-opacity ${isSelected ? "opacity-100" : "opacity-60"}`}>
                        <div className="flex items-center bg-white rounded-md border border-gray-200 p-1 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 flex-1">
                          <span className="text-[10px] text-gray-400 font-semibold px-1 uppercase tracking-wide select-none">W</span>
                          <input
                            type="number"
                            value={customWidth}
                            onChange={(e) => {
                              onPaperSizeChange("CUSTOM"); // Auto-select if they start typing
                              onCustomDimensionChange(Number(e.target.value), customHeight);
                            }}
                            className="w-full bg-transparent text-xs text-gray-800 font-medium outline-none text-center"
                          />
                        </div>
                        <span className="text-gray-400 text-xs font-semibold select-none">×</span>
                        <div className="flex items-center bg-white rounded-md border border-gray-200 p-1 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 flex-1">
                          <span className="text-[10px] text-gray-400 font-semibold px-1 uppercase tracking-wide select-none">H</span>
                          <input
                            type="number"
                            value={customHeight}
                            onChange={(e) => {
                              onPaperSizeChange("CUSTOM"); // Auto-select if they start typing
                              onCustomDimensionChange(customWidth, Number(e.target.value));
                            }}
                            className="w-full bg-transparent text-xs text-gray-800 font-medium outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={o.value}
                    onClick={() => {
                      onPaperSizeChange(o.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                      paperSize === o.value ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-5 ${paperSize === o.value ? "text-green-500" : "text-gray-400"}`}>
                        {paperSize === o.value ? <LuCheck className="w-4 h-4" /> : o.icon}
                      </span>
                      <span className={`text-sm ${paperSize === o.value ? "font-semibold text-indigo-900" : "font-medium text-gray-700"}`}>
                        {o.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {o.dpi && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          {o.dpi}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-medium font-mono">
                        {o.displayDims}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={onPreview} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors ml-2">
          Preview
        </button>
        <button onClick={onDownloadPdf} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
          Export PDF
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
