import type { CertificateTemplate, TemplateField } from "@/lib/types";

function renderTextField(field: TemplateField): string {
  const styles = [
    `position: absolute`,
    `left: ${field.x}px`,
    `top: ${field.y}px`,
    `font-size: ${field.fontSize ?? 16}px`,
    `color: ${field.color ?? "#000000"}`,
    `font-weight: ${field.fontWeight ?? "normal"}`,
    `white-space: nowrap`,
    `transform: translateX(-50%)`,
    `font-family: 'Georgia', serif`,
  ];
  return `<div style="${styles.join("; ")}">${escapeHtml(field.value)}</div>`;
}

function renderImageField(field: TemplateField): string {
  const w = field.width ?? 100;
  const h = field.height ?? 100;
  const styles = [
    `position: absolute`,
    `left: ${field.x - w / 2}px`,
    `top: ${field.y}px`,
    `width: ${w}px`,
    `height: ${h}px`,
    `object-fit: contain`,
  ];
  return `<img src="${escapeHtml(field.value)}" style="${styles.join("; ")}" />`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCertificateHTML(template: CertificateTemplate): string {
  const elements = template.fields
    .map((field) => {
      switch (field.type) {
        case "text":
          return renderTextField(field);
        case "image":
          return renderImageField(field);
        default:
          return "";
      }
    })
    .join("\n    ");

  const backgroundStyle = template.background_url
    ? `background-image: url('${template.background_url}'); background-size: cover; background-position: center;`
    : `background-color: #ffffff;`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${template.width}px; height: ${template.height}px; overflow: hidden; }
  </style>
</head>
<body>
  <div style="position: relative; width: ${template.width}px; height: ${template.height}px; ${backgroundStyle}">
    ${elements}
  </div>
</body>
</html>`;
}
