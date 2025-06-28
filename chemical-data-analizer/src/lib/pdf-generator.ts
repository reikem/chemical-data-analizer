import type { ChemicalData } from "../providers/type/data-types"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Register the autoTable plugin with jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}
import { toPng } from "html-to-image"
import { getAtomicNumber } from "../lib/periodic-table"

export async function generatePDF(data: ChemicalData, selectedElements: string[], activeTab: string): Promise<void> {
  try {
    // Crear un nuevo documento PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Añadir página de título
    addTitlePage(doc, data)

    // Capturar los elementos visuales de la interfaz
    const chartImage = await captureChartImage()
    const statsImage = await captureStatsImage()
    const tableImage = await captureTableImage()

    // Añadir secciones según la pestaña activa o todas las secciones
    if (activeTab === "charts" || activeTab === "all") {
      doc.addPage()
      await addChartsSection(doc, data, selectedElements, chartImage)
    }

    if (activeTab === "table" || activeTab === "all") {
      doc.addPage()
      await addTableSection(doc, data, selectedElements, tableImage)
    }

    if (activeTab === "stats" || activeTab === "all") {
      doc.addPage()
      await addStatsSection(doc, data, selectedElements, statsImage)
    }

    // Guardar el PDF
    doc.save("analisis-quimico.pdf")
  } catch (error) {
    console.error("Error generando PDF:", error)
    alert("Error al generar el PDF. Por favor, inténtelo de nuevo.")
  }
}

function addTitlePage(doc: jsPDF, data: ChemicalData): void {
  // Añadir fondo gris claro similar al de la aplicación
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 297, "F")

  // Añadir encabezado con fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 10, 190, 277, 3, 3, "F")

  // Título principal
  doc.setFont("helvetica", "bold")
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  doc.text("Analizador de Datos Químicos", 105, 40, { align: "center" })

  // Línea decorativa
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.5)
  doc.line(40, 50, 170, 50)

  // Fecha de generación
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  const currentDate = new Date()
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${currentDate.getFullYear()}`
  doc.text(`Fecha de generación: ${formattedDate}`, 105, 65, { align: "center" })

  // Tarjetas de resumen (similar a las de la interfaz)
  addSummaryCard(doc, "Total de Muestras", data.samples.length.toString(), 30, 90, 150, 30)
  addSummaryCard(doc, "Elementos Analizados", data.elements.length.toString(), 30, 130, 150, 30)

  if (data.samples.length > 0) {
    addSummaryCard(
      doc,
      "Rango de Fechas",
      `${data.samples[0].date} - ${data.samples[data.samples.length - 1].date}`,
      30,
      170,
      150,
      30,
    )
  }

  // Información adicional
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Este informe contiene el análisis de los datos químicos procesados.", 105, 220, { align: "center" })
  doc.text("Las siguientes páginas muestran los gráficos, tablas y estadísticas.", 105, 230, { align: "center" })

  // Pie de página
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Generado por Analizador de Datos Químicos", 105, 280, { align: "center" })
}

function addSummaryCard(
  doc: jsPDF,
  title: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  // Dibujar tarjeta con sombra
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(240, 240, 240)
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, width, height, 3, 3, "F")

  // Título de la tarjeta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(title, x + 10, y + 10)

  // Valor
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(value, x + 10, y + 22)
}

async function captureChartImage(): Promise<string | null> {
  try {
    // Intentar capturar el gráfico activo
    const chartContainer = document.querySelector(".recharts-responsive-container")
    if (!chartContainer) return null

    // Capturar como PNG
    return await toPng(chartContainer as HTMLElement, {
      quality: 0.95,
      backgroundColor: "#ffffff",
    })
  } catch (error) {
    console.error("Error capturando gráfico:", error)
    return null
  }
}

async function captureStatsImage(): Promise<string | null> {
  try {
    // Intentar capturar la tabla de estadísticas
    const statsContainer = document.querySelector('[data-value="stats"] .bg-white')
    if (!statsContainer) return null

    // Capturar como PNG
    return await toPng(statsContainer as HTMLElement, {
      quality: 0.95,
      backgroundColor: "#ffffff",
    })
  } catch (error) {
    console.error("Error capturando estadísticas:", error)
    return null
  }
}

async function captureTableImage(): Promise<string | null> {
  try {
    // Intentar capturar la tabla de datos
    const tableContainer = document.querySelector('[data-value="table"] .rounded-md.border')
    if (!tableContainer) return null

    // Capturar como PNG
    return await toPng(tableContainer as HTMLElement, {
      quality: 0.95,
      backgroundColor: "#ffffff",
    })
  } catch (error) {
    console.error("Error capturando tabla:", error)
    return null
  }
}

async function addChartsSection(
  doc: jsPDF,
  data: ChemicalData,
  selectedElements: string[],
  chartImage: string | null,
): Promise<void> {
  // Añadir fondo gris claro similar al de la aplicación
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 297, "F")

  // Añadir encabezado con fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 10, 190, 40, 3, 3, "F")

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text("Gráficos", 20, 30)

  // Añadir pestañas simuladas (como en la interfaz)
  addTabsSimulation(doc, "charts", 10, 55, 190)

  // Contenedor principal
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 65, 190, 222, 3, 3, "F")

  if (chartImage) {
    // Añadir la imagen del gráfico capturado
    try {
      doc.addImage(chartImage, "PNG", 15, 70, 180, 120)
    } catch (error) {
      console.error("Error añadiendo imagen del gráfico al PDF:", error)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text("No se pudo incluir el gráfico en el PDF.", 105, 130, { align: "center" })
    }
  } else {
    // Mensaje si no se pudo capturar el gráfico
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text("No se pudo capturar el gráfico para incluirlo en el PDF.", 105, 130, { align: "center" })
  }

  // Añadir lista de elementos seleccionados
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("Elementos Seleccionados", 20, 210)

  // Crear una tabla con los elementos seleccionados y sus números atómicos
  const elementsTableData = []
  const elementsPerRow = 2

  for (let i = 0; i < selectedElements.length; i += elementsPerRow) {
    const row = []
    for (let j = 0; j < elementsPerRow; j++) {
      if (i + j < selectedElements.length) {
        const element = selectedElements[i + j]
        const atomicNumber = getAtomicNumber(element)
        const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber.toString() : "-"
        row.push(`• ${element} (Nº Atómico: ${atomicNumberText})`)
      } else {
        row.push("")
      }
    }
    elementsTableData.push(row)
  }

  autoTable(doc, {
    startY: 220,
    body: elementsTableData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 90 },
    },
  })

  // Pie de página
  addPageFooter(doc)
}

async function addTableSection(
  doc: jsPDF,
  data: ChemicalData,
  selectedElements: string[],
  tableImage: string | null,
): Promise<void> {
  // Añadir fondo gris claro similar al de la aplicación
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 297, "F")

  // Añadir encabezado con fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 10, 190, 40, 3, 3, "F")

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text("Tabla de Datos", 20, 30)

  // Añadir pestañas simuladas (como en la interfaz)
  addTabsSimulation(doc, "table", 10, 55, 190)

  // Contenedor principal
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 65, 190, 222, 3, 3, "F")

  if (tableImage) {
    // Añadir la imagen de la tabla capturada
    try {
      // Calcular dimensiones para mantener la proporción
      const imgWidth = 180
      const imgHeight = 120
      doc.addImage(tableImage, "PNG", 15, 70, imgWidth, imgHeight)

      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text("Vista previa de la tabla. Los datos completos están disponibles en la siguiente tabla.", 105, 200, {
        align: "center",
      })
    } catch (error) {
      console.error("Error añadiendo imagen de la tabla al PDF:", error)
    }
  }

  // Añadir tabla de datos usando autoTable
  // Preparar encabezados
  const headers = ["Fecha", "Máquina"]

  // Añadir encabezados de elementos seleccionados con números atómicos
  selectedElements.forEach((element) => {
    const atomicNumber = getAtomicNumber(element)
    headers.push(`Nº At.`, element)
  })

  // Añadir encabezados de diagnóstico y recomendación
  headers.push("Diagnóstico", "Recomendación")

  // Preparar datos de la tabla
  const tableData = data.samples.slice(0, 10).map((sample) => {
    const row: any[] = [sample.date, sample.machine]

    // Añadir valores de elementos seleccionados con números atómicos
    selectedElements.forEach((element) => {
      const elementIndex = data.elements.findIndex((e) => e.name === element)
      const atomicNumber = getAtomicNumber(element)
      const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber.toString() : "-"

      if (elementIndex !== -1) {
        const value = sample.values[elementIndex]
        row.push(atomicNumberText, typeof value === "number" ? value.toFixed(2) : value)
      } else {
        row.push("-", "N/A")
      }
    })

    // Añadir diagnóstico y recomendación simples
    let diagnostic = "Normal"
    let recommendation = "No se requieren acciones"

    // Lógica simple de ejemplo
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

  // Generar tabla
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 210,
    theme: "grid",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 15 }, // Fecha
      1: { cellWidth: 15 }, // Máquina
    },
    didDrawPage: (data) => {
      // Si hay más filas de las que caben en una página, añadir nota
      if (data.table.rows.length < tableData.length) {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(8)
        doc.text("* Se muestran las primeras 10 muestras. El archivo completo contiene más datos.", 105, 280, {
          align: "center",
        })
      }
    },
  })

  // Pie de página
  addPageFooter(doc)
}

async function addStatsSection(
  doc: jsPDF,
  data: ChemicalData,
  selectedElements: string[],
  statsImage: string | null,
): Promise<void> {
  // Añadir fondo gris claro similar al de la aplicación
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 297, "F")

  // Añadir encabezado con fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 10, 190, 40, 3, 3, "F")

  // Título de la sección
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text("Estadísticas", 20, 30)

  // Añadir pestañas simuladas (como en la interfaz)
  addTabsSimulation(doc, "stats", 10, 55, 190)

  // Contenedor principal
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 65, 190, 222, 3, 3, "F")

  if (statsImage) {
    // Añadir la imagen de las estadísticas capturada
    try {
      // Calcular dimensiones para mantener la proporción
      const imgWidth = 180
      const imgHeight = 120
      doc.addImage(statsImage, "PNG", 15, 70, imgWidth, imgHeight)
    } catch (error) {
      console.error("Error añadiendo imagen de estadísticas al PDF:", error)
    }
  }

  // Calcular estadísticas
  const stats: Record<string, { min: number; max: number; avg: number }> = {}

  // Inicializar estadísticas para cada elemento
  selectedElements.forEach((element) => {
    const elementIndex = data.elements.findIndex((e) => e.name === element)
    if (elementIndex !== -1) {
      stats[element] = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0 }

      // Calcular min, max, sum
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

      // Calcular promedio
      if (count > 0) {
        stats[element].avg = sum / count
      }

      // Manejar caso donde min nunca se estableció (no hay valores válidos)
      if (stats[element].min === Number.POSITIVE_INFINITY) {
        stats[element].min = 0
      }
      if (stats[element].max === Number.NEGATIVE_INFINITY) {
        stats[element].max = 0
      }
    }
  })

  // Generar diagnóstico y recomendación basados en estadísticas
  const diagnostics: Record<string, { diagnostic: string; recommendation: string }> = {}

  Object.entries(stats).forEach(([element, stat]) => {
    let diagnostic = "Normal"
    let recommendation = "No se requieren acciones"

    // Lógica simple de ejemplo
    if (stat.max > stat.avg * 1.5) {
      diagnostic = "Valores elevados detectados"
      recommendation = "Revisar proceso y calibrar equipos"
    } else if (stat.min < stat.avg * 0.5) {
      diagnostic = "Valores bajos detectados"
      recommendation = "Verificar sensores y toma de muestras"
    }

    diagnostics[element] = { diagnostic, recommendation }
  })

  // Preparar datos de tabla para estadísticas
  const tableData = Object.entries(stats).map(([element, stat]) => {
    const atomicNumber = getAtomicNumber(element)
    const atomicNumberText = atomicNumber !== null && atomicNumber > 0 ? atomicNumber.toString() : "-"

    return [
      element,
      atomicNumberText,
      stat.min.toFixed(2),
      stat.max.toFixed(2),
      stat.avg.toFixed(2),
      diagnostics[element].diagnostic,
      diagnostics[element].recommendation,
    ]
  })

  // Título de la tabla
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("Estadísticas por Elemento", 20, 210)

  // Generar tabla
  doc.autoTable({
    head: [["Elemento", "Nº Atómico", "Mínimo", "Máximo", "Promedio", "Diagnóstico", "Recomendación"]],
    body: tableData,
    startY: 220,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
  })

  // Pie de página
  addPageFooter(doc)
}

function addTabsSimulation(doc: jsPDF, activeTab: string, x: number, y: number, width: number): void {
  const tabWidth = width / 3
  const tabHeight = 10
  const tabs = ["charts", "table", "stats"]
  const tabLabels = ["Gráficos", "Tabla de Datos", "Estadísticas"]

  tabs.forEach((tab, index) => {
    const tabX = x + index * tabWidth

    // Dibujar fondo de pestaña
    if (tab === activeTab) {
      // Pestaña activa
      doc.setFillColor(255, 255, 255)
    } else {
      // Pestaña inactiva
      doc.setFillColor(240, 240, 240)
    }

    doc.roundedRect(tabX, y, tabWidth, tabHeight, 2, 2, "F")

    // Texto de la pestaña
    doc.setFont("helvetica", tab === activeTab ? "bold" : "normal")
    doc.setFontSize(10)
    doc.setTextColor(tab === activeTab ? 0 : 100, tab === activeTab ? 0 : 100, tab === activeTab ? 0 : 100)
    doc.text(tabLabels[index], tabX + tabWidth / 2, y + 7, { align: "center" })
  })
}

function addPageFooter(doc: jsPDF): void {
  // Añadir número de página
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Página ${doc.getNumberOfPages()}`, 105, 290, { align: "center" })
}
