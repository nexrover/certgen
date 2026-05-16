interface PresetTemplate {
  name: string;
  width: number;
  height: number;
  paperSize: string;
  canvasJson: Record<string, unknown>;
}

function tb(text: string, opts: Record<string, unknown>) {
  return { type: "Textbox", selectable: true, fontFamily: "Georgia", ...opts, text };
}

function rect(opts: Record<string, unknown>) {
  return { type: "Rect", selectable: true, ...opts };
}

function line(opts: Record<string, unknown>) {
  return { type: "Line", selectable: true, ...opts };
}

const L = { w: 842, h: 595 };
const P = { w: 595, h: 842 };
const YT = { w: 1280, h: 720 };

function img(src: string, opts: Record<string, unknown>) {
  return { type: "image", src, crossOrigin: "anonymous", selectable: true, ...opts };
}

function cx(canvasW: number, objW: number) {
  return (canvasW - objW) / 2;
}

export const PRESET_TEMPLATES: Record<string, PresetTemplate> = {
  "course-completion": {
    name: "Course Completion",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 20, top: 20, width: 802, height: 555, fill: "transparent", stroke: "#1e3a5f", strokeWidth: 3, rx: 8, ry: 8 }),
        rect({ left: 30, top: 30, width: 782, height: 535, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1.5, rx: 4, ry: 4 }),
        tb("CERTIFICATE", { left: cx(L.w, 500), top: 60, width: 500, fontSize: 14, fill: "#c9a84c", textAlign: "center", charSpacing: 600 }),
        tb("OF COMPLETION", { left: cx(L.w, 600), top: 90, width: 600, fontSize: 36, fontWeight: "bold", fill: "#1e3a5f", textAlign: "center" }),
        tb("This is to certify that", { left: cx(L.w, 500), top: 160, width: 500, fontSize: 14, fill: "#555555", textAlign: "center" }),
        tb("{{name}}", { left: cx(L.w, 500), top: 195, width: 500, fontSize: 32, fontWeight: "bold", fill: "#1e3a5f", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 400, y2: 0, left: cx(L.w, 400), top: 245, stroke: "#c9a84c", strokeWidth: 1 }),
        tb("has successfully completed the course requirements and is hereby awarded this certificate of completion.", { left: cx(L.w, 600), top: 265, width: 600, fontSize: 13, fill: "#555555", textAlign: "center", lineHeight: 1.6 }),
        tb("Issued on {{issued_date}}", { left: cx(L.w, 400), top: 345, width: 400, fontSize: 12, fill: "#777777", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}\nInstructor", { left: 190, top: 430, width: 200, fontSize: 11, fill: "#333333", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nAuthorized Signature\nDirector", { left: 460, top: 430, width: 200, fontSize: 11, fill: "#333333", textAlign: "center", lineHeight: 1.5 }),
        tb("Certificate ID: {{certificate_id}}", { left: cx(L.w, 300), top: 545, width: 300, fontSize: 9, fill: "#999999", textAlign: "center" }),
      ],
    },
  },

  "achievement-award": {
    name: "Achievement Award",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#0f172a",
      objects: [
        rect({ left: 0, top: 0, width: L.w, height: L.h, fill: "#0f172a" }),
        rect({ left: 15, top: 15, width: 812, height: 565, fill: "transparent", stroke: "#f59e0b", strokeWidth: 2 }),
        tb("\u2605 AWARD OF ACHIEVEMENT \u2605", { left: cx(L.w, 600), top: 55, width: 600, fontSize: 28, fontWeight: "bold", fill: "#f59e0b", textAlign: "center", charSpacing: 200 }),
        line({ x1: 0, y1: 0, x2: 300, y2: 0, left: cx(L.w, 300), top: 105, stroke: "#f59e0b", strokeWidth: 1 }),
        tb("Presented to", { left: cx(L.w, 500), top: 125, width: 500, fontSize: 16, fill: "#94a3b8", textAlign: "center" }),
        tb("{{name}}", { left: cx(L.w, 600), top: 165, width: 600, fontSize: 44, fontWeight: "bold", fill: "#ffffff", textAlign: "center" }),
        tb("In recognition of outstanding achievement and exceptional dedication to excellence.", { left: cx(L.w, 550), top: 235, width: 550, fontSize: 14, fill: "#94a3b8", textAlign: "center", lineHeight: 1.6 }),
        tb("{{issued_date}}", { left: cx(L.w, 300), top: 315, width: 300, fontSize: 14, fill: "#f59e0b", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 400, width: 200, fontSize: 12, fill: "#e2e8f0", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nOrganization", { left: 460, top: 400, width: 200, fontSize: 12, fill: "#e2e8f0", textAlign: "center", lineHeight: 1.5 }),
        tb("ID: {{certificate_id}}", { left: cx(L.w, 250), top: 545, width: 250, fontSize: 8, fill: "#475569", textAlign: "center" }),
      ],
    },
  },

  "professional-cert": {
    name: "Professional Certificate",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 0, top: 0, width: 60, height: L.h, fill: "#059669" }),
        rect({ left: 65, top: 0, width: 4, height: L.h, fill: "#10b981" }),
        tb("PROFESSIONAL CERTIFICATE", { left: 120, top: 50, width: 600, fontSize: 12, fontWeight: "bold", fontFamily: "Helvetica", fill: "#059669", charSpacing: 500 }),
        line({ x1: 0, y1: 0, x2: 600, y2: 0, left: 120, top: 80, stroke: "#d1d5db", strokeWidth: 1 }),
        tb("This is to certify that", { left: 120, top: 110, width: 600, fontSize: 14, fontFamily: "Helvetica", fill: "#6b7280" }),
        tb("{{name}}", { left: 120, top: 145, width: 600, fontSize: 38, fontWeight: "bold", fontFamily: "Helvetica", fill: "#111827" }),
        tb("has demonstrated professional competency and successfully fulfilled all requirements for certification.", { left: 120, top: 210, width: 600, fontSize: 13, fontFamily: "Helvetica", fill: "#6b7280", lineHeight: 1.7 }),
        tb("DATE ISSUED", { left: 120, top: 310, width: 200, fontSize: 9, fontWeight: "bold", fontFamily: "Helvetica", fill: "#9ca3af", charSpacing: 200 }),
        tb("{{issued_date}}", { left: 120, top: 330, width: 200, fontSize: 14, fontFamily: "Helvetica", fill: "#111827" }),
        tb("CERTIFICATE ID", { left: 350, top: 310, width: 200, fontSize: 9, fontWeight: "bold", fontFamily: "Helvetica", fill: "#9ca3af", charSpacing: 200 }),
        tb("{{certificate_id}}", { left: 350, top: 330, width: 200, fontSize: 14, fontFamily: "Helvetica", fill: "#111827" }),
        line({ x1: 0, y1: 0, x2: 600, y2: 0, left: 120, top: 400, stroke: "#d1d5db", strokeWidth: 1 }),
        tb("________________________\n{{issuer_name}}\nCertifying Authority", { left: 120, top: 420, width: 200, fontSize: 11, fontFamily: "Helvetica", fill: "#374151", lineHeight: 1.5 }),
        tb("________________________\nOrganization Head\nApproval", { left: 420, top: 420, width: 200, fontSize: 11, fontFamily: "Helvetica", fill: "#374151", lineHeight: 1.5 }),
      ],
    },
  },

  "communication-skills": {
    name: "Communication Skills",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 0, top: L.h - 30, width: L.w, height: 30, fill: "#dc2626" }),
        tb("CERTIFICATE OF COMPLETION", { left: cx(L.w, 600), top: 55, width: 600, fontSize: 22, fontWeight: "bold", fill: "#374151", textAlign: "center", charSpacing: 200 }),
        tb("COMMUNICATION SKILLS COURSE", { left: cx(L.w, 500), top: 90, width: 500, fontSize: 12, fill: "#6b7280", textAlign: "center", charSpacing: 100 }),
        line({ x1: 0, y1: 0, x2: 400, y2: 0, left: cx(L.w, 400), top: 120, stroke: "#e5e7eb", strokeWidth: 1 }),
        tb("AWARDED TO", { left: cx(L.w, 300), top: 138, width: 300, fontSize: 10, fill: "#9ca3af", textAlign: "center", charSpacing: 300 }),
        tb("{{name}}", { left: cx(L.w, 600), top: 168, width: 600, fontSize: 40, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("has meritoriously completed the \"Effective Communication Skills\" course, based on Professional Development Institute curriculum.", { left: cx(L.w, 580), top: 235, width: 580, fontSize: 12, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        tb("________________________\n{{issuer_name}}\nPrimary Instructor", { left: 190, top: 360, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nDirector of Training", { left: 460, top: 360, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: cx(L.w, 300), top: 520, width: 300, fontSize: 8, fill: "#dc2626", textAlign: "center" }),
      ],
    },
  },

  "digital-marketing": {
    name: "Digital Marketing Strategies",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#fefbf4",
      objects: [
        rect({ left: L.w - 100, top: 20, width: 60, height: 60, fill: "#fbbf24", rx: 6, ry: 6 }),
        rect({ left: L.w - 70, top: 90, width: 40, height: 40, fill: "#fde68a", rx: 4, ry: 4 }),
        rect({ left: L.w - 110, top: 100, width: 25, height: 25, fill: "#f59e0b", rx: 3, ry: 3 }),
        tb("Certificate of Course", { left: 80, top: 100, width: 500, fontSize: 16, fill: "#6b7280" }),
        tb("Completion", { left: 80, top: 125, width: 500, fontSize: 30, fontWeight: "bold", fill: "#1f2937" }),
        tb("is awarded to", { left: 80, top: 175, width: 300, fontSize: 13, fill: "#9ca3af" }),
        tb("{{name}}", { left: 80, top: 200, width: 500, fontSize: 36, fontWeight: "bold", fill: "#1f2937" }),
        line({ x1: 0, y1: 0, x2: 300, y2: 0, left: 80, top: 250, stroke: "#fbbf24", strokeWidth: 1 }),
        tb("for successfully completing the", { left: 80, top: 265, width: 500, fontSize: 12, fill: "#6b7280" }),
        tb("Digital Marketing Strategies", { left: 80, top: 290, width: 500, fontSize: 18, fontWeight: "bold", fill: "#b45309", fontStyle: "italic" }),
        tb("Issued: {{issued_date}}", { left: 80, top: 340, width: 300, fontSize: 11, fill: "#9ca3af" }),
        tb("________________________\n{{issuer_name}}", { left: 80, top: 420, width: 200, fontSize: 11, fill: "#374151", lineHeight: 1.5 }),
        tb("________________________\nProgram Director", { left: 400, top: 420, width: 200, fontSize: 11, fill: "#374151", lineHeight: 1.5 }),
        tb("ID: {{certificate_id}}", { left: 80, top: 545, width: 300, fontSize: 8, fill: "#d1d5db" }),
      ],
    },
  },

  "financial-accounting": {
    name: "Financial Accounting Fundamentals",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#fafafa",
      objects: [
        rect({ left: 0, top: 0, width: L.w, height: 6, fill: "#6b7280" }),
        tb("COURSE COMPLETION CERTIFICATE", { left: cx(L.w, 600), top: 55, width: 600, fontSize: 18, fontWeight: "bold", fill: "#374151", textAlign: "center", charSpacing: 400 }),
        line({ x1: 0, y1: 0, x2: 500, y2: 0, left: cx(L.w, 500), top: 90, stroke: "#d1d5db", strokeWidth: 1 }),
        tb("{{name}}", { left: cx(L.w, 600), top: 125, width: 600, fontSize: 42, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("Financial Accounting Fundamentals", { left: cx(L.w, 500), top: 190, width: 500, fontSize: 16, fill: "#6b7280", textAlign: "center", fontStyle: "italic" }),
        tb("270", { left: 310, top: 255, width: 60, fontSize: 20, fontWeight: "bold", fill: "#374151", textAlign: "center" }),
        tb("POINTS", { left: 310, top: 283, width: 60, fontSize: 8, fill: "#9ca3af", textAlign: "center", charSpacing: 200 }),
        tb("4/5", { left: 400, top: 255, width: 60, fontSize: 20, fontWeight: "bold", fill: "#374151", textAlign: "center" }),
        tb("GRADE", { left: 400, top: 283, width: 60, fontSize: 8, fill: "#9ca3af", textAlign: "center", charSpacing: 200 }),
        tb("Issued: {{issued_date}}", { left: cx(L.w, 300), top: 335, width: 300, fontSize: 11, fill: "#9ca3af", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nHead of Finance", { left: 460, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: cx(L.w, 300), top: 545, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  "seo-strategies": {
    name: "Advanced SEO Strategies",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 0, top: L.h - 40, width: L.w, height: 40, fill: "#0891b2" }),
        rect({ left: 0, top: L.h - 44, width: L.w, height: 4, fill: "#06b6d4" }),
        tb("CERTIFICATE", { left: cx(L.w, 500), top: 65, width: 500, fontSize: 32, fontWeight: "800", fill: "#0891b2", textAlign: "center", charSpacing: 300 }),
        tb("OF COMPLETION", { left: cx(L.w, 500), top: 110, width: 500, fontSize: 16, fontWeight: "bold", fill: "#6b7280", textAlign: "center", charSpacing: 200 }),
        tb("{{name}}", { left: cx(L.w, 600), top: 175, width: 600, fontSize: 44, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("ADVANCED SEO STRATEGIES COURSE", { left: cx(L.w, 600), top: 240, width: 600, fontSize: 14, fontWeight: "bold", fill: "#0891b2", textAlign: "center", charSpacing: 150 }),
        tb("Passed: 99% out of 100%", { left: cx(L.w, 300), top: 285, width: 300, fontSize: 11, fill: "#6b7280", textAlign: "center" }),
        tb("{{issued_date}}", { left: cx(L.w, 300), top: 325, width: 300, fontSize: 12, fill: "#9ca3af", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 385, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nProgram Director", { left: 460, top: 385, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: 70, top: L.h - 30, width: 200, fontSize: 8, fill: "#ffffff" }),
      ],
    },
  },

  "training-course": {
    name: "Training Course Certificate",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 0, top: 0, width: L.w, height: 120, fill: "#dc2626" }),
        tb("TRAINING COURSE", { left: cx(L.w, 600), top: 25, width: 600, fontSize: 28, fontWeight: "800", fill: "#ffffff", textAlign: "center", charSpacing: 200 }),
        tb("CERTIFICATE", { left: cx(L.w, 400), top: 65, width: 400, fontSize: 16, fontWeight: "bold", fill: "#fca5a5", textAlign: "center", charSpacing: 300 }),
        tb("IS PROUDLY PRESENTED TO", { left: cx(L.w, 400), top: 150, width: 400, fontSize: 10, fill: "#9ca3af", textAlign: "center", charSpacing: 300 }),
        tb("{{name}}", { left: cx(L.w, 600), top: 185, width: 600, fontSize: 42, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("IN RECOGNITION OF COMPLETING THE PUBLIC SPEAKING\nMASTER COURSE AT THE COMMUNICATION SKILLS INSTITUTE", { left: cx(L.w, 580), top: 250, width: 580, fontSize: 11, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        rect({ left: 260, top: 320, width: 80, height: 24, fill: "#dc2626", rx: 4, ry: 4 }),
        tb("{{issued_date}}", { left: 264, top: 323, width: 72, fontSize: 9, fill: "#ffffff", textAlign: "center" }),
        rect({ left: 360, top: 320, width: 60, height: 24, fill: "#dc2626", rx: 4, ry: 4 }),
        tb("SCORE: 95%", { left: 364, top: 323, width: 52, fontSize: 8, fill: "#ffffff", textAlign: "center" }),
        rect({ left: 440, top: 320, width: 80, height: 24, fill: "#16a34a", rx: 4, ry: 4 }),
        tb("PASSED \u2713", { left: 444, top: 323, width: 72, fontSize: 9, fill: "#ffffff", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nProgram Lead", { left: 460, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: cx(L.w, 300), top: 545, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  "webinar-participation": {
    name: "Webinar Participation",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#f0f7ff",
      objects: [
        rect({ left: 0, top: 0, width: 12, height: L.h, fill: "#3b82f6" }),
        rect({ left: L.w - 12, top: 0, width: 12, height: L.h, fill: "#3b82f6" }),
        tb("CERTIFICATE OF PARTICIPATION", { left: cx(L.w, 600), top: 85, width: 600, fontSize: 24, fontWeight: "bold", fill: "#1d4ed8", textAlign: "center", charSpacing: 200 }),
        tb("WEBINAR SERIES", { left: cx(L.w, 400), top: 120, width: 400, fontSize: 12, fill: "#60a5fa", textAlign: "center", charSpacing: 300 }),
        line({ x1: 0, y1: 0, x2: 300, y2: 0, left: cx(L.w, 300), top: 150, stroke: "#93c5fd", strokeWidth: 1 }),
        tb("{{name}}", { left: cx(L.w, 600), top: 180, width: 600, fontSize: 42, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("has participated in the webinar series and demonstrated active engagement throughout all sessions.", { left: cx(L.w, 560), top: 245, width: 560, fontSize: 13, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        tb("{{issued_date}}", { left: cx(L.w, 300), top: 315, width: 300, fontSize: 13, fill: "#3b82f6", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 395, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nHost / Organizer", { left: 460, top: 395, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("ID: {{certificate_id}}", { left: cx(L.w, 300), top: 545, width: 300, fontSize: 8, fill: "#93c5fd", textAlign: "center" }),
      ],
    },
  },

  "appreciation": {
    name: "Certificate of Appreciation",
    width: L.w, height: L.h, paperSize: "A4_LANDSCAPE",
    canvasJson: {
      version: "7.0.0", background: "#fffbf0",
      objects: [
        rect({ left: 8, top: 8, width: L.w - 16, height: L.h - 16, fill: "transparent", stroke: "#d97706", strokeWidth: 3 }),
        rect({ left: 14, top: 14, width: L.w - 28, height: L.h - 28, fill: "transparent", stroke: "#d97706", strokeWidth: 1 }),
        tb("\u2740  \u2740  \u2740", { left: cx(L.w, 200), top: 55, width: 200, fontSize: 18, fill: "#d97706", textAlign: "center" }),
        tb("Certificate of Appreciation", { left: cx(L.w, 600), top: 95, width: 600, fontSize: 34, fontWeight: "bold", fill: "#92400e", textAlign: "center" }),
        tb("is presented to", { left: cx(L.w, 300), top: 150, width: 300, fontSize: 14, fill: "#b45309", textAlign: "center" }),
        tb("{{name}}", { left: cx(L.w, 600), top: 185, width: 600, fontSize: 42, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 400, y2: 0, left: cx(L.w, 400), top: 240, stroke: "#d97706", strokeWidth: 1 }),
        tb("for outstanding dedication and service that has made a significant impact on our organization.", { left: cx(L.w, 560), top: 260, width: 560, fontSize: 13, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        tb("{{issued_date}}", { left: cx(L.w, 300), top: 335, width: 300, fontSize: 13, fill: "#d97706", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 190, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nOrganization", { left: 460, top: 400, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: cx(L.w, 300), top: 545, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  // ─── Portrait templates ───

  "course-completion-portrait": {
    name: "Course Completion (Portrait)",
    width: P.w, height: P.h, paperSize: "A4",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: 20, top: 20, width: P.w - 40, height: P.h - 40, fill: "transparent", stroke: "#1e3a5f", strokeWidth: 3, rx: 8, ry: 8 }),
        rect({ left: 30, top: 30, width: P.w - 60, height: P.h - 60, fill: "transparent", stroke: "#c9a84c", strokeWidth: 1.5, rx: 4, ry: 4 }),
        tb("CERTIFICATE", { left: cx(P.w, 400), top: 80, width: 400, fontSize: 14, fill: "#c9a84c", textAlign: "center", charSpacing: 600 }),
        tb("OF COMPLETION", { left: cx(P.w, 500), top: 115, width: 500, fontSize: 32, fontWeight: "bold", fill: "#1e3a5f", textAlign: "center" }),
        tb("This is to certify that", { left: cx(P.w, 400), top: 205, width: 400, fontSize: 14, fill: "#555555", textAlign: "center" }),
        tb("{{name}}", { left: cx(P.w, 450), top: 245, width: 450, fontSize: 34, fontWeight: "bold", fill: "#1e3a5f", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 360, y2: 0, left: cx(P.w, 360), top: 300, stroke: "#c9a84c", strokeWidth: 1 }),
        tb("has successfully completed all course requirements and is hereby awarded this certificate.", { left: cx(P.w, 450), top: 325, width: 450, fontSize: 13, fill: "#555555", textAlign: "center", lineHeight: 1.6 }),
        tb("Issued on {{issued_date}}", { left: cx(P.w, 300), top: 425, width: 300, fontSize: 12, fill: "#777777", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}\nInstructor", { left: 80, top: 560, width: 200, fontSize: 11, fill: "#333333", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nDirector", { left: 320, top: 560, width: 200, fontSize: 11, fill: "#333333", textAlign: "center", lineHeight: 1.5 }),
        tb("Certificate ID: {{certificate_id}}", { left: cx(P.w, 300), top: 770, width: 300, fontSize: 9, fill: "#999999", textAlign: "center" }),
      ],
    },
  },

  "creative-writing": {
    name: "Creative Writing Workshop",
    width: P.w, height: P.h, paperSize: "A4",
    canvasJson: {
      version: "7.0.0", background: "#fdf2e9",
      objects: [
        rect({ left: 0, top: 0, width: P.w, height: 80, fill: "#ea580c" }),
        tb("ONLINE COURSE CERTIFICATE", { left: cx(P.w, 500), top: 20, width: 500, fontSize: 14, fontWeight: "bold", fill: "#ffffff", textAlign: "center", charSpacing: 300 }),
        tb("CREATIVE WRITING WORKSHOP", { left: cx(P.w, 500), top: 48, width: 500, fontSize: 10, fill: "#fed7aa", textAlign: "center", charSpacing: 200 }),
        tb("AWARDED TO", { left: cx(P.w, 300), top: 125, width: 300, fontSize: 10, fill: "#9ca3af", textAlign: "center", charSpacing: 300 }),
        tb("{{name}}", { left: cx(P.w, 500), top: 160, width: 500, fontSize: 38, fontWeight: "bold", fill: "#1f2937", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 360, y2: 0, left: cx(P.w, 360), top: 215, stroke: "#ea580c", strokeWidth: 1 }),
        tb("For student who developed essential creative writing skills including narrative structure and character development.", { left: cx(P.w, 450), top: 235, width: 450, fontSize: 12, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        rect({ left: cx(P.w, 200), top: 340, width: 200, height: 28, fill: "#f59e0b", rx: 4, ry: 4 }),
        tb("ACHIEVING A SCORE OF 94%", { left: cx(P.w, 190), top: 346, width: 190, fontSize: 10, fontWeight: "bold", fill: "#ffffff", textAlign: "center" }),
        tb("WRITERS GUILD ACADEMY", { left: cx(P.w, 400), top: 410, width: 400, fontSize: 11, fontWeight: "bold", fill: "#374151", textAlign: "center", charSpacing: 200 }),
        tb("________________________\n{{issuer_name}}\nHead of Department", { left: 70, top: 490, width: 200, fontSize: 10, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nCertification Coordinator", { left: 330, top: 490, width: 200, fontSize: 10, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: 60, top: P.h - 50, width: 200, fontSize: 8, fill: "#d1d5db" }),
        tb("{{issued_date}}", { left: P.w - 180, top: P.h - 50, width: 120, fontSize: 8, fill: "#d1d5db", textAlign: "right" }),
      ],
    },
  },

  "design-academy": {
    name: "Design Academy",
    width: P.w, height: P.h, paperSize: "A4",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        rect({ left: P.w - 60, top: 20, width: 20, height: 50, fill: "#818cf8", rx: 3, ry: 3 }),
        rect({ left: P.w - 35, top: 30, width: 15, height: 70, fill: "#6366f1", rx: 3, ry: 3 }),
        rect({ left: P.w - 50, top: 80, width: 12, height: 30, fill: "#a5b4fc", rx: 2, ry: 2 }),
        { type: "Circle", left: P.w - 30, top: 110, radius: 5, fill: "#4f46e5", selectable: true },
        tb("CERTIFICATE", { left: cx(P.w, 500), top: 105, width: 500, fontSize: 22, fontWeight: "bold", fill: "#374151", textAlign: "center", charSpacing: 300 }),
        tb("OF COURSE COMPLETION", { left: cx(P.w, 400), top: 135, width: 400, fontSize: 12, fill: "#9ca3af", textAlign: "center", charSpacing: 150 }),
        tb("PROUDLY PRESENTED TO", { left: cx(P.w, 300), top: 200, width: 300, fontSize: 9, fill: "#9ca3af", textAlign: "center", charSpacing: 300 }),
        tb("{{name}}", { left: cx(P.w, 500), top: 230, width: 500, fontSize: 38, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 240, y2: 0, left: cx(P.w, 240), top: 285, stroke: "#6366f1", strokeWidth: 2 }),
        tb("HAS DEMONSTRATED PROFESSIONAL COMPETENCE\nBY COMPLETING THE DESIGN BASICS", { left: cx(P.w, 420), top: 305, width: 420, fontSize: 10, fill: "#6b7280", textAlign: "center", lineHeight: 1.6, charSpacing: 50 }),
        rect({ left: 60, top: 410, width: 100, height: 24, fill: "#ef4444", rx: 3, ry: 3 }),
        tb("80/100 POINTS", { left: 64, top: 415, width: 92, fontSize: 9, fontWeight: "bold", fill: "#ffffff", textAlign: "center" }),
        rect({ left: 180, top: 410, width: 80, height: 24, fill: "#3b82f6", rx: 3, ry: 3 }),
        tb("40 HOURS", { left: 184, top: 415, width: 72, fontSize: 9, fontWeight: "bold", fill: "#ffffff", textAlign: "center" }),
        tb("DESIGN\nACADEMY", { left: cx(P.w, 200), top: 490, width: 200, fontSize: 14, fontWeight: "bold", fill: "#6366f1", textAlign: "center", lineHeight: 1.3 }),
        tb("________________________\n{{issuer_name}}\nCertification Coordinator", { left: 70, top: 590, width: 200, fontSize: 10, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nProgram Director", { left: 330, top: 590, width: 200, fontSize: 10, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("{{certificate_id}}", { left: cx(P.w, 300), top: P.h - 50, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  "employee-month": {
    name: "Employee of the Month",
    width: P.w, height: P.h, paperSize: "A4",
    canvasJson: {
      version: "7.0.0", background: "#fffef5",
      objects: [
        rect({ left: 15, top: 15, width: P.w - 30, height: P.h - 30, fill: "transparent", stroke: "#d97706", strokeWidth: 1.5 }),
        tb("\u2605", { left: cx(P.w, 100), top: 60, width: 100, fontSize: 36, fill: "#f59e0b", textAlign: "center" }),
        tb("EMPLOYEE", { left: cx(P.w, 400), top: 125, width: 400, fontSize: 30, fontWeight: "bold", fill: "#92400e", textAlign: "center", charSpacing: 400 }),
        tb("OF THE MONTH", { left: cx(P.w, 400), top: 165, width: 400, fontSize: 18, fontWeight: "600", fill: "#b45309", textAlign: "center", charSpacing: 200 }),
        line({ x1: 0, y1: 0, x2: 300, y2: 0, left: cx(P.w, 300), top: 205, stroke: "#d97706", strokeWidth: 1 }),
        tb("{{name}}", { left: cx(P.w, 500), top: 245, width: 500, fontSize: 42, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        tb("for exceptional performance, outstanding work ethic, and unwavering dedication to the team and organization.", { left: cx(P.w, 440), top: 320, width: 440, fontSize: 13, fill: "#6b7280", textAlign: "center", lineHeight: 1.7 }),
        tb("{{issued_date}}", { left: cx(P.w, 300), top: 425, width: 300, fontSize: 16, fontWeight: "600", fill: "#d97706", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}\nDepartment Manager", { left: 70, top: 550, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nHR Director", { left: 330, top: 550, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("ID: {{certificate_id}}", { left: cx(P.w, 300), top: P.h - 50, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  "completion-portrait": {
    name: "Completion Certificate",
    width: P.w, height: P.h, paperSize: "A4",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        tb("Certificate of Completion", { left: cx(P.w, 500), top: 100, width: 500, fontSize: 28, fill: "#374151", textAlign: "center" }),
        tb("This certificate is granted to", { left: cx(P.w, 400), top: 175, width: 400, fontSize: 12, fill: "#9ca3af", textAlign: "center" }),
        tb("{{name}}", { left: cx(P.w, 500), top: 215, width: 500, fontSize: 38, fontWeight: "bold", fill: "#111827", textAlign: "center" }),
        line({ x1: 0, y1: 0, x2: 360, y2: 0, left: cx(P.w, 360), top: 270, stroke: "#e5e7eb", strokeWidth: 1 }),
        tb("for completing the course at Code Academy over a period of 6 weeks.", { left: cx(P.w, 420), top: 290, width: 420, fontSize: 12, fill: "#6b7280", textAlign: "center", lineHeight: 1.6 }),
        tb("270", { left: 170, top: 380, width: 80, fontSize: 22, fontWeight: "bold", fill: "#374151", textAlign: "center" }),
        tb("Completing\nPoints", { left: 170, top: 410, width: 80, fontSize: 9, fill: "#9ca3af", textAlign: "center", lineHeight: 1.3 }),
        tb("3", { left: 280, top: 380, width: 60, fontSize: 22, fontWeight: "bold", fill: "#374151", textAlign: "center" }),
        tb("Badges", { left: 280, top: 410, width: 60, fontSize: 9, fill: "#9ca3af", textAlign: "center" }),
        tb("________________________\n{{issuer_name}}", { left: 70, top: 530, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("________________________\nProgram Lead", { left: 330, top: 530, width: 200, fontSize: 11, fill: "#374151", textAlign: "center", lineHeight: 1.5 }),
        tb("Issued: {{issued_date}}", { left: cx(P.w, 300), top: 660, width: 300, fontSize: 10, fill: "#d1d5db", textAlign: "center" }),
        tb("{{certificate_id}}", { left: cx(P.w, 300), top: P.h - 50, width: 300, fontSize: 8, fill: "#d1d5db", textAlign: "center" }),
      ],
    },
  },

  // ─── YouTube Thumbnail templates (1280×720) ───

  "yt-gaming-ultimate": {
    name: "Ultimate Gaming Challenge",
    width: YT.w, height: YT.h, paperSize: "YOUTUBE_THUMBNAIL",
    canvasJson: {
      version: "7.0.0", background: "#000000",
      objects: [
        // Green background section at bottom
        rect({ left: 0, top: 540, width: YT.w, height: 180, fill: "#22c55e" }),

        // Main Human Image from /Images/s3.png
        img("/Images/s3.png", {
          left: -100,
          top: 50,
          scaleX: 0.4,
          scaleY: 0.4,
          shadow: { color: "#22c55e", blur: 60, offsetX: 0, offsetY: 0 }
        }),

        // Stars top right
        tb("\u2605 \u2605 \u2605 \u2605 \u2605", {
          left: 1050, top: 150, width: 200, fontSize: 32, fill: "#22c55e", textAlign: "right"
        }),

        // Text Content
        tb("THE ULTIMATE", {
          left: 480, top: 200, width: 800, fontSize: 80, fontWeight: "bold", fontStyle: "italic", fill: "#ffffff", textAlign: "left", fontFamily: "Helvetica"
        }),
        tb("GAMING", {
          left: 480, top: 300, width: 800, fontSize: 160, fontWeight: "900", fontStyle: "italic", fill: "#22c55e", textAlign: "left", fontFamily: "Helvetica", charSpacing: -50
        }),
        tb("CHALLENGE", {
          left: 480, top: 500, width: 800, fontSize: 110, fontWeight: "bold", fontStyle: "italic", fill: "#ffffff", textAlign: "left", fontFamily: "Helvetica"
        }),
      ],
    },
  },

  "yt-senior-dev": {
    name: "Senior Developer in 4 Months",
    width: YT.w, height: YT.h, paperSize: "YOUTUBE_THUMBNAIL",
    canvasJson: {
      version: "7.0.0", background: "#0f172a",
      objects: [
        img("/Images/Temp1/8952a815-9c9c-4d1a-b365-a121f6ede0db.jpeg", {
          left: 0, top: -400, scaleX: 0.32, scaleY: 0.32, selectable: true
        }),
        rect({ left: 0, top: 0, width: 1280, height: 720, fill: "#000000", opacity: 0.3, selectable: false }),
        tb("ZERO", {
          left: 150, top: 280, width: 200, fontSize: 50, fontWeight: "bold", fill: "#ffffff", fontFamily: "Courier New"
        }),
        img("/Images/Temp1/1830aa2d-a9e8-4de9-955d-132e5f935bf9.svg", {
          left: 280, top: 180, scaleX: 0.22, scaleY: 0.22, selectable: true
        }),
        tb("SENIOR\nDEVELOPER", {
          left: 450, top: 170, width: 400, fontSize: 60, fontWeight: "bold", fill: "#ffffff", fontFamily: "Courier New", textAlign: "left", lineHeight: 1.1
        }),
        rect({ left: 280, top: 380, width: 240, height: 70, fill: "#27486e", rx: 35, ry: 35, angle: -12 }),
        tb("in only", {
          left: 310, top: 385, width: 200, fontSize: 45, fontWeight: "bold", fontStyle: "italic", fill: "#ffffff", fontFamily: "Helvetica", angle: -12
        }),
        rect({ left: 220, top: 480, width: 380, height: 90, fill: "#2e295e", rx: 45, ry: 45, angle: -12 }),
        tb("4 MONTHS", {
          left: 250, top: 485, width: 350, fontSize: 65, fontWeight: "bold", fontStyle: "italic", fill: "#ffffff", fontFamily: "Helvetica", angle: -12
        }),
        img("/Images/Temp1/a979a5a0-ce84-4e99-9c45-6318f40e9cac.png", {
          left: 650, top: 150, scaleX: 0.36, scaleY: 0.36, selectable: true
        }),
        rect({ left: 0, top: 620, width: 1280, height: 100, fill: "#27486e" }),
        tb("EPISODE #2", {
          left: 120, top: 645, width: 300, fontSize: 35, fontWeight: "bold", fill: "#ffffff", fontFamily: "Courier New", charSpacing: 150
        }),
      ],
    },
  },

  "yt-social-media": {
    name: "Social Media Growth",
    width: YT.w, height: YT.h, paperSize: "YOUTUBE_THUMBNAIL",
    canvasJson: {
      version: "7.0.0", background: "#000000",
      objects: [
        tb("ep #28", {
          left: -20, top: -50, width: 800, fontSize: 350, fontWeight: "bold", fill: "#1f1f1f", fontFamily: "Helvetica"
        }),
        img("/Images/Temp2/s2.png", {
          left: 530, top: 10, scaleX: 1.4, scaleY: 1.4, selectable: true
        }),
        img("/Images/Temp2/s.png", {
          left: 0, top: 0, scaleX: 1.6, scaleY: 1.6, selectable: true
        }),
        tb("How to grow", {
          left: 100, top: 250, width: 600, fontSize: 75, fontWeight: "500", fill: "#ffffff", fontFamily: "Helvetica"
        }),
        tb("your", {
          left: 100, top: 340, width: 200, fontSize: 75, fontWeight: "500", fill: "#ffffff", fontFamily: "Helvetica"
        }),
        tb("social media.", {
          left: 270, top: 340, width: 500, fontSize: 75, fontWeight: "bold", fill: "#84cc16", fontFamily: "Helvetica"
        }),
        { type: "Circle", left: 100, top: 495, radius: 4, fill: "#84cc16", selectable: true },
        tb("Olivia Wilson", {
          left: 125, top: 485, width: 300, fontSize: 24, fill: "#cccccc", fontFamily: "Helvetica", charSpacing: 200
        }),
      ],
    },
  },
  "yt-fitness-core": {
    name: "Core Fitness Challenge",
    width: YT.w, height: YT.h, paperSize: "YOUTUBE_THUMBNAIL",
    canvasJson: {
      version: "7.0.0", background: "#000000",
      objects: [
        // 1. Photo Background
        img("/Images/Temp3/bg.jpeg", {
          left: 0, top: 0, scaleX: 0.2, scaleY: 0.2, selectable: true
        }),
        // 2. Dark Overlay
        rect({ left: 0, top: 0, width: 1280, height: 720, fill: "rgba(0,0,0,0.4)", selectable: false }),

        // 3. Bottom-Left Red Shape (L-shape)
        rect({ left: 80, top: 540, width: 140, height: 45, fill: "#c23333" }),
        rect({ left: 80, top: 540, width: 45, height: 120, fill: "#c23333" }),

        // 4. Shape-Title-1 (COR background)
        rect({ left: 240, top: 350, width: 215, height: 110, fill: "#c23333" }),
        // 5. Title-1 (COR)
        tb("COR", {
          left: 255, top: 355, width: 200, fontSize: 95, fontWeight: "900", fill: "#ffffff", fontFamily: "Impact"
        }),

        // 6. Shape-Title-2 (EXERCISES background)
        rect({ left: 240, top: 460, width: 500, height: 110, fill: "#c23333" }),
        // 7. Title-2 (EXERCISES)
        tb("EXERCISES", {
          left: 255, top: 465, width: 500, fontSize: 95, fontWeight: "900", fill: "#ffffff", fontFamily: "Impact"
        }),

        // 8. Subtitle
        tb("You should do everyday", {
          left: 250, top: 585, width: 800, fontSize: 45, fill: "#ffffff", fontFamily: "Helvetica"
        }),

        // 9. Logo (Top Right)
        img("/Images/Temp3/logo.png", {
          left: 1100, top: 50, scaleX: 0.2, scaleY: 0.2, selectable: true
        }),
      ],
    },
  },
  "yt-sunrise-music": {
    name: "Sunrise Music Mix",
    width: YT.w, height: YT.h, paperSize: "YOUTUBE_THUMBNAIL",
    canvasJson: {
      version: "7.0.0", background: "#000000",
      objects: [
        // 1. Background
        img("/Images/Temp4/bg.jpg", {
          left: 0, top: -66, scaleX: 1.6, scaleY: 1.6, selectable: true
        }),
        // 2. Left Spark
        img("/Images/Temp4/spark.svg", {
          left: 256, top: 360, scaleX: 0.9, scaleY: 0.9, angle: -40, selectable: true
        }),
        // 3. Right Spark
        img("/Images/Temp4/spark.svg", {
          left: 1100, top: 300, scaleX: 1.4, scaleY: 1.4, angle: 140, selectable: true
        }),
        // 4. Sunrise Text
        tb("sunrise", {
          left: 340, top: 180, width: 600, fontSize: 220, fill: "#ffffff", fontFamily: "Georgia", fontStyle: "italic", textAlign: "center", selectable: true
        }),
        // 5. Music Mix
        tb("MUSIC MIX", {
          left: 440, top: 460, width: 400, fontSize: 36, fill: "#ffffff", fontWeight: "300", fontFamily: "Helvetica", textAlign: "center", charSpacing: 500, selectable: true
        }),
      ],
    },
  },

  "ecomm-flash-sale": {
    name: "Flash Sale Ecommerce",
    width: 500, height: 500, paperSize: "SQUARE_500",
    canvasJson: {
      version: "7.0.0", background: "#a21caf",
      objects: [
        // Background Gradient
        {
          type: "Rect", left: 0, top: 0, width: 500, height: 500,
          fill: {
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 500, y2: 500 },
            colorStops: [
              { offset: 0, color: '#a21caf' },
              { offset: 1, color: '#ec4899' }
            ]
          },
          selectable: false, evented: false
        },
        // Logo Icon Background
        {
          type: "Circle", left: cx(500, 40), top: 45, radius: 20, fill: "rgba(255,255,255,0.2)"
        },
        // Heart Icon
        tb("\u2764", { left: cx(430, 30), top: 52, width: 50, fontSize: 30, fill: "#ffffff", textAlign: "center" }),
        // Logo Text
        tb("YOU BRAND\nNAME HERE", { left: cx(500, 200), top: 85, width: 200, fontSize: 11, fontWeight: "bold", fill: "#ffffff", textAlign: "center", lineHeight: 1.1 }),
        // Promo Text
        tb("15% OFF ALL BRANDS", { left: cx(500, 400), top: 155, width: 400, fontSize: 16, fontWeight: "800", fill: "#ffffff", textAlign: "center", charSpacing: 50 }),
        // FLASH
        tb("FLASH", { left: cx(500, 500), top: 180, width: 500, fontSize: 115, fontWeight: "900", fill: "#ffffff", textAlign: "center", fontFamily: "Impact" }),
        // SALE
        tb("SALE", { left: cx(500, 500), top: 280, width: 500, fontSize: 115, fontWeight: "900", fill: "#ffffff", textAlign: "center", fontFamily: "Impact" }),
        // Button
        rect({ left: cx(500, 160), top: 410, width: 160, height: 40, fill: "#ffffff", rx: 2, ry: 2 }),
        tb("SHOP NOW", { left: cx(500, 150), top: 420, width: 150, fontSize: 18, fontWeight: "900", fill: "#ec4899", textAlign: "center" }),
      ],
    },
  },

  "ecomm-flash-sale-2": {
    name: "Flash Sale Ecommerce 2",
    width: 500, height: 500, paperSize: "SQUARE_500",
    canvasJson: {
      version: "7.0.0", background: "#ff33cc",
      objects: [
        // Decorative Shapes
        { type: "Circle", left: -25, top: -25, radius: 45, fill: "#ffff00", selectable: true },
        { type: "Circle", left: -30, top: 235, radius: 25, fill: "#0000ff", selectable: true },
        { type: "Rect", left: 455, top: -15, width: 70, height: 70, fill: "#ff0000", angle: 45, selectable: true },

        // Header Text
        tb("FLASH SALE", { left: cx(500, 480), top: 45, width: 480, fontSize: 58, fontWeight: "900", fill: "#ffffff", textAlign: "center", fontFamily: "Impact" }),
        tb("15% OFF ALL BRANDS", { left: cx(500, 400), top: 102, width: 400, fontSize: 16, fontWeight: "bold", fill: "#ffffff", textAlign: "center" }),

        // Center Image (Full width 500px, fit & center)
        {
          ...img("/Images/ectemp2/2572972.jpeg", {
            left: 50,
            top: 150,
            width: 1280,
            height: 853,
            scaleX: 0.31,
            scaleY: 0.31,
            selectable: true,
          }),
          clipPath: {
            type: "Rect",
            left: 0,
            top: 0,
            width: 1280,
            height: 853,
            rx: 60,
            ry: 60,
            originX: "center",
            originY: "center"
          }
        },
        { type: "Circle", left: 400, top: 375, radius: 45, fill: "#ffff00", selectable: true },

        // Button
        rect({ left: cx(500, 200), top: 390, width: 200, height: 50, fill: "#ffffff", rx: 0, ry: 0 }),
        tb("SHOP NOW", { left: cx(500, 180), top: 402, width: 180, fontSize: 22, fontWeight: "900", fill: "#ff33cc", textAlign: "center" }),
      ],
    },
  },

  "ecomm-super-sale": {
    name: "Super Sale Ecommerce",
    width: 500, height: 500, paperSize: "SQUARE_500",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        // Background Pattern
        img("/Images/ectemp3/bg.png", {
          left: 0, top: 0, width: 500, height: 500,
          scaleX: 1, scaleY: 1,
          selectable: false, evented: false
        }),

        // Central Black Circle
        { type: "Circle", left: cx(500, 420), top: 40, radius: 210, fill: "#000000", selectable: true },

        // SUPER SALE Text
        tb("SUPER", { left: cx(500, 400), top: 125, width: 400, fontSize: 80, fontWeight: "900", fill: "#ffff00", textAlign: "center", fontFamily: "Impact" }),
        tb("SALE", { left: cx(500, 400), top: 210, width: 400, fontSize: 80, fontWeight: "900", fill: "#ffff00", textAlign: "center", fontFamily: "Impact" }),

        // Promo Subtitle
        tb("15% off on all items", { left: cx(500, 400), top: 320, width: 400, fontSize: 18, fontWeight: "600", fill: "#ffffff", textAlign: "center" }),

        // Button
        rect({ left: cx(500, 130), top: 375, width: 130, height: 35, fill: "#ffffff", rx: 17, ry: 17 }),
        tb("VISIT US", { left: cx(500, 120), top: 382, width: 120, fontSize: 14, fontWeight: "bold", fill: "#000000", textAlign: "center" }),
      ],
    },
  },

  "ecomm-product-review": {
    name: "Product Review",
    width: 500, height: 500, paperSize: "SQUARE_500",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        // Split Background
        rect({ left: 0, top: 0, width: 250, height: 500, fill: "#b9c1c4" }),
        {
          ...img("/Images/ectemp4/bg.jpeg", {
            left: 250, top: 0,
            width: 640,
            height: 1280,
            scaleX: 0.39, scaleY: 0.39, // 1280 * 0.39 = 500
            selectable: false, evented: false
          }),
          clipPath: {
            type: "Rect", left: 0, top: 0, width: 640, height: 1280, originX: "center", originY: "center"
          }
        },

        // Logo Area
        { type: "Circle", left: 35, top: 70, radius: 20, stroke: "#ffffff", strokeWidth: 1, fill: "transparent" },
        tb("YOUR LOGO", { left: 82, top: 83, width: 80, fontSize: 14, fill: "#ffffff", fontWeight: "bold" }),

        // Title
        tb("Product\nReview", { left: 35, top: 120, width: 200, fontSize: 36, fill: "#ffffff", fontWeight: "bold", fontFamily: "Georgia" }),

        // Review Card
        rect({ left: 30, top: 230, width: 360, height: 210, fill: "#ffffff", rx: 15, ry: 15 }),
        // Avatar
        {
          ...img("/Images/ectemp4/human.jpeg", {
            left: 55, top: 250,
            scaleX: 0.06, scaleY: 0.06, // 1280 * 0.06 = 76.8
            selectable: true
          }),
          clipPath: { type: "Circle", radius: 640, left: 0, top: 0, originX: "center", originY: "center" }
        },
        // Reviewer Name & Rating
        tb("Michelly Leary", { left: 145, top: 262, width: 200, fontSize: 18, fill: "#333333", fontWeight: "900" }),
        img("/Images/ectemp4/star.png", { left: 145, top: 290, scaleX: 0.06, scaleY: 0.06 }),

        // Review Content
        tb("This facial cleansing is very safe to use and a very satisfying product, i want to try this product for my son since its very mild to use.", {
          left: 55, top: 345, width: 310, fontSize: 14, fill: "#666666", lineHeight: 1.2
        }),
        tb("Reviewed on July 23, 2022", { left: 55, top: 410, width: 310, fontSize: 9, fill: "#999999" }),
      ],
    },
  },
  "re-modern-home": {
    name: "Modern Real Estate Home",
    width: 1024, height: 1024, paperSize: "SQUARE_1024",
    canvasJson: {
      version: "7.0.0", background: "#ffffff",
      objects: [
        // 1. Background Image
        img("/Images/REtemp1/bg.jpeg", {
          left: -255, top: 0,
          scaleX: 0.291, scaleY: 0.291, // Proportional scaling to fit height (1024/3517)
          selectable: true
        }),
        // 2. Shape-Title (Red banner)
        rect({
          left: 0, top: 220, width: 1024, height: 280,
          fill: "rgba(205, 92, 92, 0.8)",
          selectable: true
        }),
        // 3. Title
        tb("YOUR NEXT HOME", {
          left: 0, top: 270, width: 1024, fontSize: 90, fontWeight: "900",
          fill: "#ffffff", textAlign: "center", fontFamily: "Helvetica"
        }),
        // 4. Subtitle
        tb("STARTS RIGHT HERE", {
          left: 0, top: 380, width: 1024, fontSize: 38, fontWeight: "800",
          fill: "#ffffff", textAlign: "center", fontFamily: "Helvetica", charSpacing: 100
        }),
        // 5. Button (Red rounded rect)
        rect({
          left: cx(1024, 340), top: 800, width: 340, height: 85,
          fill: "#cd5c5c", rx: 42, ry: 42,
          selectable: true,
          stroke: "#ffffff", strokeWidth: 3
        }),
        // 6. Button Text
        tb("book a visit", {
          left: cx(1024, 300), top: 822, width: 300, fontSize: 32, fontWeight: "600",
          fill: "#ffffff", textAlign: "center", fontFamily: "Helvetica"
        }),
      ],
    },
  },
};

