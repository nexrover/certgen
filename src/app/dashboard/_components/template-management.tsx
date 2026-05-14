"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiCopy,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { TemplateCard } from "./template-card";
import { useTranslation } from "react-i18next";
import type { TemplateCategoryConfig } from "@/lib/template-categories";

/* ─────────────────────────── types ─────────────────────────── */

interface Template {
  id: string;
  name: string;
  created_at: string | null;
  background_url: string | null;
}

interface TemplateManagementProps {
  templates: Template[];
  /** Category configuration — drives labels, empty-state copy, and create-button routing */
  categoryConfig: TemplateCategoryConfig;
}

type SortKey = "newest" | "oldest" | "a-z" | "z-a";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSortOptions = (t: any) => [
  { value: "newest", label: t("common.sort_newest", "Newest First") },
  { value: "oldest", label: t("common.sort_oldest", "Oldest First") },
  { value: "a-z", label: "A → Z" },
  { value: "z-a", label: "Z → A" },
];

/* ─────────────────────── sub-components ───────────────────── */

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  sortBy: SortKey;
  onSortChange: (v: SortKey) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkDuplicate?: () => void;
  onClearSelection: () => void;
  /** Label shown on the Create CTA */
  createLabel: string;
  /** href for the Create CTA */
  createHref: string;
}

function Toolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCount,
  onBulkDelete,
  onBulkDuplicate,
  onClearSelection,
  createLabel,
  createHref,
}: ToolbarProps) {
  const { t } = useTranslation();
  const hasSelection = selectedCount > 0;
  const SORT_OPTIONS = getSortOptions(t);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm transition-all">
      {/* ── Search ── */}
      <div className="relative min-w-[180px] flex-1">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t("common.search_templates", "Search templates...")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* ── Sort dropdown ── */}
      <div className="relative flex-shrink-0">
        <FiFilter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="h-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-700 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* ── Divider (bulk) ── */}
      {hasSelection && (
        <div className="h-6 w-px bg-gray-200 flex-shrink-0" aria-hidden />
      )}

      {/* ── Bulk actions ── */}
      {hasSelection && (
        <div className="flex flex-shrink-0 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {selectedCount} {t("dashboard.recipients.selected")}
          </span>

          {onBulkDuplicate && (
            <button
              type="button"
              onClick={onBulkDuplicate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
            >
              <FiCopy className="h-3.5 w-3.5" />
              Duplicate
            </button>
          )}

          <button
            type="button"
            onClick={onBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-95"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            {t("dashboard.recipients.delete_selected")}
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Divider (create) ── */}
      <div className="h-6 w-px bg-gray-200 flex-shrink-0 ml-auto" aria-hidden />

      {/* ── Create CTA ── */}
      <Link
        href={createHref}
        className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <FiPlus className="h-4 w-4" />
        {createLabel}
      </Link>
    </div>
  );
}

/* ───────────────────── main component ───────────────────────── */

export function TemplateManagement({
  templates: initialTemplates,
  categoryConfig,
}: TemplateManagementProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const { label, description, iconColorClass, builderHref } = categoryConfig;

  /* ── state ── */
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* sync if parent re-fetches */
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  /* ── debounced search (300 ms) ── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value), 300);
  }, []);

  /* ── derived list ── */
  const filteredAndSorted = templates
    .filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  /* ── single-card delete ── */
  const handleDeleted = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /* ── selection toggle ── */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ── bulk delete ── */
  const handleBulkDelete = useCallback(async () => {
    const count = selectedIds.size;
    const confirmed = window.confirm(
      `Delete ${count} template${count !== 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!confirmed) return;

    const ids = [...selectedIds];
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/templates/${id}?category=${categoryConfig.category}`, { method: "DELETE" }).then((r) => r.json())
      )
    );

    const failed: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected" || !result.value?.success) {
        failed.push(ids[i]);
      }
    });

    const succeeded = ids.filter((id) => !failed.includes(id));
    setTemplates((prev) => prev.filter((t) => !succeeded.includes(t.id)));
    setSelectedIds(new Set(failed));
    router.refresh();

    if (failed.length > 0) {
      window.alert(`${failed.length} template(s) could not be deleted.`);
    }
  }, [selectedIds, router]);

  /* ── bulk duplicate ── */
  const handleBulkDuplicate = useCallback(async () => {
    const ids = [...selectedIds];
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/templates/${id}/duplicate?category=${categoryConfig.category}`, { method: "POST" }).then((r) => r.json())
      )
    );

    const failed: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected" || !result.value?.success) {
        failed.push(ids[i]);
      }
    });

    // Refresh everything to show new "Copies"
    router.refresh();
    setSelectedIds(new Set());

    if (failed.length > 0) {
      window.alert(`${failed.length} template(s) could not be duplicated.`);
    }
  }, [selectedIds, router]);

  /* ── empty state ── */
  if (templates.length === 0 && !searchQuery) {
    return (
      <div className="flex h-[calc(100vh-18rem)] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-sm ${iconColorClass}`}>
            <FiPlus className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            No {label}s Yet
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            {description}
          </p>
          <Link
            href={builderHref}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <FiPlus className="h-5 w-5" />
            Create {label}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* ── Unified Toolbar ── */}
      <Toolbar
        searchQuery={searchInput}
        onSearchChange={handleSearchInput}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onBulkDuplicate={handleBulkDuplicate}
        onClearSelection={() => setSelectedIds(new Set())}
        createLabel={label}
        createHref={builderHref}
      />

      {/* ── Template Grid ── */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {filteredAndSorted.map((template) => (
            <div
              key={template.id}
              className="relative animate-in fade-in zoom-in-95 duration-300"
            >
              {/* Selection checkbox overlay */}
              <label
                className="absolute left-3 top-3 z-10 flex cursor-pointer items-center"
                aria-label={`Select ${template.name}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(template.id)}
                  onChange={() => toggleSelect(template.id)}
                  className="peer sr-only"
                />
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 shadow-sm transition-all",
                    selectedIds.has(template.id)
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 bg-white/90 text-transparent hover:border-indigo-400",
                  ].join(" ")}
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="1.5,6 4.5,9 10.5,3" />
                  </svg>
                </span>
              </label>

              {/* Card with selection ring */}
              <div
                className={[
                  "rounded-xl transition-all duration-150",
                  selectedIds.has(template.id)
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : "",
                ].join(" ")}
              >
                <TemplateCard
                  id={template.id}
                  name={template.name}
                  createdAt={template.created_at}
                  backgroundUrl={template.background_url}
                  onDeleted={handleDeleted}
                  onUpdated={() => router.refresh()}
                  category={categoryConfig.category}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            No templates match{" "}
            <span className="font-medium text-gray-700">
              &ldquo;{searchQuery}&rdquo;
            </span>
            .
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
            }}
            className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
