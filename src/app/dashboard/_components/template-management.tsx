"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import { TemplateCard } from "./template-card";

interface Template {
  id: string;
  name: string;
  created_at: string | null;
  background_url: string | null;
}

interface TemplateManagementProps {
  templates: Template[];
}

export function TemplateManagement({ templates: initialTemplates }: TemplateManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");
  const [templates, setTemplates] = useState(initialTemplates);

  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  const handleDeleted = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredAndSortedTemplates = templates
    .filter((template) => template.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === "a-z") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "z-a") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  if (templates.length === 0 && !searchQuery) {
    return (
      <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-sm">
            <FiPlus className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">No Templates Found</h3>
          <p className="mb-6 text-sm text-gray-500">
            You haven&apos;t created any certificate templates yet. Start by creating your first professional certificate template.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <FiPlus className="h-5 w-5" />
            Create Certificate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-md w-full">
            <FiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "a-z" | "z-a")}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Name (A-Z)</option>
              <option value="z-a">Name (Z-A)</option>
            </select>
            <FiFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <Link
          href="/builder"
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
        >
          <FiPlus className="h-4 w-4" />
          Create Certificate
        </Link>
      </div>

      {/* Templates Grid */}
      {filteredAndSortedTemplates.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {filteredAndSortedTemplates.map((template) => (
            <div key={template.id} className="animate-in fade-in zoom-in-95 duration-300">
              <TemplateCard
                id={template.id}
                name={template.name}
                createdAt={template.created_at}
                backgroundUrl={template.background_url}
                onDeleted={handleDeleted}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
          <p className="text-gray-500">No templates found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
