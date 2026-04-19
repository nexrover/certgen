import Link from "next/link";
import { redirect } from "next/navigation";
import { listTemplates } from "@/lib/services/template-service";
import { GenerateForm } from "./_components/generate-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { templateId } = await searchParams;
  const templates = await listTemplates(user.id);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Generate Certificates
      </h1>
      <p className="mb-8 text-gray-500">
        Select a template and upload a CSV file to generate certificates in
        bulk.
      </p>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No templates available. Create one first.
          </p>
          <Link
            href="/templates/new"
            className="mt-2 inline-block text-sm font-medium text-indigo-600"
          >
            Create template &rarr;
          </Link>
        </div>
      ) : (
        <GenerateForm templates={templates} initialTemplateId={templateId} />
      )}
    </div>
  );
}
