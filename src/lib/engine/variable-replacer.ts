import type { CertificateTemplate, TemplateField } from "@/lib/types";

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

export function extractVariables(template: CertificateTemplate): string[] {
  const variables = new Set<string>();
  for (const field of template.fields) {
    let match;
    while ((match = VARIABLE_REGEX.exec(field.value)) !== null) {
      variables.add(match[1]);
    }
    VARIABLE_REGEX.lastIndex = 0;
  }
  return Array.from(variables);
}

export function substituteVariables(
  template: CertificateTemplate,
  data: Record<string, string>
): CertificateTemplate {
  return {
    ...template,
    fields: template.fields.map(
      (field): TemplateField => ({
        ...field,
        value: field.value.replace(
          VARIABLE_REGEX,
          (_, key: string) => data[key] ?? ""
        ),
      })
    ),
  };
}

export function extractCanvasVariables(canvasJson: Record<string, unknown>): string[] {
  const variables = new Set<string>();
  const text = JSON.stringify(canvasJson);
  let match;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    variables.add(match[1]);
  }
  VARIABLE_REGEX.lastIndex = 0;
  return Array.from(variables);
}

export function substituteCanvasVariables(
  canvasJson: Record<string, unknown>,
  data: Record<string, string>
): Record<string, unknown> {
  const text = JSON.stringify(canvasJson);
  const replaced = text.replace(VARIABLE_REGEX, (_, key: string) => {
    const val = data[key];
    if (val === undefined) return `{{${key}}}`;
    return val.replace(/[\\"/\n\r\t]/g, (ch) => {
      switch (ch) {
        case "\\": return "\\\\";
        case '"': return '\\"';
        case "/": return "\\/";
        case "\n": return "\\n";
        case "\r": return "\\r";
        case "\t": return "\\t";
        default: return ch;
      }
    });
  });
  return JSON.parse(replaced);
}
