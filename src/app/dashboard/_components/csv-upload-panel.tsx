"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type PreviewRow = Record<string, string>;

interface ParseResult {
  headers: string[];
  rows: PreviewRow[];
}

function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<PreviewRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = Array.isArray(results.meta.fields) ? results.meta.fields : [];
        const rows = Array.isArray(results.data) ? results.data.slice(0, 8) : [];
        resolve({ headers, rows });
      },
      error: (error) => reject(error),
    });
  });
}

export function CsvUploadPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasPreview = useMemo(() => headers.length > 0 && rows.length > 0, [headers, rows]);

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setError(null);
    setHeaders([]);
    setRows([]);

    if (!nextFile) return;

    try {
      const parsed = await parseCsv(nextFile);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : t("dashboard.recipients.parse_error");
      setError(message);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/csv-uploads", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? t("dashboard.csv_upload.upload_failed"));
      }

      router.refresh();
      setFile(null);
      setHeaders([]);
      setRows([]);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : t("dashboard.csv_upload.upload_error");
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.csv_upload.title")}</h2>
          <p className="text-sm text-gray-500">{t("dashboard.csv_upload.subtitle")}</p>
        </div>
        <button
          type="button"
          disabled={!file || isUploading}
          onClick={() => void handleUpload()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? t("dashboard.recipients.uploading") : t("dashboard.recipients.upload_csv")}
        </button>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-gray-700">{t("dashboard.csv_upload.select_file")}</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {hasPreview ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${rowIndex}-${headers.join("-")}`} className="odd:bg-white even:bg-gray-50/40">
                    {headers.map((header) => (
                      <td key={`${rowIndex}-${header}`} className="border-b border-gray-100 px-3 py-2 text-gray-700">
                        {row[header] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
            {t("dashboard.csv_upload.preview_info", { count: rows.length })}
          </p>
        </div>
      ) : null}
    </section>
  );
}
