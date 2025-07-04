/* -------------------------------------------------------------------------- */
/*  GENERAR CSV DE EJEMPLO                                                    */
/* -------------------------------------------------------------------------- */
import * as XLSX from "xlsx";
import { OIL_ANALYSIS_RANGES } from "../providers/type/data-types";

/**
 * Genera y descarga un CSV de ejemplo con los mismos encabezados que espera
 * el procesador de archivos de la aplicación.
 *
 * @param rows Número de filas de datos a crear (def. 10)
 */
export function generateExampleCSV(rows = 10): void {
  const elementKeys = Object.keys(OIL_ANALYSIS_RANGES);
  const header      = ["Fecha", "Máquina", ...elementKeys];

  const equipos = ["Equipo A", "Equipo B", "Equipo C", "Equipo D", "Equipo E"];
  const data: (string | number)[][] = [header];

  const base = new Date("2023-01-01");

  /* --- utilidades ------------------------------------------------------ */
  const rand = (min: number, max: number) =>
    +(Math.random() * (max - min) + min).toFixed(1);

  const formatDate = (d: Date) =>
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

  /* --- construir filas -------------------------------------------------- */
  for (let i = 0; i < rows; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 7); // una semana entre muestras

    const row = [
      formatDate(d),
      equipos[Math.floor(Math.random() * equipos.length)],
      ...elementKeys.map((k) => {
        const [min, max] = OIL_ANALYSIS_RANGES[k]?.optimal ?? [0, 1];
        return rand(min, max);
      }),
    ];

    data.push(row);
  }

  /* --- convertir a CSV (separador coma) --------------------------------- */
  const ws  = XLSX.utils.aoa_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ",", RS: "\n" });

  /* --- descarga --------------------------------------------------------- */
  const blob = new Blob(
    [
      // opcional: BOM para Excel-Windows
      new Uint8Array([0xef, 0xbb, 0xbf]),
      csv,
    ],
    { type: "text/csv;charset=utf-8;" },
  );

  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href        = url;
  link.download    = "example_oil_analysis.csv";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}
