import { CertificateBuilder } from "./_components/certificate-builder";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { type } = await searchParams;
  const category = typeof type === "string" ? type : "certificate";

  return <CertificateBuilder category={category} />;
}
