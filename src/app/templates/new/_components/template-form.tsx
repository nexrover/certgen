"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TemplateField } from "@/lib/types";

const EMPTY_FIELD: TemplateField = {
  type: "text",
  value: "",
  x: 960,
  y: 400,
  fontSize: 24,
  color: "#000000",
};

export function TemplateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([{ ...EMPTY_FIELD }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(index: number, updates: Partial<TemplateField>) {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  function addField() {
    setFields((prev) => [...prev, { ...EMPTY_FIELD, y: 400 + prev.length * 60 }]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          width,
          height,
          backgroundUrl: backgroundUrl || null,
          fields,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push(`/templates/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  const templateJson = JSON.stringify(
    { name, width, height, backgroundUrl: backgroundUrl || null, fields },
    null,
    2
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Course Completion"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Width (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Height (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Background URL (optional)
          </label>
          <input
            type="url"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="https://example.com/bg.png"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Fields</h3>
            <Button type="button" variant="secondary" onClick={addField}>
              + Add Field
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Field {i + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(i, { type: e.target.value as "text" | "image" })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Value
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateField(i, { value: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="{{name}} or static text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={field.x}
                      onChange={(e) => updateField(i, { x: Number(e.target.value) })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={field.y}
                      onChange={(e) => updateField(i, { y: Number(e.target.value) })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  {field.type === "text" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={field.fontSize ?? 16}
                          onChange={(e) =>
                            updateField(i, { fontSize: Number(e.target.value) })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Color
                        </label>
                        <input
                          type="color"
                          value={field.color ?? "#000000"}
                          onChange={(e) => updateField(i, { color: e.target.value })}
                          className="h-8 w-full rounded border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {field.type === "image" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Width
                        </label>
                        <input
                          type="number"
                          value={field.width ?? 100}
                          onChange={(e) =>
                            updateField(i, { width: Number(e.target.value) })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Height
                        </label>
                        <input
                          type="number"
                          value={field.height ?? 100}
                          onChange={(e) =>
                            updateField(i, { height: Number(e.target.value) })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating..." : "Create Template"}
        </Button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          JSON Preview
        </h3>
        <pre className="max-h-[600px] overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
          {templateJson}
        </pre>
      </div>
    </form>
  );
}
