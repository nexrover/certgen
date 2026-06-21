"use client";

import { useState, type ReactNode } from "react";
import { TemplatesPanel } from "./templates-panel";
import { TextPanel } from "./text-panel";
import { QrCodesPanel } from "./qrcodes-panel";
import { LayersPanel } from "./layers-panel";
import { AIPanel } from "./ai-panel";
import { ElementsPanel } from "./elements-panel";
import { ImagesPanel } from "./images-panel";
import { LayoutPanel } from "./layout-panel";
import { BrandKitPanel } from "./brand-kit-panel";
import type { Canvas } from "fabric";
import type { CustomTemplate } from "@/lib/custom-templates-store";
import type { ModalId } from "./_shared/types";
import type { PaperSize, BrandKit } from "@/lib/types";
import type { ColorPalette } from "@/lib/color-converter";
import {
  LuLayoutTemplate,
  LuShapes,
  LuType,
  LuQrCode,
  LuLayers,
  LuSparkles,
  LuLayoutGrid,
  LuImage,
  LuPalette,
} from "react-icons/lu";

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
    id: "layout",
    label: "Layout",
    icon: <LuLayoutGrid className="w-6 h-6" />,
  },
  {
    id: "elements",
    label: "Elements",
    icon: <LuShapes className="w-6 h-6" />,
  },
  {
    id: "images",
    label: "Images",
    icon: <LuImage className="w-6 h-6" />,
  },
  {
    id: "brand-kit",
    label: "Brand Kit",
    icon: <LuPalette className="w-6 h-6" />,
  },
  {
    id: "text",
    label: "Text",
    icon: <LuType className="w-6 h-6" />,
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

type TabId = "templates" | "layout" | "elements" | "images" | "brand-kit" | "text" | "qrcodes" | "layers" | "ai";

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
  category?: string;
  isLoading?: boolean;
  activeModal: ModalId;
  onOpenModal: (id: ModalId) => void;
  onCloseModal: () => void;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;

  brandKits: BrandKit[];
  brandKitsLoading: boolean;
  useBrandKit: boolean;
  onToggleUseBrandKit: (val: boolean) => void;
  activeBrandKitId: string | null;
  onBrandKitSelect: (id: string | null) => void;
  customPalettes: ColorPalette[];

  editingBrandKit: BrandKit | null;
  onUpdateEditingBrandKit: (updated: BrandKit | null) => void;
  onEditKit: (kit: BrandKit) => void;
  onAddCustomKit: () => void;
  onRenameKit: (kitId: string, name: string) => Promise<void>;
  onRemoveKit: (kitId: string) => Promise<void>;
}

export function Sidebar({
  canvas,
  onLoadTemplate,
  onBgSelected,
  customTemplates,
  onDeleteCustomTemplate,
  category = "certificate",
  isLoading = false,
  activeModal,
  onOpenModal,
  paperSize,
  onPaperSizeChange,
  brandKits,
  brandKitsLoading,
  useBrandKit,
  onToggleUseBrandKit,
  activeBrandKitId,
  onBrandKitSelect,
  customPalettes,
  editingBrandKit,
  onUpdateEditingBrandKit,
  onEditKit,
  onAddCustomKit,
  onRenameKit,
  onRemoveKit,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="sidebar-panel flex h-full min-h-0 w-[360px] shrink-0 overflow-hidden border-r border-gray-200 bg-white">
      <div className="sidebar-panel-scroll flex w-20 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-gray-100 bg-gray-50 py-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`group flex flex-col items-center gap-2 px-2 py-3 text-[11px] transition-all ${
              activeTab === tab.id
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
          <AIPanel
            onLoadTemplate={onLoadTemplate}
            category={category}
            onOpenModal={onOpenModal}
            paperSize={paperSize}
            onPaperSizeChange={onPaperSizeChange}
            brandKits={brandKits}
            brandKitsLoading={brandKitsLoading}
            useBrandKit={useBrandKit}
            onToggleUseBrandKit={onToggleUseBrandKit}
            activeBrandKitId={activeBrandKitId}
            onBrandKitSelect={onBrandKitSelect}
            customPalettes={customPalettes}
          />
        ) : (
          <div className="sidebar-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {activeTab === "templates" && (
              <div className="p-4">
                <TemplatesPanel
                  onLoadTemplate={onLoadTemplate}
                  customTemplates={customTemplates}
                  onDeleteCustomTemplate={onDeleteCustomTemplate}
                  category={category}
                  isLoading={isLoading}
                />
              </div>
            )}
            {activeTab === "text" && (
              <div className="p-4">
                <TextPanel canvas={canvas} />
              </div>
            )}
            {activeTab === "qrcodes" && (
              <div className="p-4">
                <QrCodesPanel canvas={canvas} />
              </div>
            )}
            {activeTab === "layers" && (
              <div className="p-4">
                <LayersPanel canvas={canvas} onBgSelected={onBgSelected} />
              </div>
            )}
            {activeTab === "layout" && (
              <LayoutPanel
                editingBrandKit={editingBrandKit}
                onChange={(updated) => {
                  onUpdateEditingBrandKit(updated);
                }}
              />
            )}
            {activeTab === "elements" && (
              <ElementsPanel canvas={canvas} />
            )}
            {activeTab === "images" && (
              <ImagesPanel canvas={canvas} />
            )}
            {activeTab === "brand-kit" && (
              <BrandKitPanel
                brandKits={brandKits}
                brandKitsLoading={brandKitsLoading}
                useBrandKit={useBrandKit}
                onToggleUseBrandKit={onToggleUseBrandKit}
                activeBrandKitId={activeBrandKitId}
                onBrandKitSelect={onBrandKitSelect}
                onOpenModal={onOpenModal}
                onAddCustomKit={onAddCustomKit}
                onEditKit={onEditKit}
                onRenameKit={onRenameKit}
                onRemoveKit={onRemoveKit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
