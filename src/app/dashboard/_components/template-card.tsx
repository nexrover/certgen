"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TemplateCardProps {
  id: string;
  name: string;
  createdAt: string | null;
  backgroundUrl: string | null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function TemplateCard({
  id,
  name,
  createdAt,
  backgroundUrl,
}: TemplateCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this template? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to delete template");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete template";
      window.alert(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-linear-to-br from-indigo-100 via-violet-50 to-white">
        {backgroundUrl ? (
          backgroundUrl.startsWith("data:image/") ? (
            <img
              src={backgroundUrl}
              alt={`${name} thumbnail`}
              className="h-full w-full object-contain bg-white p-1"
            />
          ) : (
            <Image
              src={backgroundUrl}
              alt={`${name} thumbnail`}
              fill
              className="h-full w-full object-contain bg-white p-1"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-indigo-500">
            <IconImage className="h-8 w-8" />
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-600/80">
              No thumbnail
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 flex items-center text-xs text-gray-500">
          <IconCalendar className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
          Last Created: {formatDate(createdAt)}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/builder/${id}`)}
            className="inline-flex items-center rounded-md border border-indigo-200 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            <IconPencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => router.push(`/templates/${id}`)}
            className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <IconEye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="inline-flex items-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconTrash className="mr-1.5 h-3.5 w-3.5" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
