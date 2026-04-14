"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import type { CustomTemplate } from "@/lib/custom-templates-store";

interface TemplatesPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  customTemplates?: CustomTemplate[];
  onDeleteCustomTemplate?: (id: string) => void;
}

type Orientation = "landscape" | "portrait";
type Category = "Course" | "Completion" | "Achievement" | "Training" | "Recognition" | "Participation" | "Webinar" | "Appreciation" | "Employee of the Month";
type Style = "Classic" | "Modern" | "Minimal" | "Bold";
type ColorTheme = "Navy" | "Dark" | "Green" | "Red" | "Warm" | "Cool" | "Neutral";

interface TemplatePreview {
  id: string;
  label: string;
  categories: Category[];
  style: Style;
  colorTheme: ColorTheme;
  orientation: Orientation;
  thumbnail: ReactNode;
}

const ALL_CATEGORIES: Category[] = ["Course", "Completion", "Achievement", "Training", "Recognition", "Participation", "Webinar", "Appreciation", "Employee of the Month"];
const ALL_STYLES: Style[] = ["Classic", "Modern", "Minimal", "Bold"];
const ALL_COLORS: ColorTheme[] = ["Navy", "Dark", "Green", "Red", "Warm", "Cool", "Neutral"];

function LandscapeThumb({ children, bg = "#fff" }: { children: ReactNode; bg?: string }) {
  return <div className="relative h-[72px] w-full overflow-hidden rounded" style={{ background: bg }}>{children}</div>;
}

function PortraitThumb({ children, bg = "#fff" }: { children: ReactNode; bg?: string }) {
  return <div className="relative h-[100px] w-full overflow-hidden rounded" style={{ background: bg }}>{children}</div>;
}

const TEMPLATES: TemplatePreview[] = [
  {
    id: "course-completion",
    label: "Course Completion",
    categories: ["Course", "Completion"],
    style: "Classic",
    colorTheme: "Navy",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb>
        <div className="absolute inset-[3px] rounded-sm border-2 border-[#1e3a5f]">
          <div className="absolute inset-[3px] rounded-sm border border-[#c9a84c]" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-2">
          <span className="text-[5px] font-normal tracking-[3px] text-[#c9a84c]">CERTIFICATE</span>
          <span className="text-[8px] font-bold text-[#1e3a5f]">OF COMPLETION</span>
          <span className="mt-1 text-[4px] text-gray-500">This is to certify that</span>
          <span className="text-[7px] font-bold text-[#1e3a5f]">[recipient.name]</span>
          <div className="my-0.5 h-px w-12 bg-[#c9a84c]" />
          <span className="text-[3.5px] leading-tight text-gray-400 text-center px-2">has successfully completed the course requirements</span>
          <div className="mt-2 flex w-full justify-around px-4">
            <div className="text-center"><div className="mb-px h-px w-8 bg-gray-300" /><span className="text-[3px] text-gray-400">Instructor</span></div>
            <div className="text-center"><div className="mb-px h-px w-8 bg-gray-300" /><span className="text-[3px] text-gray-400">Director</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "achievement-award",
    label: "Achievement Award",
    categories: ["Achievement", "Recognition"],
    style: "Bold",
    colorTheme: "Dark",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb bg="#0f172a">
        <div className="absolute inset-[4px] border border-[#f59e0b]" />
        <div className="relative flex h-full flex-col items-center justify-center">
          <span className="text-[6px] font-bold tracking-wider text-[#f59e0b]">&#9733; AWARD OF ACHIEVEMENT &#9733;</span>
          <div className="my-0.5 h-px w-10 bg-[#f59e0b]" />
          <span className="text-[4px] text-slate-400">Presented to</span>
          <span className="text-[9px] font-bold text-white">[recipient.name]</span>
          <span className="mt-0.5 px-3 text-center text-[3.5px] text-slate-400">In recognition of outstanding achievement</span>
          <div className="mt-2 flex w-full justify-around px-6">
            <div className="text-center"><div className="mb-px h-px w-7 bg-slate-600" /><span className="text-[3px] text-slate-500">Signature</span></div>
            <div className="text-center"><div className="mb-px h-px w-7 bg-slate-600" /><span className="text-[3px] text-slate-500">Organization</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "professional-cert",
    label: "Professional Certificate",
    categories: ["Completion", "Recognition"],
    style: "Modern",
    colorTheme: "Green",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb>
        <div className="absolute bottom-0 left-0 top-0 w-[8px] bg-[#059669]" />
        <div className="absolute bottom-0 left-[9px] top-0 w-[2px] bg-[#10b981]" />
        <div className="relative flex h-full flex-col justify-center pl-[16px] pr-2">
          <span className="text-[4px] font-bold tracking-[2px] text-[#059669]">PROFESSIONAL CERTIFICATE</span>
          <div className="my-0.5 h-px w-full bg-gray-200" />
          <span className="text-[3.5px] text-gray-500">This is to certify that</span>
          <span className="text-[8px] font-bold text-gray-900">[recipient.name]</span>
          <span className="mt-0.5 text-[3.5px] leading-tight text-gray-400">has demonstrated professional competency</span>
          <div className="mt-1.5 flex gap-4">
            <div><span className="text-[3px] font-bold tracking-wider text-gray-400">DATE ISSUED</span><br /><span className="text-[4px] text-gray-800">[issued_date]</span></div>
            <div><span className="text-[3px] font-bold tracking-wider text-gray-400">CERT ID</span><br /><span className="text-[4px] text-gray-800">[certificate_id]</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "communication-skills",
    label: "Communication Skills",
    categories: ["Course", "Training"],
    style: "Modern",
    colorTheme: "Red",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb>
        <div className="absolute bottom-0 left-0 right-0 h-[8px] bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
        <div className="relative flex h-full flex-col items-center justify-center px-2 pb-2">
          <span className="text-[5px] font-bold tracking-wider text-gray-500">CERTIFICATE OF COMPLETION</span>
          <span className="text-[4px] text-gray-400">COMMUNICATION SKILLS COURSE</span>
          <div className="my-0.5 h-px w-16 bg-gray-200" />
          <span className="text-[3.5px] text-gray-400">AWARDED TO</span>
          <span className="text-[8px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 px-2 text-center text-[3px] text-gray-400">has meritoriously completed the course</span>
          <div className="mt-1.5 flex w-full justify-around px-4">
            <div className="text-center"><div className="mb-px h-px w-7 bg-gray-300" /><span className="text-[3px] text-gray-400">Instructor</span></div>
            <div className="text-center"><div className="mb-px h-px w-7 bg-gray-300" /><span className="text-[3px] text-gray-400">Director</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    categories: ["Course", "Completion"],
    style: "Modern",
    colorTheme: "Warm",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb bg="#fefbf4">
        <div className="absolute right-0 top-0 h-full w-[22px]">
          <div className="h-[12px] w-[12px] rounded-sm bg-amber-300 ml-1 mt-1" />
          <div className="h-[8px] w-[8px] rounded-sm bg-amber-200 ml-3 mt-0.5" />
          <div className="h-[6px] w-[6px] rounded bg-amber-400 ml-0.5 mt-1" />
        </div>
        <div className="relative flex h-full flex-col justify-center pl-3 pr-6">
          <span className="text-[4px] text-gray-500">Certificate of Course</span>
          <span className="text-[6px] font-bold text-gray-800">Completion</span>
          <span className="mt-0.5 text-[3.5px] text-gray-400">is awarded to</span>
          <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-[3px] text-gray-400">for successfully completing the</span>
          <span className="text-[4px] font-semibold italic text-amber-700">Digital Marketing Strategies</span>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "financial-accounting",
    label: "Financial Accounting",
    categories: ["Course", "Completion"],
    style: "Minimal",
    colorTheme: "Neutral",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb bg="#fafafa">
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" />
        <div className="relative flex h-full flex-col items-center justify-center px-3">
          <span className="text-[5px] font-bold tracking-[2px] text-gray-600">COURSE COMPLETION CERTIFICATE</span>
          <div className="my-0.5 h-px w-20 bg-gray-300" />
          <span className="text-[8px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-center text-[3.5px] italic text-gray-500">Financial Accounting Fundamentals</span>
          <div className="mt-1.5 flex gap-2 text-center">
            <div className="rounded bg-gray-100 px-1.5 py-0.5"><span className="text-[3px] text-gray-400">270</span><br /><span className="text-[2.5px] text-gray-400">POINTS</span></div>
            <div className="rounded bg-gray-100 px-1.5 py-0.5"><span className="text-[3px] text-gray-400">4/5</span><br /><span className="text-[2.5px] text-gray-400">GRADE</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "seo-strategies",
    label: "SEO Strategies",
    categories: ["Course", "Training"],
    style: "Bold",
    colorTheme: "Cool",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb>
        <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-gradient-to-r from-blue-500 to-teal-500" />
        <div className="relative flex h-full flex-col items-center justify-center px-3 pb-2">
          <span className="text-[6px] font-extrabold tracking-wider text-blue-600">CERTIFICATE</span>
          <span className="text-[4px] font-bold text-gray-500">OF COMPLETION</span>
          <span className="mt-1 text-[8px] font-bold text-gray-800">[recipient.name]</span>
          <span className="text-[4px] font-semibold text-teal-600">ADVANCED SEO STRATEGIES COURSE</span>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "training-course",
    label: "Training Course",
    categories: ["Training", "Course"],
    style: "Bold",
    colorTheme: "Red",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb>
        <div className="absolute left-0 top-0 h-[28px] w-full bg-gradient-to-br from-red-500 to-red-700" />
        <div className="relative flex h-full flex-col items-center pt-1">
          <span className="text-[5px] font-extrabold tracking-wider text-white">TRAINING COURSE</span>
          <span className="text-[3.5px] font-bold text-red-200">CERTIFICATE</span>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-[3.5px] text-gray-400">IS PROUDLY PRESENTED TO</span>
            <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          </div>
          <div className="mt-1 flex gap-1">
            <div className="rounded bg-red-100 px-1 py-px"><span className="text-[2.5px] font-bold text-red-600">DATE</span></div>
            <div className="rounded bg-red-100 px-1 py-px"><span className="text-[2.5px] font-bold text-red-600">SCORE</span></div>
            <div className="rounded bg-green-100 px-1 py-px"><span className="text-[2.5px] font-bold text-green-600">PASSED</span></div>
          </div>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "webinar-participation",
    label: "Webinar Participation",
    categories: ["Webinar", "Participation"],
    style: "Modern",
    colorTheme: "Cool",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb bg="#f0f7ff">
        <div className="absolute left-0 top-0 h-full w-[6px] bg-blue-400" />
        <div className="absolute bottom-0 right-0 h-full w-[6px] bg-blue-400" />
        <div className="relative flex h-full flex-col items-center justify-center px-3">
          <span className="text-[5px] font-bold text-blue-600">CERTIFICATE OF PARTICIPATION</span>
          <span className="text-[3.5px] text-blue-400">WEBINAR SERIES</span>
          <div className="my-0.5 h-px w-12 bg-blue-300" />
          <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-center text-[3px] text-gray-500">has participated in the webinar series</span>
        </div>
      </LandscapeThumb>
    ),
  },
  {
    id: "appreciation",
    label: "Appreciation",
    categories: ["Appreciation", "Recognition"],
    style: "Classic",
    colorTheme: "Warm",
    orientation: "landscape",
    thumbnail: (
      <LandscapeThumb bg="#fffbf0">
        <div className="absolute inset-[3px] rounded border-2 border-double border-amber-400" />
        <div className="relative flex h-full flex-col items-center justify-center px-3">
          <span className="text-[4px] tracking-[2px] text-amber-500">&#10047; &#10047; &#10047;</span>
          <span className="text-[6px] font-bold text-amber-800">Certificate of Appreciation</span>
          <span className="text-[3.5px] text-amber-600">is presented to</span>
          <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-[3px] text-gray-500">for outstanding dedication and service</span>
        </div>
      </LandscapeThumb>
    ),
  },
  // --- Portrait templates ---
  {
    id: "course-completion-portrait",
    label: "Course Completion",
    categories: ["Course", "Completion"],
    style: "Classic",
    colorTheme: "Navy",
    orientation: "portrait",
    thumbnail: (
      <PortraitThumb>
        <div className="absolute inset-[3px] rounded-sm border-2 border-[#1e3a5f]">
          <div className="absolute inset-[2px] rounded-sm border border-[#c9a84c]" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-2">
          <span className="text-[4px] tracking-[2px] text-[#c9a84c]">CERTIFICATE</span>
          <span className="text-[7px] font-bold text-[#1e3a5f]">OF COMPLETION</span>
          <span className="mt-1 text-[3.5px] text-gray-500">This is to certify that</span>
          <span className="text-[7px] font-bold text-[#1e3a5f]">[recipient.name]</span>
          <div className="my-0.5 h-px w-10 bg-[#c9a84c]" />
          <span className="text-center text-[3px] text-gray-400 px-1">has successfully completed all course requirements</span>
          <div className="mt-2 flex gap-4">
            <div className="text-center"><div className="h-px w-6 bg-gray-300" /><span className="text-[2.5px] text-gray-400">Instructor</span></div>
            <div className="text-center"><div className="h-px w-6 bg-gray-300" /><span className="text-[2.5px] text-gray-400">Director</span></div>
          </div>
        </div>
      </PortraitThumb>
    ),
  },
  {
    id: "creative-writing",
    label: "Creative Writing",
    categories: ["Course", "Training"],
    style: "Bold",
    colorTheme: "Warm",
    orientation: "portrait",
    thumbnail: (
      <PortraitThumb bg="#fdf2e9">
        <div className="absolute left-0 right-0 top-0 h-[12px] bg-gradient-to-r from-orange-400 to-amber-500" />
        <div className="relative flex h-full flex-col items-center pt-[16px] px-2">
          <span className="text-[4px] font-bold tracking-wider text-white" style={{ marginTop: "-4px" }}>ONLINE COURSE CERTIFICATE</span>
          <span className="mt-1 text-[5px] font-bold text-orange-800">CREATIVE WRITING</span>
          <span className="text-[3.5px] text-orange-600">WORKSHOP</span>
          <span className="mt-0.5 text-[3px] text-gray-400">AWARDED TO</span>
          <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-[3px] text-center text-gray-400">for developing essential writing skills</span>
          <div className="mt-1 rounded bg-amber-400 px-2 py-px">
            <span className="text-[3px] font-bold text-white">ACHIEVING A SCORE OF 94%</span>
          </div>
        </div>
      </PortraitThumb>
    ),
  },
  {
    id: "design-academy",
    label: "Design Academy",
    categories: ["Course", "Completion"],
    style: "Modern",
    colorTheme: "Cool",
    orientation: "portrait",
    thumbnail: (
      <PortraitThumb>
        <div className="absolute right-0 top-0">
          <div className="flex gap-px">
            <div className="h-[8px] w-[4px] rounded-bl bg-indigo-300" />
            <div className="h-[14px] w-[4px] bg-indigo-400" />
            <div className="h-[10px] w-[4px] bg-indigo-500" />
          </div>
          <div className="ml-2 mt-px h-[3px] w-[3px] rounded-full bg-indigo-600" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-3">
          <span className="text-[5px] font-bold tracking-wider text-gray-500">CERTIFICATE</span>
          <span className="text-[4px] text-gray-400">OF COURSE COMPLETION</span>
          <span className="mt-0.5 text-[3.5px] text-gray-400">PROUDLY PRESENTED TO</span>
          <span className="text-[8px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-[3px] text-gray-400">has demonstrated professional competence</span>
          <span className="text-[3.5px] font-semibold text-indigo-600">THE DESIGN BASICS</span>
          <div className="mt-2 flex gap-2">
            <div className="rounded bg-red-100 px-1 py-px"><span className="text-[2.5px] text-red-600">80/100 POINTS</span></div>
            <div className="rounded bg-blue-100 px-1 py-px"><span className="text-[2.5px] text-blue-600">40 HOURS</span></div>
          </div>
        </div>
      </PortraitThumb>
    ),
  },
  {
    id: "employee-month",
    label: "Employee of the Month",
    categories: ["Employee of the Month", "Recognition", "Appreciation"],
    style: "Classic",
    colorTheme: "Warm",
    orientation: "portrait",
    thumbnail: (
      <PortraitThumb bg="#fffef5">
        <div className="absolute inset-[3px] border border-amber-300" />
        <div className="relative flex h-full flex-col items-center justify-center px-2">
          <span className="text-[5px] text-amber-400">&#9733;</span>
          <span className="text-[5px] font-bold tracking-wider text-amber-700">EMPLOYEE</span>
          <span className="text-[4px] font-semibold text-amber-600">OF THE MONTH</span>
          <div className="my-0.5 h-px w-10 bg-amber-300" />
          <span className="text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-center text-[3px] text-gray-400">for exceptional performance and dedication</span>
          <span className="mt-1 text-[3.5px] font-medium text-amber-600">[issued_date]</span>
        </div>
      </PortraitThumb>
    ),
  },
  {
    id: "completion-portrait",
    label: "Completion Certificate",
    categories: ["Completion"],
    style: "Minimal",
    colorTheme: "Neutral",
    orientation: "portrait",
    thumbnail: (
      <PortraitThumb>
        <div className="relative flex h-full flex-col items-center justify-center px-3">
          <span className="text-[6px] font-light text-gray-700">Certificate of Completion</span>
          <span className="mt-0.5 text-[3px] text-gray-400">This certificate is granted to</span>
          <span className="mt-0.5 text-[7px] font-bold text-gray-800">[recipient.name]</span>
          <span className="mt-0.5 text-center text-[3px] text-gray-400">for completing the course at Code Academy over a period of 6 weeks</span>
          <div className="mt-1.5 flex gap-2 text-center">
            <div className="rounded bg-gray-100 px-1 py-0.5"><span className="text-[2.5px] text-gray-500">270</span><br /><span className="text-[2px] text-gray-400">Points</span></div>
            <div className="rounded bg-gray-100 px-1 py-0.5"><span className="text-[2.5px] text-gray-500">3</span><br /><span className="text-[2px] text-gray-400">Badges</span></div>
          </div>
          <div className="mt-1.5 flex gap-3">
            <div className="text-center"><div className="h-px w-6 bg-gray-300" /><span className="text-[2.5px] text-gray-400">Robert Wilson</span></div>
            <div className="text-center"><div className="h-px w-6 bg-gray-300" /><span className="text-[2.5px] text-gray-400">Linda Harris</span></div>
          </div>
        </div>
      </PortraitThumb>
    ),
  },
];

type FilterType = "category" | "style" | "color";

export function TemplatesPanel({ onLoadTemplate, customTemplates = [], onDeleteCustomTemplate }: TemplatesPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const customScrollRef = useRef<HTMLDivElement>(null);

  const scrollCustomRight = useCallback(() => {
    customScrollRef.current?.scrollBy({ left: 120, behavior: "smooth" });
  }, []);
  
  const scrollCustomLeft = useCallback(() => {
    customScrollRef.current?.scrollBy({ left: -120, behavior: "smooth" });
  }, []);
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Style[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorTheme[]>([]);
  const [openFilter, setOpenFilter] = useState<FilterType | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    if (t.orientation !== orientation) return false;
    if (selectedCategories.length > 0 && !t.categories.some((c) => selectedCategories.includes(c))) return false;
    if (selectedStyles.length > 0 && !selectedStyles.includes(t.style)) return false;
    if (selectedColors.length > 0 && !selectedColors.includes(t.colorTheme)) return false;
    return true;
  });

  const hasFilters = selectedCategories.length > 0 || selectedStyles.length > 0 || selectedColors.length > 0;

  async function handleLoad(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/templates/presets/${id}`);
      const data = await res.json();
      if (data.canvasJson) {
        onLoadTemplate({
          canvasJson: data.canvasJson,
          paperSize: data.paperSize,
          width: data.width,
          height: data.height,
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }

  function handleBlank() {
    onLoadTemplate({
      canvasJson: { version: "7.0.0", objects: [], background: "#ffffff" },
    });
  }

  return (
    <div className="-mx-3 -mt-3 flex flex-col">
      {/* Orientation tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setOrientation("landscape")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${orientation === "landscape"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Landscape
        </button>
        <button
          onClick={() => setOrientation("portrait")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${orientation === "portrait"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Portrait
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <FilterChip
          label="Category"
          active={selectedCategories.length > 0}
          isOpen={openFilter === "category"}
          onToggle={() => setOpenFilter(openFilter === "category" ? null : "category")}
          onClose={() => setOpenFilter(null)}
          options={ALL_CATEGORIES}
          selected={selectedCategories}
          onSelect={(v) => setSelectedCategories(
            selectedCategories.includes(v)
              ? selectedCategories.filter((x) => x !== v)
              : [...selectedCategories, v]
          )}
        />
        <FilterChip
          label="Style"
          active={selectedStyles.length > 0}
          isOpen={openFilter === "style"}
          onToggle={() => setOpenFilter(openFilter === "style" ? null : "style")}
          onClose={() => setOpenFilter(null)}
          options={ALL_STYLES}
          selected={selectedStyles}
          onSelect={(v) => setSelectedStyles(
            selectedStyles.includes(v as Style)
              ? selectedStyles.filter((x) => x !== v)
              : [...selectedStyles, v as Style]
          )}
        />
        <FilterChip
          label="Color"
          active={selectedColors.length > 0}
          isOpen={openFilter === "color"}
          onToggle={() => setOpenFilter(openFilter === "color" ? null : "color")}
          onClose={() => setOpenFilter(null)}
          options={ALL_COLORS}
          selected={selectedColors}
          onSelect={(v) => setSelectedColors(
            selectedColors.includes(v as ColorTheme)
              ? selectedColors.filter((x) => x !== v)
              : [...selectedColors, v as ColorTheme]
          )}
        />
        {hasFilters && (
          <button
            onClick={() => { setSelectedCategories([]); setSelectedStyles([]); setSelectedColors([]); }}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-600"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Custom Templates — horizontal scroll ────────── */}
      {customTemplates.length > 0 && (
        <div className="px-3 pb-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-700">Recently Used</span>
            <div className="flex gap-1">
              <button
                onClick={scrollCustomLeft}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
                title="Scroll left"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={scrollCustomRight}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
                title="Scroll right"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={customScrollRef}
            className="flex gap-2 overflow-x-auto pb-1.5"
            style={{ scrollbarWidth: "none" }}
          >
            {customTemplates.map((ct) => (
              <div key={ct.id} className="group relative shrink-0">
                <button
                  onClick={() => {
                    onLoadTemplate({
                      canvasJson: ct.canvasJson,
                      paperSize: ct.paperSize,
                      width: ct.width,
                      height: ct.height,
                    });
                  }}
                  className="block overflow-hidden rounded-md border border-gray-200 bg-white transition-all hover:border-blue-400 hover:shadow-md"
                  title="Load custom template"
                >
                  <img
                    src={ct.thumbnail}
                    alt="Custom template"
                    className="h-[62px] w-[88px] object-cover"
                    draggable={false}
                  />
                </button>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomTemplate?.(ct.id);
                  }}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow transition-colors hover:bg-red-600 group-hover:flex"
                  title="Remove"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All Results label ──────────────────────────────── */}
      <div className="px-3 pb-1.5">
        <span className="text-[11px] font-semibold text-gray-700">All Results</span>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        {/* Blank template */}
        <button
          onClick={handleBlank}
          className="group flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-300 hover:bg-blue-50"
          style={{ height: orientation === "landscape" ? 72 : 100 }}
        >
          <svg className="h-6 w-6 text-gray-300 transition-colors group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => handleLoad(t.id)}
            disabled={loading === t.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-md disabled:opacity-50"
          >
            {t.thumbnail}
            {loading === t.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-3 pb-4 text-center text-xs text-gray-400">
          No templates match your filters.
        </div>
      )}
    </div>
  );
}

function FilterChip<T extends string>({
  label, active, isOpen, onToggle, onClose, options, selected, onSelect,
}: {
  label: string; active: boolean; isOpen: boolean; onToggle: () => void; onClose: () => void;
  options: T[]; selected: T[]; onSelect: (v: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${active
          ? "border-blue-400 bg-blue-50 text-blue-600"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        {label}
        {active && <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">{selected.length}</span>}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-xs font-semibold text-gray-800">{label}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                <div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${selected.includes(opt) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}>
                  {selected.includes(opt) && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>
                  )}
                </div>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2">
            <button onClick={() => { selected.forEach(() => { }); options.forEach((o) => { if (selected.includes(o)) onSelect(o); }); }} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
