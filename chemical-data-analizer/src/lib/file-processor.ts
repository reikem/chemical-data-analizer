import * as XLSX from "xlsx"
import {
  OIL_ANALYSIS_RANGES,
  type ChemicalData,
  type Sample,
} from "../providers/type/data-types"
import { normalizeDate } from "./date-utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface ProcessOptions {
  /** Índices (base-0) de las columnas con fechas; si se omite → autodetect */
  dateColumnIndices?: number[]
  /** Formato preferido de esas fechas (dd/mm/yyyy, yyyy-mm-dd, …)          */
  dateFormat?: string
}


export async function getFileHeaders(file: File) {

  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "csv") return parseCSVHeaders(file)
  if (ext === "xls" || ext === "xlsx") return parseExcelHeaders(file)
  throw new Error("Formato no soportado (usa CSV o XLSX)")
}

function parseCSVHeaders(file: File) {
  return new Promise<{ headers: string[]; preview: string[][] }>((resolve, reject) => {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const rows = ((e.target?.result as string) || "")
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l) => l.split(",").map((v) => v.trim()))
        if (!rows.length) throw new Error("CSV vacío")

        resolve({ headers: rows[0], preview: rows.slice(1, 6) })
      } catch (err) {
        reject(err)
      }
    }
    r.onerror = reject
    r.readAsText(file)
  })
}

function parseExcelHeaders(file: File) {
  return new Promise<{ headers: string[]; preview: string[][] }>((resolve, reject) => {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const wb   = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" })
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as any[][]
        if (!data.length) throw new Error("Excel vacío")

        resolve({ headers: data[0].map(String), preview: data.slice(1, 6).map((r) => r.map(String)) })
      } catch (err) {
        reject(err)
      }
    }
    r.onerror = reject
    r.readAsArrayBuffer(file)
  })
}

export async function processFile(file: File, opts: ProcessOptions = {}): Promise<ChemicalData> {

  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "csv")  return parseCSV(file, opts)
  if (ext === "xls" || ext === "xlsx") return parseXLSX(file, opts)
  throw new Error("Formato no soportado (usa CSV o XLSX)")
}

function parseCSV(file: File, opts: ProcessOptions) {
  return new Promise<ChemicalData>((resolve, reject) => {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const rows = ((e.target?.result as string) || "")
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l) => l.split(",").map((v) => v.trim()))

        resolve(parseDataFromArray(rows, opts))
      } catch (err) { reject(err) }
    }
    r.onerror = reject
    r.readAsText(file)
  })
}

function parseXLSX(file: File, opts: ProcessOptions) {
  return new Promise<ChemicalData>((resolve, reject) => {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const wb   = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" })
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as any[][]
        resolve(parseDataFromArray(rows, opts))
      } catch (err) { reject(err) }
    }
    r.onerror = reject
    r.readAsArrayBuffer(file)
  })
}

/* -------------------------------------------------------------------------- */
/*  3. PARSER CORE                                                            */
/* -------------------------------------------------------------------------- */
function parseDataFromArray(raw: any[][], opts: ProcessOptions): ChemicalData {
  if (!raw.length) throw new Error("Archivo sin datos")

  /* 3.1 Headers --------------------------------------------------------- */
  const headers = raw[0].map(String)

  /* 3.2 Forzar que existan todas las columnas previstas ----------------- */
  const expected = Object.keys(OIL_ANALYSIS_RANGES)
  const missing  = expected.filter(
    (el) => !headers.some((h) => h.toLowerCase() === el.toLowerCase()),
  )
  if (missing.length) {
    headers.push(...missing)
    raw[0] = headers
    raw.slice(1).forEach((r) => { while (r.length < headers.length) r.push("") })
  }

  /* 3.3 Column indices --------------------------------------------------- */
  const dateIdxs = opts.dateColumnIndices?.length
    ? opts.dateColumnIndices
    : [findDateColumn(headers, raw[1])]


  const adminCols = {
    machine:   findColumn(headers, ["máquina", "maquina", "machine"]),
    unit:      findColumn(headers, ["unidad", "unit"]),
    component: findColumn(headers, ["componente", "component"]),
    zone:      findColumn(headers, ["zona", "zone"]),
    country:   findColumn(headers, ["país", "pais", "country"]),
    model:     findColumn(headers, ["modelo", "model"]),
  }

  const administrative = [...dateIdxs, ...Object.values(adminCols)].filter((i) => i !== -1)
  const elementIdxs = headers.map((_, i) => i).filter((i) => !administrative.includes(i))


  /* 3.4 Map elements ----------------------------------------------------- */
  const elements = elementIdxs.map((i) => ({ name: headers[i], unit: "" }))

  /* 3.5 Parse rows ------------------------------------------------------- */
  const samples: Sample[] = []
  raw.slice(1).forEach((row, i) => {
    if (!row?.length) return

    try {
      // fecha (aceptamos el primer índice con dato)
      const dIdx = dateIdxs.find((idx) => row[idx])
      if (dIdx === undefined) throw new Error("Sin fecha")

      const sample: Sample = {
        date: normalizeDateSmart(row[dIdx], opts.dateFormat),
        machine:    readStr(row, adminCols.machine),
        unit:       readStr(row, adminCols.unit),
        component:  readStr(row, adminCols.component),
        zone:       readStr(row, adminCols.zone),
        country:    readStr(row, adminCols.country),
        model:      readStr(row, adminCols.model),
        values: elementIdxs.map((idx) => readNum(row[idx])),
      }
      samples.push(sample)
    } catch (err) {
      console.warn(
        `[DBG-11] Fila #${i + 2} descartada: ${(err as Error).message}`,
      )
    }
  })

  if (!samples.length) throw new Error("No se generaron muestras válidas")

  return { elements, samples }
}

/* -------------------------------------------------------------------------- */
/*  4. HELPERS                                                                */
/* -------------------------------------------------------------------------- */
function findDateColumn(headers: string[], firstRow: any[]) {
  const hints = ["fecha", "date", "day", "time"]
  const idx   = headers.findIndex((h) => hints.some((k) => h.toLowerCase().includes(k)))
  if (idx !== -1) return idx

  const looksLike = firstRow.findIndex((v) => isLikelyDate(String(v)))
  return looksLike !== -1 ? looksLike : 0     // último recurso: primera col
}

function findColumn(headers: string[], kws: string[]) {
  return headers.findIndex((h) => kws.some((k) => h.toLowerCase().includes(k)))
}

function isLikelyDate(s: string) {
  return [
    /\d{4}-\d{1,2}-\d{1,2}/,       // yyyy-mm-dd
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,   // dd/mm/yyyy
    /\d{1,2}-\d{1,2}-\d{2,4}/,
  ].some((rx) => rx.test(s))
}

function readStr(row: any[], idx: number) {
  return idx !== -1 ? String(row[idx] ?? "").trim() : ""
}

function readNum(val: any) {
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."))
  return isNaN(n) ? 0 : n
}

/* -------------------------------------------------------------------------- */
/*  5. Date handling – tolerante                                              */
/* -------------------------------------------------------------------------- */
function normalizeDateSmart(raw: string | number | Date, fmt?: string) {
  try {
    return normalizeDate(raw, fmt)            // intento estricto
  } catch {
    /* fallback – probamos varios formatos */
    const tryFmt = ["yyyy-mm-dd", "dd/mm/yyyy", "mm/dd/yyyy", "dd-mm-yyyy"]
    for (const f of tryFmt) {
      try { return normalizeDate(raw, f) } catch { /* next */ }
    }
    // último recurso: Date.parse
    const d = new Date(raw as any)
    if (!isNaN(d.getTime()))
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    throw new Error(`Fecha inválida: «${raw}»`)
  }
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)