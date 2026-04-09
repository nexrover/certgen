"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card } from "@/components/ui/card";
import type { GenerationJob, Certificate } from "@/lib/types";

interface JobPollerProps {
  jobId: string;
  initialJob: GenerationJob;
  initialCertificates: Certificate[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
};

export function JobPoller({
  jobId,
  initialJob,
  initialCertificates,
}: JobPollerProps) {
  const [job, setJob] = useState<GenerationJob>(initialJob);
  const [certificates, setCertificates] =
    useState<Certificate[]>(initialCertificates);

  const isTerminal = job.status === "completed" || job.status === "failed";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.data.job);
        setCertificates(data.data.certificates ?? []);
      }
    } catch {
      // Silently retry on next interval
    }
  }, [jobId]);

  useEffect(() => {
    if (isTerminal) return;
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [isTerminal, poll]);

  const statusInfo = STATUS_LABELS[job.status] ?? STATUS_LABELS.pending;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>
              Processed: {job.processed_count + job.error_count} /{" "}
              {job.total_count}
            </p>
            {job.error_count > 0 && (
              <p className="text-red-500">{job.error_count} errors</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar
            value={job.processed_count + job.error_count}
            max={job.total_count}
          />
        </div>
      </Card>

      {job.errors && job.errors.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-red-700">Errors</h3>
          <div className="max-h-40 space-y-1 overflow-auto">
            {job.errors.map((err, i) => (
              <p key={i} className="text-sm text-red-600">
                Row {err.row}: {err.message}
              </p>
            ))}
          </div>
        </Card>
      )}

      {certificates.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Generated Certificates ({certificates.length})
          </h3>
          <div className="max-h-80 space-y-2 overflow-auto">
            {certificates.map((cert, i) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm text-gray-700">
                  Certificate #{i + 1}
                </span>
                {cert.file_url ? (
                  <a
                    href={cert.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Download PDF
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">Processing...</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {isTerminal && (
        <div className="flex gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Generate More
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            View Templates
          </Link>
        </div>
      )}
    </div>
  );
}
