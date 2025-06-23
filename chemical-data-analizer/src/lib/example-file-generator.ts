/**
 * 
 * 
 * @param filas Cantidad de filas a generar en el CSV, por defecto 10.
 * @returns Un archivo CSV descargable con datos de ejemplo para análisis de aceite.

 */

import { OIL_ANALYSIS_RANGES } from "../providers/type/data-types";
import * as XLSX from "xlsx";
const randomValue=(key:string):string=>{
    const {optimal}= OIL_ANALYSIS_RANGES[key] ?? { optimal: [0, 1] };
    const val= Math.random() * (optimal[1] - optimal[0]) + optimal[0];
    return val.toFixed(1);
}
export function generateExampleCSV(filas =10){
const elementKeys = Object.keys(OIL_ANALYSIS_RANGES);
const header = ["Fecha","Máquina",...elementKeys];
const rows: (string|number)[][] = [header];
const equipos = ["Equipo A", "Equipo B", "Equipo C", "Equipo D", "Equipo E"];
const baseDate= new Date("2023-01-01");

for(let i =0; i < filas; i++){
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 7); // Incrementa una semana por fila
    date.setHours(0, 0, 0, 0); // Asegura que la hora sea 00:00:00
    // Formatea la fecha como YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const equipo = equipos[Math.floor(Math.random() * equipos.length)];
    const values = elementKeys.map(key => randomValue(key));
    rows.push([formattedDate, equipo, ...values]);
}
const workSheet = XLSX.utils.aoa_to_sheet(rows);
const csv = XLSX.utils.sheet_to_csv(workSheet, { FS: ";" ,RS: "\n" });
 const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "example_data.csv");
    document.body.appendChild(link);
    link.click();
   setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);


}