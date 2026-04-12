"use client";

import { useState, type ReactNode } from "react";
import { TemplatesPanel } from "./templates-panel";
import { UploadsPanel } from "./uploads-panel";
import { ElementsPanel } from "./elements-panel";
import { TextPanel } from "./text-panel";
import { AttributesPanel } from "./attributes-panel";
import { QrCodesPanel } from "./qrcodes-panel";
import { LayersPanel } from "./layers-panel";
import type { Canvas } from "fabric";

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${className}`}>
      {children}
    </svg>
  );
}

const TABS: { id: string; label: string; icon: ReactNode }[] = [
  {
    id: "templates",
    label: "Templates",
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </Icon>
    ),
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: (
      <Icon>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </Icon>
    ),
  },
  {
    id: "elements",
    label: "Elements",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="3" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </Icon>
    ),
  },
  {
    id: "text",
    label: "Text",
    icon: (
      <Icon>
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </Icon>
    ),
  },
  {
    id: "attributes",
    label: "Attributes",
    icon: (
      <Icon>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </Icon>
    ),
  },
  {
    id: "qrcodes",
    label: "QR Codes",
    icon: (
      <Icon>
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" />
        <line x1="22" y1="14" x2="22" y2="22" />
        <line x1="14" y1="22" x2="22" y2="22" />
      </Icon>
    ),
  },
  {
    id: "layers",
    label: "Layers",
    icon: (
      <Icon>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </Icon>
    ),
  },
];

type TabId = "templates" | "uploads" | "elements" | "text" | "attributes" | "qrcodes" | "layers";

interface SidebarProps {
  canvas: Canvas | null;
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  onBgSelected?: (selected: boolean) => void;
}

export function Sidebar({ canvas, onLoadTemplate, onBgSelected }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  return (
    <div className="flex h-full w-72 shrink-0 border-r border-gray-200 bg-white">
      <div className="flex w-14 flex-col border-r border-gray-100 bg-gray-50 py-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`group flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] transition-all ${activeTab === tab.id
                ? "bg-white text-indigo-600 font-semibold shadow-sm"
                : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
              }`}
            title={tab.label}
          >
            <span className={`transition-transform ${activeTab === tab.id ? "scale-110" : "group-hover:scale-105"}`}>
              {tab.icon}
            </span>
            <span className="leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "templates" && <TemplatesPanel onLoadTemplate={onLoadTemplate} />}
        {activeTab === "uploads" && <UploadsPanel canvas={canvas} />}
        {activeTab === "elements" && <ElementsPanel canvas={canvas} />}
        {activeTab === "text" && <TextPanel canvas={canvas} />}
        {activeTab === "attributes" && <AttributesPanel canvas={canvas} />}
        {activeTab === "qrcodes" && <QrCodesPanel canvas={canvas} />}
        {activeTab === "layers" && <LayersPanel canvas={canvas} onBgSelected={onBgSelected} />}
      </div>
    </div>
  );
}
