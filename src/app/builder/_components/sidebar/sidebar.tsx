"use client";

import { useState, type ReactNode } from "react";
import { TemplatesPanel } from "./templates-panel";
import { UploadsPanel } from "./uploads-panel";
import { ElementsPanel } from "./elements-panel";
import { TextPanel } from "./text-panel";
import { AttributesPanel } from "./attributes-panel";
import { QrCodesPanel } from "./qrcodes-panel";
import { LayersPanel } from "./layers-panel";
import { AIPanel } from "./ai-panel";
import type { Canvas } from "fabric";
import type { CustomTemplate } from "@/lib/custom-templates-store";
import {
  LuLayoutTemplate,
  LuUpload,
  LuShapes,
  LuType,
  LuFileText,
  LuQrCode,
  LuLayers,
  LuSparkles,
  LuImport
} from "react-icons/lu";
import { ImportPanel } from "./import-panel";

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: "templates",
    label: "Templates",
    icon: <LuLayoutTemplate className="w-6 h-6" />,
  },
  {
    id: "ai",
    label: "AI Design",
    icon: <LuSparkles className="w-6 h-6" />,
  },
  {
    id: "import",
    label: "Import",
    icon: <LuImport className="w-6 h-6" />,
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: <LuUpload className="w-6 h-6" />,
  },
  {
    id: "elements",
    label: "Elements",
    icon: <LuShapes className="w-6 h-6" />,
  },
  {
    id: "text",
    label: "Text",
    icon: <LuType className="w-6 h-6" />,
  },
  {
    id: "attributes",
    label: "Attributes",
    icon: <LuFileText className="w-6 h-6" />,
  },
  {
    id: "qrcodes",
    label: "QR Codes",
    icon: <LuQrCode className="w-6 h-6" />,
  },
  {
    id: "layers",
    label: "Layers",
    icon: <LuLayers className="w-6 h-6" />,
  },
];

type TabId = "templates" | "uploads" | "elements" | "text" | "attributes" | "qrcodes" | "layers" | "ai" | "import";

interface SidebarProps {
  canvas: Canvas | null;
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void | Promise<void>;
  onBgSelected?: (selected: boolean) => void;
  customTemplates?: CustomTemplate[];
  onDeleteCustomTemplate?: (id: string) => void;
  /** Template category slug — drives which demo templates appear */
  category?: string;
  isLoading?: boolean;
}

export function Sidebar({ canvas, onLoadTemplate, onBgSelected, customTemplates, onDeleteCustomTemplate, category = "certificate", isLoading = false }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  return (
    <div className="sidebar-panel flex h-full min-h-0 w-[360px] shrink-0 overflow-hidden border-r border-gray-200 bg-white">
      <div className="sidebar-panel-scroll flex w-20 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-gray-100 bg-gray-50 py-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex flex-col items-center gap-2 px-2 py-3 text-[11px] transition-all ${activeTab === tab.id
              ? "bg-white text-indigo-600 font-bold shadow-sm"
              : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
              }`}
            title={tab.label}
          >
            <span className={`transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-105"}`}>
              {tab.icon}
            </span>
            <span className="font-medium tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === "ai" ? (
          <AIPanel onLoadTemplate={onLoadTemplate} category={category} />
        ) : (
          <div className="sidebar-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {activeTab === "templates" && <TemplatesPanel onLoadTemplate={onLoadTemplate} customTemplates={customTemplates} onDeleteCustomTemplate={onDeleteCustomTemplate} category={category} isLoading={isLoading} />}
            {activeTab === "import" && (
              <ImportPanel
                canvas={canvas}
                onLoadTemplate={onLoadTemplate}
                onImportSuccess={() => setActiveTab("layers")}
              />
            )}
            {activeTab === "uploads" && <UploadsPanel canvas={canvas} />}
            {activeTab === "elements" && <ElementsPanel canvas={canvas} />}
            {activeTab === "text" && <TextPanel canvas={canvas} />}
            {activeTab === "attributes" && <AttributesPanel canvas={canvas} />}
            {activeTab === "qrcodes" && <QrCodesPanel canvas={canvas} />}
            {activeTab === "layers" && <LayersPanel canvas={canvas} onBgSelected={onBgSelected} />}
          </div>
        )}
      </div>
    </div>
  );
}
