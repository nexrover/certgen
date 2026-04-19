import { createClient } from "@/lib/supabase/server";
import { CsvUploadPanel } from "@/app/dashboard/_components/csv-upload-panel";
import { TemplateCard } from "@/app/dashboard/_components/template-card";
import type { Certificate, CertificateTemplate } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

type DashboardView = "templates" | "csvs" | "history";

interface CsvUploadItem {
  name: string;
  id: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    redirect("/login");
  }

  const { view: rawView } = await searchParams;
  const activeView: DashboardView =
    rawView === "csvs" || rawView === "history" ? rawView : "templates";

  const [templatesResult, certificatesResult] = await Promise.all([
    supabase
      .from("certificate_templates")
      .select("id, name, paper_size, created_at, updated_at, background_url")
      .eq("user_id", userId)
      .not("canvas_json", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("certificates")
      .select("id, template_id, file_url, storage_path, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  let csvUploads: CsvUploadItem[] = [];
  const { data: storageItems } = await supabase.storage
    .from("certificates")
    .list(`csv-uploads/${userId}`, {
      sortBy: { column: "created_at", order: "desc" },
      limit: 20,
    });

  csvUploads = (storageItems ?? []) as CsvUploadItem[];

  const templates = (templatesResult.data ?? []) as Pick<
    CertificateTemplate,
    "id" | "name" | "paper_size" | "created_at" | "updated_at" | "background_url"
  >[];
  const certificates = (certificatesResult.data ?? []) as Pick<
    Certificate,
    "id" | "template_id" | "file_url" | "storage_path" | "created_at"
  >[];

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage templates, CSV uploads, and generated certificates in one place.
        </p>
      </header>

      {activeView === "templates" ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Previously created templates
            </h2>
            {templates.length > 0 ? (
              <Link
                href="/builder"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Create Template
              </Link>
            ) : null}
          </div>

          {templates.length === 0 ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-dashed border-indigo-200 bg-linear-to-b from-white to-indigo-50/40">
              <Link
                href="/builder"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Create Template
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  createdAt={template.created_at}
                  backgroundUrl={template.background_url}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeView === "csvs" ? (
        <div className="space-y-6">
          <CsvUploadPanel />
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Previously uploaded CSVs</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                      File name
                    </th>
                    <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                      Last modified
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {csvUploads.map((csvItem) => (
                    <tr key={csvItem.name} className="odd:bg-white even:bg-gray-50/40">
                      <td className="border-b border-gray-100 px-3 py-2 text-gray-800">
                        {csvItem.name}
                      </td>
                      <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                        {formatDate(csvItem.updated_at ?? csvItem.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvUploads.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-500">
                  No CSV uploads found for your account.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {activeView === "history" ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Previously generated PDF certificates
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                    Certificate ID
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                    Template
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                    Created
                  </th>
                  <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr key={certificate.id} className="odd:bg-white even:bg-gray-50/40">
                    <td className="border-b border-gray-100 px-3 py-2 text-gray-800">
                      {certificate.id.slice(0, 8)}...
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                      {certificate.template_id.slice(0, 8)}...
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                      {formatDate(certificate.created_at)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 text-gray-700">
                      {certificate.file_url ? (
                        <a
                          href={certificate.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Open PDF
                        </a>
                      ) : (
                        "Unavailable"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {certificates.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500">
                No certificates generated yet.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
