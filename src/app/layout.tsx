import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {/* <Nav /> */}
        <main className="">{children}</main>
      </body>
    </html>
  );
}
