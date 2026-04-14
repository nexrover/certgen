/**
 * Custom Templates Store — localStorage-backed persistence for auto-saved canvas snapshots.
 *
 * Each custom template stores:
 *  - id:        unique identifier (timestamp-based)
 *  - thumbnail: base64 data URL (small PNG)
 *  - canvasJson: full Fabric.js canvas JSON
 *  - paperSize: paper size key
 *  - width / height: canvas dimensions
 *  - updatedAt: ISO timestamp
 */

const STORAGE_KEY = "certgen_custom_templates";
const MAX_TEMPLATES = 20;

export interface CustomTemplate {
  id: string;
  thumbnail: string;
  canvasJson: Record<string, unknown>;
  paperSize: string;
  width: number;
  height: number;
  updatedAt: string;
}

function readAll(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomTemplate[];
  } catch {
    return [];
  }
}

function writeAll(templates: CustomTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage quota exceeded — drop oldest entries and retry
    const trimmed = templates.slice(0, Math.max(5, templates.length - 5));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }
}

/** Get all custom templates sorted by most-recently-updated first. */
export function getCustomTemplates(): CustomTemplate[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Save or update a custom template.
 * If a template with the same ID exists, it is updated in-place.
 * Otherwise a new entry is prepended. Older entries beyond MAX_TEMPLATES are evicted.
 */
export function saveCustomTemplate(template: CustomTemplate): void {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    all[idx] = template;
  } else {
    all.unshift(template);
  }
  // Cap at max, keeping newest
  const sorted = all.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  writeAll(sorted.slice(0, MAX_TEMPLATES));
}

/** Delete a custom template by ID. */
export function deleteCustomTemplate(id: string): void {
  writeAll(readAll().filter((t) => t.id !== id));
}

/** Generate a new unique ID for a custom template. */
export function newCustomTemplateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
