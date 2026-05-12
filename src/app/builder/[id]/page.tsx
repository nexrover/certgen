import { getTemplateById } from "@/lib/services/template-service";
import { CertificateBuilder } from "../_components/certificate-builder";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EditBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let template;
  try {
    template = await getTemplateById(id, user.id);
  } catch {
    notFound();
  }
  return <CertificateBuilder initialTemplate={template} category={template.category ?? "certificate"} />;
}
