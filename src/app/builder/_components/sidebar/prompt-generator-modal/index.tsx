"use client";

import { useState } from "react";
import { LuX, LuSparkles } from "react-icons/lu";
import type { BrandKit, BrandKitLayout } from "@/lib/types";
import type { PromptGeneratorSelections } from "../_shared/types";
import { PromptGeneratorLeftPanel } from "./left-panel";
import { PromptGeneratorRightPanel } from "./right-panel";

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selections: PromptGeneratorSelections;
  onUpdateSelections: (updates: Partial<PromptGeneratorSelections>) => void;
  brandKits: BrandKit[];
  customLayouts: BrandKitLayout[];
  onProcess: (prompt: string) => void;
}

export function PromptGeneratorModal({
  isOpen,
  onClose,
  selections,
  onUpdateSelections,
  brandKits,
  customLayouts,
  onProcess,
}: PromptGeneratorModalProps) {
  const [notePrompt, setNotePrompt] = useState("");

  if (!isOpen) return null;

  const handleProcess = () => {
    onProcess(notePrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[85vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LuSparkles className="w-5 h-5 text-indigo-600" />
              Prompt Generator Workspace
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure your design preferences and generate a custom prompt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Selection List */}
          <div className="w-[45%] border-r border-gray-100 overflow-y-auto custom-scrollbar p-6">
            <PromptGeneratorLeftPanel
              selections={selections}
              onUpdateSelections={onUpdateSelections}
              brandKits={brandKits}
              customLayouts={selections.brandKit?.custom_layouts ?? []}
            />
          </div>

          {/* Right Panel: Active Selections Carousel + Note */}
          <div className="flex-[1] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {/* Active Selections Carousel */}
              <PromptGeneratorRightPanel selections={selections} />

              {/* Note/Prompt Textarea */}
              <div className="mt-6">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Additional Notes / Custom Directives
                </label>
                <textarea
                  value={notePrompt}
                  onChange={(e) => setNotePrompt(e.target.value)}
                  placeholder="Add any extra instructions or custom system directives for the AI..."
                  className="w-full h-32 text-xs outline-none resize-none placeholder:text-gray-300 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all custom-scrollbar"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-2"
              >
                <LuSparkles className="w-4 h-4" />
                Process
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
