"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface TemplateCardActionsProps {
  templateId: string;
}

export function TemplateCardActions({ templateId }: TemplateCardActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this template? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Failed to delete template");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete template";
      window.alert(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => router.push(`/builder/${templateId}`)}
        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
      >
        <Pencil className="mr-1.5 h-4 w-4" />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => router.push(`/templates/${templateId}`)}
      >
        <Eye className="mr-1.5 h-4 w-4" />
        Preview
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
