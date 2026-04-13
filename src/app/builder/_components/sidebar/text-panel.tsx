"use client";

import { addTextbox, addTextComboGroup } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface TextPanelProps {
  canvas: Canvas | null;
}

/* ── Quick-add text style buttons ────────────────────────────── */
const TEXT_STYLES = [
  { label: "Heading", fontSize: 48, fontWeight: "bold", text: "Heading" },
  { label: "Subheading", fontSize: 28, fontWeight: "600", text: "Subheading" },
  { label: "Body Text", fontSize: 16, fontWeight: "normal", text: "Body text" },
];

/* ── Combination definitions ─────────────────────────────────── */
interface ComboItem {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
}

interface TextCombo {
  id: string;
  previewBg?: string;           // card background colour
  previewTextColor?: string;    // dominant text colour on card
  items: ComboItem[];
}

const TEXT_COMBOS: TextCombo[] = [
  {
    id: "certificate-title",
    items: [
      { text: "CERTIFICATE", fontSize: 36, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "OF ACHIEVEMENT", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#555555" },
    ],
  },
  {
    id: "certificate-completion",
    items: [
      { text: "CERTIFICATE OF COMPLETION", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "[recipient.name]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
    ],
  },
  {
    id: "signature-block",
    previewBg: "#5c4033",
    previewTextColor: "#ffffff",
    items: [
      { text: "Signature", fontSize: 32, fontWeight: "normal", fontFamily: "'Great Vibes', cursive", fontStyle: "italic", textAlign: "center" },
      { text: "Name Surname", fontSize: 14, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "Program Mentor", fontSize: 11, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
  {
    id: "issue-date",
    items: [
      { text: "[certificate.issued_on]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
      { text: "Issue Date", fontSize: 14, fontWeight: "600", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
  {
    id: "name-role",
    items: [
      { text: "Name Surname", fontSize: 16, fontWeight: "bold", fontFamily: "Georgia", textAlign: "center" },
      { text: "Program Mentor", fontSize: 12, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
    ],
  },
  {
    id: "certificate-id",
    items: [
      { text: "[certificate.uuid]", fontSize: 13, fontWeight: "normal", fontFamily: "Georgia", textAlign: "center", fill: "#666666" },
      { text: "Certificate ID", fontSize: 14, fontWeight: "600", fontFamily: "Georgia", textAlign: "center" },
    ],
  },
];

/* ── Preview renderers for each combo card ───────────────────── */
function CertificateTitlePreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-3">
      <div className="mb-0.5 h-px w-12 bg-gray-300" />
      <span style={{ fontFamily: "Georgia", fontSize: 16, fontWeight: "bold", letterSpacing: 2 }}>
        CERTIFICATE
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 8, fontWeight: "normal", color: "#888", letterSpacing: 1.5 }}>
        OF ACHIEVEMENT
      </span>
      <div className="mt-0.5 h-px w-12 bg-gray-300" />
    </div>
  );
}

function CertificateCompletionPreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-3">
      <span style={{ fontFamily: "Georgia", fontSize: 8, fontWeight: "bold", letterSpacing: 1, textAlign: "center" }}>
        CERTIFICATE OF COMPLETION
      </span>
      <div className="flex items-center gap-1">
        <div className="h-px w-6 bg-gray-300" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-px w-6 bg-gray-300" />
      </div>
      <span style={{ fontFamily: "Georgia", fontSize: 8, color: "#888" }}>
        [recipient.name]
      </span>
    </div>
  );
}

function SignatureBlockPreview() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 rounded py-4"
    >
      <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: 18, fontStyle: "italic" }}>
        Signature
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 9, fontWeight: "bold", color: "#888" }}>
        Name Surname
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 7, color: "#888" }}>
        Program Mentor
      </span>
    </div>
  );
}

function IssueDatePreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-5">
      <span style={{ fontFamily: "Georgia", fontSize: 9, color: "#888" }}>
        [certificate.issued_on]
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 10, fontWeight: "600" }}>
        Issue Date
      </span>
    </div>
  );
}

function NameRolePreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-5">
      <span style={{ fontFamily: "Georgia", fontSize: 11, fontWeight: "bold" }}>
        Name Surname
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 9, color: "#888" }}>
        Program Mentor
      </span>
    </div>
  );
}

function CertificateIdPreview() {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 py-5">
      <span style={{ fontFamily: "Georgia", fontSize: 9, color: "#888" }}>
        [certificate.uuid]
      </span>
      <span style={{ fontFamily: "Georgia", fontSize: 10, fontWeight: "600" }}>
        Certificate ID
      </span>
    </div>
  );
}

const COMBO_PREVIEWS: Record<string, React.FC> = {
  "certificate-title": CertificateTitlePreview,
  "certificate-completion": CertificateCompletionPreview,
  "signature-block": SignatureBlockPreview,
  "issue-date": IssueDatePreview,
  "name-role": NameRolePreview,
  "certificate-id": CertificateIdPreview,
};

/* ── Component ───────────────────────────────────────────────── */
export function TextPanel({ canvas }: TextPanelProps) {
  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  const handleAddCombo = (combo: TextCombo) => {
    addTextComboGroup(canvas, combo.items);
  };

  return (
    <div className="space-y-5">
      {/* Text Styles */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Text Styles</h3>
        <div className="space-y-1.5">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.label}
              onClick={() =>
                addTextbox(canvas, s.text, {
                  fontSize: s.fontSize,
                  fontWeight: s.fontWeight,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 transition-colors text-center hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span
                style={{
                  fontSize: Math.min(s.fontSize, 20),
                  fontWeight: s.fontWeight,
                }}
                className="text-gray-800"
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Combinations grid */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
          Combinations
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {TEXT_COMBOS.map((combo) => {
            const Preview = COMBO_PREVIEWS[combo.id];
            return (
              <button
                key={combo.id}
                onClick={() => handleAddCombo(combo)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition-all hover:border-indigo-300 hover:shadow-sm"
              >
                {Preview && <Preview />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
