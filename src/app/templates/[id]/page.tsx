import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTemplateById } from "@/lib/services/template-service";
import { extractVariables } from "@/lib/engine/variable-replacer";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let template;
  try {
    template = await getTemplateById(id);
  } catch {
    notFound();
  }

  const variables = extractVariables(template);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/templates"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to templates
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {template.name}
          </h1>
          <p className="mt-1 text-gray-500">
            {template.width} &times; {template.height}px
          </p>
        </div>
        <Link href={`/generate?templateId=${template.id}`}>
          <Button>Generate Certificates</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            Template Variables
          </h3>
          {variables.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {variables.map((v) => (
                <span
                  key={v}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                >
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No variables found</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Fields</h3>
          <div className="space-y-2">
            {template.fields.map((field, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-700">
                    {field.type}
                  </span>
                  <span className="ml-2 text-gray-500">
                    &quot;{field.value}&quot;
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ({field.x}, {field.y})
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Raw JSON
          </h3>
          <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
            {JSON.stringify(template, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
