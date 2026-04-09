import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listTemplates } from "@/lib/services/template-service";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-gray-500">
            Manage your certificate templates
          </p>
        </div>
        <Link href="/templates/new">
          <Button>New Template</Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-500">No templates yet.</p>
          <Link
            href="/templates/new"
            className="mt-2 inline-block text-sm font-medium text-indigo-600"
          >
            Create your first template &rarr;
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} href={`/templates/${t.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{t.name}</CardTitle>
                  <CardDescription>
                    {t.width} &times; {t.height}px &middot;{" "}
                    {t.fields.length} field{t.fields.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <p className="text-xs text-gray-400">
                  Created {new Date(t.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
