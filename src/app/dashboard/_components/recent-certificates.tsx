"use client";

import { FiMoreVertical, FiFileText } from "react-icons/fi";
interface RecentCertificatesProps {
  certificates: { id: string; template_id: string; created_at: string; file_url?: string; [key: string]: unknown }[];
}

export function RecentCertificates({ certificates }: RecentCertificatesProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Certificates</h3>
        <button className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
              <FiFileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">No certificates yet</p>
            <p className="text-xs text-gray-500 mt-1">Start by creating your first template.</p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex items-center gap-4 rounded-xl border border-gray-50 p-3 transition-all hover:border-indigo-100 hover:bg-indigo-50/30"
            >
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                {cert.file_url ? (
                   <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-400">
                     <FiFileText className="h-5 w-5" />
                   </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-300">
                    <FiFileText className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-sm font-bold text-gray-900">
                  {cert.id.slice(0, 12)}...
                </h4>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="font-medium">Template ID: {cert.template_id.slice(0, 8)}...</span>
                  <span>•</span>
                  <span>{new Date(cert.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  Completed
                </span>
              </div>
              <div className="hidden md:block text-right min-w-[100px]">
                <p className="text-xs font-bold text-gray-700">1 Recipient</p>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <FiMoreVertical className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
