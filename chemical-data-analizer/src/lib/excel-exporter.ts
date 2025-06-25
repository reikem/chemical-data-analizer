
import * as XLSX from "xlsx"
import { toPng } from "html-to-image"
import { getAtomicNumber } from "./periodic-table"
import type { ChemicalData } from "../providers/type/data-types"


export async function exportToExcel(data: ChemicalData, selectedElements: string[]): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new()

    addDataSheet(workbook, data, selectedElements)

    addStatisticsSheet(workbook, data, selectedElements)

    await addChartsSheet(workbook)

    XLSX.writeFile(workbook, "analisis-quimico.xlsx")
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    alert("Error al exportar a Excel. Por favor, inténtelo de nuevo.")
  }
}

function addDataSheet(workbook: XLSX.WorkBook, data: ChemicalData, selectedElements: string[]): void {
  const headers = ["Fecha", "Máquina"]

  selectedElements.forEach((element) => {
    const atomicNumber = getAtomicNumber(element)
    const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber.toString() : "-"
    headers.push(`Nº Atómico (${element})`, element)
  })

  headers.push("Diagnóstico", "Recomendación")

  const rows = data.samples.map((sample) => {
    const row: any[] = [sample.date, sample.machine]

    selectedElements.forEach((element) => {
      const elementIndex = data.elements.findIndex((e) => e.name === element)
      const atomicNumber = getAtomicNumber(element)
      const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber.toString() : "-"

      if (elementIndex !== -1) {
        row.push(atomicNumberText, sample.values[elementIndex])
      } else {
        row.push("-", null)
      }
    })


    let diagnostic = "Normal"
    let recommendation = "No se requieren acciones"

    const hasHighValue = selectedElements.some((element) => {
      const elementIndex = data.elements.findIndex((e) => e.name === element)
      if (elementIndex !== -1) {
        const value = sample.values[elementIndex]
        return value > 1.5 * (data.samples.reduce((sum, s) => sum + s.values[elementIndex], 0) / data.samples.length)
      }
      return false
    })

    if (hasHighValue) {
      diagnostic = "Valores elevados detectados"
      recommendation = "Revisar proceso y calibrar equipos"
    }

    row.push(diagnostic, recommendation)

    return row
  })


  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])


  const colWidths = headers.map(() => ({ wch: 15 }))
  worksheet["!cols"] = colWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")
}

function addStatisticsSheet(workbook: XLSX.WorkBook, data: ChemicalData, selectedElements: string[]): void {

  const stats: Record<string, { min: number; max: number; avg: number }> = {}

  selectedElements.forEach((element) => {
    const elementIndex = data.elements.findIndex((e) => e.name === element)
    if (elementIndex !== -1) {
      stats[element] = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0 }

      let sum = 0
      let count = 0
      data.samples.forEach((sample) => {
        const value = sample.values[elementIndex]
        if (typeof value === "number" && !isNaN(value)) {
          stats[element].min = Math.min(stats[element].min, value)
          stats[element].max = Math.max(stats[element].max, value)
          sum += value
          count++
        }
      })

      if (count > 0) {
        stats[element].avg = sum / count
      }

      if (stats[element].min === Number.POSITIVE_INFINITY) {
        stats[element].min = 0
      }
      if (stats[element].max === Number.NEGATIVE_INFINITY) {
        stats[element].max = 0
      }
    }
  })

  const diagnostics: Record<string, { diagnostic: string; recommendation: string }> = {}

  Object.entries(stats).forEach(([element, stat]) => {
    let diagnostic = "Normal"
    let recommendation = "No se requieren acciones"

    if (stat.max > stat.avg * 1.5) {
      diagnostic = "Valores elevados detectados"
      recommendation = "Revisar proceso y calibrar equipos"
    } else if (stat.min < stat.avg * 0.5) {
      diagnostic = "Valores bajos detectados"
      recommendation = "Verificar sensores y toma de muestras"
    }

    diagnostics[element] = { diagnostic, recommendation }
  })

  const headers = ["Elemento", "Nº Atómico", "Mínimo", "Máximo", "Promedio", "Diagnóstico", "Recomendación"]
  const rows = Object.entries(stats).map(([element, stat]) => {
    const atomicNumber = getAtomicNumber(element)
    const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber : "-"

    return [
      element,
      atomicNumberText,
      stat.min,
      stat.max,
      stat.avg,
      diagnostics[element].diagnostic,
      diagnostics[element].recommendation,
    ]
  })

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  const colWidths = headers.map(() => ({ wch: 20 }))
  worksheet["!cols"] = colWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, "Estadísticas")
}

async function addChartsSheet(workbook: XLSX.WorkBook): Promise<void> {
  try {
    const chartContainers = document.querySelectorAll(".recharts-responsive-container")
    if (chartContainers.length === 0) {
      const worksheet = XLSX.utils.aoa_to_sheet([["No se encontraron gráficos para exportar"]])
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gráficos")
      return
    }

    const activeChart = document.querySelector(".recharts-responsive-container")
    if (activeChart) {
      const chartImage = await toPng(activeChart as HTMLElement, { quality: 0.95 })

      const base64 = chartImage.split(",")[1]

      const worksheet = XLSX.utils.aoa_to_sheet([["Gráfico"], [""]]) 

      if (!worksheet["!images"]) worksheet["!images"] = []


      const noteWorksheet = XLSX.utils.aoa_to_sheet([
        ["Nota: Los gráficos están disponibles en la exportación a PDF"],
        ["Para una mejor visualización de los gráficos, utilice la opción 'Exportar a PDF'"],
      ])

      XLSX.utils.book_append_sheet(workbook, noteWorksheet, "Gráficos")
    }
  } catch (error) {
    console.error("Error capturing charts for Excel:", error)
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Error al capturar los gráficos para Excel"],
      ["Para una mejor visualización de los gráficos, utilice la opción 'Exportar a PDF'"],
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gráficos")
  }
}
