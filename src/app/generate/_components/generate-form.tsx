"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CertificateTemplate } from "@/lib/types";

interface GenerateFormProps {
  templates: CertificateTemplate[];
  initialTemplateId?: string;
}

export function GenerateForm({
  templates,
  initialTemplateId,
}: GenerateFormProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(initialTemplateId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId || !file) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("templateId", templateId);
      formData.append("file", file);

      const res = await fetch("/api/certificates/bulk", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push(`/jobs/${data.data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Select Template
        </label>
        <select
          required
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Choose a template...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.width}&times;{t.height})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Upload CSV
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          <input
            type="file"
            accept=".csv"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          CSV must include columns matching template variables (e.g. name, course, date)
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting || !templateId || !file} className="w-full">
        {submitting ? "Starting generation..." : "Generate Certificates"}
      </Button>
    </form>
  );
}
