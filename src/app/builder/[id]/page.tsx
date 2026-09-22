import { getTemplateById } from "@/lib/services/template-service";
import { CertificateBuilder } from "../_components/certificate-builder";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EditBuilderPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let template;
  try {
    template = await getTemplateById(id, user.id, type);
  } catch {
    notFound();
  }
  return <CertificateBuilder initialTemplate={template} category={template.category ?? "certificate"} />;
}
