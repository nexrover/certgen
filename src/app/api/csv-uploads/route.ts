import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "CSV file is required" },
        { status: 400 }
      );
    }

    const looksLikeCsv =
      ALLOWED_TYPES.includes(file.type) || file.name.toLowerCase().endsWith(".csv");

    if (!looksLikeCsv) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload a CSV file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `csv-uploads/${user.id}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(path, buffer, {
        contentType: "text/csv",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    return NextResponse.json(
      { success: true, data: { path, fileName: file.name, size: file.size } },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "CSV upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
