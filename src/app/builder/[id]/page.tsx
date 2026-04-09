import { getTemplateById } from "@/lib/services/template-service";
import { CertificateBuilder } from "../_components/certificate-builder";
import { notFound } from "next/navigation";

export default async function EditBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let template;
  try {
    template = await getTemplateById(id);
  } catch {
    notFound();
  }
  return <CertificateBuilder initialTemplate={template} />;
}
