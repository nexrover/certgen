"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Dashboard failed to load</h2>
        <p className="mt-2 text-sm text-red-700">
          A section of the dashboard crashed. Refresh this view to retry.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
