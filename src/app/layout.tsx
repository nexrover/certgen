import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertGen - Certificate Generator",
  description: "Bulk certificate generation SaaS",
};

function Nav() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          CertGen
        </Link>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/builder" className="hover:text-gray-900">
            Builder
          </Link>
          <Link href="/templates" className="hover:text-gray-900">
            Templates
          </Link>
          <Link href="/generate" className="hover:text-gray-900">
            Generate
          </Link>
        </div>
      </div>
    </nav>
  );
}

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
