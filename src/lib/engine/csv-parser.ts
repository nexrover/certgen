import Papa from "papaparse";
import type { CSVParseResult } from "@/lib/types";
import { CSVParseError, ValidationError } from "@/lib/errors";

export function parseAndValidate(
  csvText: string,
  requiredHeaders: string[]
): CSVParseResult {
  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(
    csvText,
    {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (value) => value.trim(),
    }
  );

  if (parseErrors.length > 0) {
    throw new CSVParseError(
      `CSV parsing failed: ${parseErrors.map((e) => e.message).join(", ")}`
    );
  }

  if (data.length === 0) {
    throw new CSVParseError("CSV file is empty or contains no data rows");
  }

  const headers = Object.keys(data[0]);

  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    throw new ValidationError("CSV contains duplicate column headers");
  }

  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required columns: ${missing.join(", ")}`
    );
  }

  const validRows: Record<string, string>[] = [];
  const rowErrors: { row: number; field: string; message: string }[] = [];

  data.forEach((row, i) => {
    const emptyFields = requiredHeaders.filter((h) => !row[h]?.trim());
    if (emptyFields.length > 0) {
      for (const field of emptyFields) {
        rowErrors.push({
          row: i + 1,
          field,
          message: `Empty value for required field "${field}"`,
        });
      }
    } else {
      validRows.push(row);
    }
  });

  return {
    headers,
    rows: validRows,
    errors: rowErrors,
    summary: {
      totalRows: data.length,
      validRows: validRows.length,
      invalidRows: data.length - validRows.length,
    },
  };
}
