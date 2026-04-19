import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { listTemplates } from "@/lib/services/template-service";
import { CalendarClock, FilePlus2, ImageIcon, LayoutTemplate } from "lucide-react";
import { TemplateCardActions } from "./_components/template-card-actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const templates = await listTemplates(user.id);

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your certificate templates
          </p>
        </div>
        {templates.length > 0 ? (
          <Link href="/builder/new">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-500">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        ) : null}
      </div>

      {templates.length === 0 ? (
        <section className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-linear-to-b from-white to-indigo-50/40 px-6 text-center">
          <div className="mb-5 rounded-full bg-indigo-100 p-4 text-indigo-600">
            <LayoutTemplate className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">No templates yet</h2>
          <p className="mt-2 max-w-md text-sm text-gray-600">
            Start by creating your first certificate template in the builder.
          </p>
          <Link href="/builder/new" className="mt-6">
            <Button
              size="lg"
              className="bg-indigo-600 px-8 text-base text-white hover:bg-indigo-500"
            >
              <FilePlus2 className="mr-2 h-5 w-5" />
              Create Template
            </Button>
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <article
              key={t.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="relative flex aspect-video items-center justify-center bg-linear-to-br from-indigo-100 via-violet-50 to-white">
                {t.background_url ? (
                  <Image
                    src={t.background_url}
                    alt={`${t.name} thumbnail`}
                    fill
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-indigo-500">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs font-medium uppercase tracking-wide text-indigo-600/80">
                      No thumbnail
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{t.name}</h3>
                <p className="mt-1 flex items-center text-xs text-gray-500">
                  <CalendarClock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                  Last Created Date: {formatDate(t.created_at)}
                </p>
                <TemplateCardActions templateId={t.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
