import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";

export const metadata: Metadata = {
  title: "CertGen - Certificate Generator",
  description: "Bulk certificate generation SaaS",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <I18nProvider>
          <main className="">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
