export type CsvCellValue = string | number | null | undefined;

export type CsvImportSummary = {
  created: number;
  updated: number;
  skipped: number;
};

function escapeCsvValue(value: CsvCellValue) {
  const normalizedValue = value == null ? "" : String(value);

  if (!/[",\n]/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `"${normalizedValue.replaceAll('"', '""')}"`;
}

export function buildCsv(headers: string[], rows: CsvCellValue[][]) {
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (!insideQuotes && character === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!insideQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      currentCell = "";

      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);

    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...valueRows] = rows;
  const normalizedHeaders = headerRow.map(normalizeCsvHeader);

  return valueRows.map((row) =>
    Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, row[index]?.trim() ?? ""]),
    ),
  );
}

export async function readCsvFile(file: File) {
  const text = await file.text();

  return parseCsv(text);
}

export function downloadCsv(csv: string, filename: string) {
  const downloadUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(downloadUrl);
}

export function buildTimestampLabel() {
  return new Date().toISOString().replaceAll(":", "-");
}

export function normalizeCsvHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getCsvValue(
  row: Record<string, string>,
  ...aliases: string[]
) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeCsvHeader(alias);
    const value = row[normalizedAlias];

    if (value != null && value !== "") {
      return value;
    }
  }

  return "";
}

export function parseOptionalInteger(value: string) {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export function parseOptionalDate(value: string, fallback = new Date()) {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? fallback : parsedDate;
}

