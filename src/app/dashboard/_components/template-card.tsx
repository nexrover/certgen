"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiEdit3, FiCopy, FiEye, FiTrash2, FiLoader, FiCalendar, FiImage } from "react-icons/fi";
import { PreviewModal } from "@/app/builder/_components/preview-modal";

interface TemplateCardProps {
  id: string;
  name: string;
  createdAt: string | null;
  backgroundUrl: string | null;
  onDeleted?: (id: string) => void;
  onUpdated?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(value: string | null | undefined, t: any) {
  if (!value) return t("dashboard.templates.unknown");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("dashboard.templates.unknown");
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function TemplateCard({
  id,
  name,
  createdAt,
  backgroundUrl,
  onDeleted,
  onUpdated,
}: TemplateCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [renaming, setRenaming] = useState(false);
  const [previewData, setPreviewData] = useState<{ canvasJson: Record<string, unknown>; width: number; height: number } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      t("dashboard.templates.delete_confirm")
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? t("dashboard.templates.delete_error"));
      }

      if (onDeleted) {
        onDeleted(id);
      }
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("dashboard.templates.delete_error");
      window.alert(message);
    } finally {
      setDeleting(false);
    }
  }

  async function handlePreview() {
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/templates/${id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setPreviewData({
          canvasJson: result.data.canvas_json || {},
          width: result.data.width || 800,
          height: result.data.height || 600,
        });
      } else {
        throw new Error(result.error || t("dashboard.templates.preview_error"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("dashboard.templates.preview_error");
      window.alert(message);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleRename() {
    if (!newName.trim() || newName === name) {
      setIsRenaming(false);
      return;
    }
    setRenaming(true);
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const result = await response.json();
      if (result.success) {
        setIsRenaming(false);
        if (onUpdated) onUpdated();
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to rename");
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to rename");
    } finally {
      setRenaming(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const response = await fetch(`/api/templates/${id}/duplicate`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.success) {
        if (onUpdated) onUpdated();
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to duplicate");
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to duplicate");
    } finally {
      setDuplicating(false);
    }
  }

  return (
    <article className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="relative flex w-full aspect-[1.5] items-center justify-center overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
        {backgroundUrl ? (
          backgroundUrl.startsWith("data:image/") ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={backgroundUrl}
              alt={`${name} thumbnail`}
              className="h-full w-full object-contain bg-white"
            />
          ) : (
            <Image
              src={backgroundUrl}
              alt={`${name} thumbnail`}
              fill
              className="h-full w-full object-contain bg-white"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-indigo-500">
            <FiImage className="h-8 w-8" />
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-600/80">
              {t("dashboard.templates.no_thumbnail")}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        {isRenaming ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setNewName(name);
                }
              }}
              disabled={renaming}
              className="flex-1 rounded-md border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleRename}
              disabled={renaming}
              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              {renaming ? <FiLoader className="animate-spin h-4 w-4" /> : <FiEdit3 className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 group/title">
            <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{name}</h3>
            <button
              onClick={() => setIsRenaming(true)}
              className="mt-1 opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600"
              title="Rename"
            >
              <FiEdit3 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <p className="mt-1 flex items-center text-xs text-gray-500">
          <FiCalendar className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
          {t("dashboard.templates.last_created")}: {formatDate(createdAt, t)}
        </p>

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/builder/${id}`)}
            className="flex-1 min-w-[80px] inline-flex justify-center items-center rounded-md border border-indigo-200 px-2 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            <FiEdit3 className="mr-1.5 h-3.5 w-3.5" />
            {t("common.edit")}
          </button>
          <button
            type="button"
            disabled={loadingPreview}
            onClick={handlePreview}
            className="flex-1 min-w-[80px] inline-flex justify-center items-center rounded-md border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingPreview ? (
              <FiLoader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiEye className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("dashboard.templates.preview")}
          </button>
          <button
            type="button"
            disabled={duplicating}
            onClick={handleDuplicate}
            className="flex-1 min-w-[80px] inline-flex justify-center items-center rounded-md border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {duplicating ? (
              <FiLoader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiCopy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Duplicate
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="flex-1 min-w-[80px] inline-flex justify-center items-center rounded-md border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <FiLoader className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiTrash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            {deleting ? t("dashboard.templates.deleting") : t("common.delete")}
          </button>
        </div>
      </div>
      {previewData && (
        <PreviewModal
          open={true}
          onClose={() => setPreviewData(null)}
          canvasJson={previewData.canvasJson}
          width={previewData.width}
          height={previewData.height}
        />
      )}
    </article>
  );
}
