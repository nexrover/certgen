"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">{t("dashboard.recipients.failed_load")}</h2>
        <p className="mt-2 text-sm text-red-700">
          {t("dashboard.recipients.failed_load_desc")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
