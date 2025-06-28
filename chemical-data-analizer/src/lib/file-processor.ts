
import * as XLSX from "xlsx";
import { OIL_ANALYSIS_RANGES, type ChemicalData, type Sample } from "../providers/type/data-types";
import { normalizeDate } from "./date-utils";


interface ProcessOptions {
  /** Índices de columnas que contienen fechas, si el usuario los conoce */
  dateColumnIndices?: number[];
  /** Formato de fecha preferido, p.ej. 'DD/MM/YYYY' */
  dateFormat?: string;
}

/* ═══════════════════════════════
 * 1. HEADER / PREVIEW EXTRACTION
 * ═══════════════════════════════ */
export async function getFileHeaders(file: File): Promise<{
  headers: string[];
  preview: string[][];
}> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return getCSVHeaders(file);
  if (ext === "xlsx" || ext === "xls") return getExcelHeaders(file);
  throw new Error("Formato no soportado (use CSV o XLSX).");
}

async function getCSVHeaders(file: File) {
  return new Promise<{ headers: string[]; preview: string[][] }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const lines = (e.target?.result as string).split("\n");
        const rows = lines.slice(0, 6).filter(Boolean).map((l) => l.split(",").map((v) => v.trim()));
        if (!rows.length) throw new Error("CSV vacío o malformado");
        resolve({ headers: rows[0], preview: rows.slice(1) });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function getExcelHeaders(file: File) {
  return new Promise<{ headers: string[]; preview: string[][] }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as any[][];
        if (!data.length) throw new Error("Excel vacío o malformado");
        resolve({ headers: data[0].map(String), preview: data.slice(1, 6).map((r) => r.map(String)) });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/* ═══════════════════════════════
 * 2. FILE-TO-DATA PARSER
 * ═══════════════════════════════ */
export async function processFile(
  file: File,
  options: ProcessOptions = {}
): Promise<ChemicalData> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return processCSV(file, options);
  if (ext === "xlsx" || ext === "xls") return processExcel(file, options);
  throw new Error("Formato no soportado (use CSV o XLSX).");
}

async function processCSV(file: File, opts: ProcessOptions) {
  return new Promise<ChemicalData>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = (e.target?.result as string)
          .split("\n")
          .filter(Boolean)
          .map((l) => l.split(",").map((v) => v.trim()));
        resolve(parseDataFromArray(rows, opts));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function processExcel(file: File, opts: ProcessOptions) {
  return new Promise<ChemicalData>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as any[][];
        resolve(parseDataFromArray(rows, opts));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/* ═══════════════════════════════
 * 3. CORE PARSER WITH AUTO-COLUMNS
 * ═══════════════════════════════ */
function parseDataFromArray(data: any[][], opts: ProcessOptions): ChemicalData {
  if (!data.length) throw new Error("Archivo sin datos.");

  /* 3.1 Cabeceras */
  const headers: string[] = data[0].map(String);

  /* 3.2 Asegurar TODAS las columnas de elementos */
  const expected = Object.keys(OIL_ANALYSIS_RANGES); // o filtra
  const missing = expected.filter(
    (el) => !headers.some((h) => h.toLowerCase() === el.toLowerCase())
  );
  headers.push(...missing);
  data[0] = headers;                         // actualiza fila 0
  data.slice(1).forEach((r) => {
    while (r.length < headers.length) r.push(0); // rellena filas
  });

  /* 3.3 Detectar columnas clave */
  const dateIdxs =
    opts.dateColumnIndices?.length ? opts.dateColumnIndices : [findDateColumnIndex(headers, data[1])];
  if (dateIdxs[0] === -1) throw new Error("No se halló columna de fecha.");

  const machineIdx   = findColumnIndex(headers, ["máquina", "maquina", "machine"]);
  const unitIdx      = findColumnIndex(headers, ["unidad", "unit"]);
  const componentIdx = findColumnIndex(headers, ["componente", "component"]);
  const zoneIdx      = findColumnIndex(headers, ["zona", "zone"]);
  const countryIdx   = findColumnIndex(headers, ["país", "pais", "country"]);
  const modelIdx     = findColumnIndex(headers, ["modelo", "model"]);

  /* 3.4 Índices de elementos (excluir los administrativos) */
  const administrative = [
    ...dateIdxs,
    machineIdx,
    unitIdx,
    componentIdx,
    zoneIdx,
    countryIdx,
    modelIdx,
  ].filter((i) => i !== -1);

  const elementIdxs = headers
    .map((_, i) => i)
    .filter((i) => !administrative.includes(i));

  interface ChemicalElement {
    name: string;
    unit: string;
  }
  
  const elements: ChemicalElement[] = elementIdxs.map((i) => ({ name: headers[i], unit: "" }));

  /* 3.5 Procesar filas */
  const samples: Sample[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row.length) continue;

    // verificar fecha
    const dateValIdx = dateIdxs.find((idx) => row[idx]);
    if (dateValIdx === undefined) continue;

    const sample: Sample = {
      date: normalizeDate(row[dateValIdx], opts.dateFormat),
      machine: machineIdx !== -1 ? String(row[machineIdx] ?? "") : "",
      unit:    unitIdx    !== -1 ? String(row[unitIdx] ?? "")    : "",
      component: componentIdx !== -1 ? String(row[componentIdx] ?? "") : "",
      zone:      zoneIdx      !== -1 ? String(row[zoneIdx] ?? "")      : "",
      country:   countryIdx   !== -1 ? String(row[countryIdx] ?? "")   : "",
      model:     modelIdx     !== -1 ? String(row[modelIdx] ?? "")     : "",
      values: elementIdxs.map((idx) => {
        const v = row[idx];
        const num = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
        return isNaN(num) ? 0 : num;
      }),
    };

    samples.push(sample);
  }

  if (!samples.length) console.warn("No se generaron muestras; verifique archivo.");

  return { elements, samples };
}

/* ═══════════════════════════════
 * 4. HELPERS
 * ═══════════════════════════════ */
function findDateColumnIndex(headers: string[], firstRow: any[]) {
  const hints = ["fecha", "date", "time", "día", "day"];
  const headerIdx = headers.findIndex((h) => hints.some((k) => h.toLowerCase().includes(k)));
  if (headerIdx !== -1) return headerIdx;

  const looksLikeDate = firstRow.findIndex((v) => isLikelyDate(String(v)));
  return looksLikeDate !== -1 ? looksLikeDate : 0;
}

function findColumnIndex(headers: string[], keywords: string[]) {
  return headers.findIndex((h) => keywords.some((k) => h.toLowerCase().includes(k)));
}

function isLikelyDate(val: string) {
  return [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,
    /\d{1,2}-\d{1,2}-\d{2,4}/,
    /\d{4}-\d{1,2}-\d{1,2}/,
  ].some((rex) => rex.test(val));
}
