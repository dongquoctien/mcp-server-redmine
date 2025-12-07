import * as XLSX from "xlsx";

/**
 * Excel sheet data representation
 */
export interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
}

/**
 * Parsed Excel file result
 */
export interface ParsedExcel {
  sheetCount: number;
  sheets: ExcelSheet[];
}

/**
 * Parse Excel file buffer to JSON
 * Supports both .xlsx and .xls formats
 */
export function parseExcelToJson(buffer: Buffer): ParsedExcel {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheets: ExcelSheet[] = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON (array of objects with headers as keys)
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null, // Default value for empty cells
      raw: false, // Format dates as strings
    });

    // Get sheet range for row/column count
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    const rowCount = range.e.r - range.s.r + 1;
    const columnCount = range.e.c - range.s.c + 1;

    return {
      name: sheetName,
      data,
      rowCount,
      columnCount,
    };
  });

  return {
    sheetCount: workbook.SheetNames.length,
    sheets,
  };
}

/**
 * Check if content type is Excel
 */
export function isExcelContentType(contentType: string): boolean {
  const excelTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "application/excel",
    "application/x-excel",
    "application/x-msexcel",
  ];
  return excelTypes.includes(contentType.toLowerCase());
}

/**
 * Check if filename is Excel
 */
export function isExcelFilename(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  return lowerFilename.endsWith(".xlsx") || lowerFilename.endsWith(".xls");
}

/**
 * Format parsed Excel to readable text
 */
export function formatParsedExcel(parsed: ParsedExcel): string {
  const lines: string[] = [];

  lines.push(`Excel File: ${parsed.sheetCount} sheet(s)`);
  lines.push("");

  for (const sheet of parsed.sheets) {
    lines.push(`=== Sheet: "${sheet.name}" (${sheet.rowCount} rows, ${sheet.columnCount} columns) ===`);

    if (sheet.data.length === 0) {
      lines.push("(empty sheet)");
    } else {
      // Convert to JSON string with indentation
      lines.push(JSON.stringify(sheet.data, null, 2));
    }

    lines.push("");
  }

  return lines.join("\n");
}
