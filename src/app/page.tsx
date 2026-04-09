import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mb-8 text-gray-500">
        Create certificate templates and generate bulk certificates from CSV data.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/builder">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Visual Builder</CardTitle>
              <CardDescription>
                Design certificates with a drag-and-drop visual editor. Add text,
                shapes, images, QR codes, and dynamic variables.
              </CardDescription>
            </CardHeader>
            <span className="text-sm font-medium text-indigo-600">
              Open builder &rarr;
            </span>
          </Card>
        </Link>

        <Link href="/generate">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Generate Certificates</CardTitle>
              <CardDescription>
                Upload a CSV file and generate certificates in bulk using an
                existing template.
              </CardDescription>
            </CardHeader>
            <span className="text-sm font-medium text-indigo-600">
              Start generating &rarr;
            </span>
          </Card>
        </Link>

        <Link href="/templates">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>View Templates</CardTitle>
              <CardDescription>
                Browse and manage your saved certificate templates.
              </CardDescription>
            </CardHeader>
            <span className="text-sm font-medium text-indigo-600">
              View all &rarr;
            </span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
