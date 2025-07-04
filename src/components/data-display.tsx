
import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { DataTable } from "./data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import {  FileSpreadsheet, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { SQLExportDialog } from "./sql-export-dialog"
import type { ChemicalData } from "../providers/type/data-types"
import { useChemicalData, useFilteredData, useSelectedElements } from "../hook/use-chemical-data"
import { getAtomicNumber } from "../lib/periodic-table"
import { exportToExcel } from "../lib/excel-exporter"
import { ChartDisplay } from "./chart-display"


interface DataDisplayProps {
  data: ChemicalData
}

export function DataDisplay({ data }: DataDisplayProps) {
  const [activeTab, setActiveTab] = useState<string>("charts")
  const [dateRange] = useState<DateRange>({ from: undefined, to: undefined })

  // Usar TanStack Query para gestionar los datos
  useChemicalData()
  const { data: filteredData } = useFilteredData(data, [dateRange.from, dateRange.to])
  const { selectedElements, toggleElement, selectAll, deselectAll } = useSelectedElements(data)

  // Efecto para seleccionar todos los elementos automáticamente cuando se cargan los datos
  useEffect(() => {
    if (data && data.elements && data.elements.length > 0 && selectedElements.length === 0) {
      selectAll()
    }
  }, [data, selectedElements.length, selectAll])




  const handleExportExcel = async () => {
    if (filteredData) {
      await exportToExcel(filteredData, selectedElements)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculate some basic statistics
  const getStatistics = () => {
    const stats: Record<string, { min: number; max: number; avg: number; count: number }> = {}

    // Initialize stats for each element
    data.elements.forEach((element) => {
      stats[element.name] = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, count: 0 }
    })

    // Calculate min, max, sum for each element
    if (filteredData) {
      filteredData.samples.forEach((sample) => {
        data.elements.forEach((element, index) => {
          const value = sample.values[index]
          if (typeof value === "number" && !isNaN(value)) {
            stats[element.name].min = Math.min(stats[element.name].min, value)
            stats[element.name].max = Math.max(stats[element.name].max, value)
            stats[element.name].avg += value
            stats[element.name].count++
          }
        })
      })
    }

    // Calculate averages
    Object.keys(stats).forEach((key) => {
      if (stats[key].count > 0) {
        stats[key].avg = stats[key].avg / stats[key].count
      }
      // Handle case where min was never set (no valid values)
      if (stats[key].min === Number.POSITIVE_INFINITY) {
        stats[key].min = 0
      }
      if (stats[key].max === Number.NEGATIVE_INFINITY) {
        stats[key].max = 0
      }
    })

    return stats
  }

  // Generate diagnostic and recommendation based on values
  const getDiagnosticAndRecommendation = () => {
    const result: Record<string, { diagnostic: string; recommendation: string }> = {}

    data.elements.forEach((element) => {
      const stats = statistics[element.name]
      let diagnostic = "Normal"
      let recommendation = "No se requieren acciones"

      // Simple example logic - in a real app this would be more sophisticated
      if (stats.max > stats.avg * 1.5) {
        diagnostic = "Valores elevados detectados"
        recommendation = "Revisar proceso y calibrar equipos"
      } else if (stats.min < stats.avg * 0.5) {
        diagnostic = "Valores bajos detectados"
        recommendation = "Verificar sensores y toma de muestras"
      }

      result[element.name] = { diagnostic, recommendation }
    })

    return result
  }

  const statistics = getStatistics()
  const diagnostics = getDiagnosticAndRecommendation()

  // Verificar si hay datos para mostrar
  const hasData = filteredData?.samples.length && filteredData.elements.length

  if (!hasData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">No hay datos para mostrar</h2>
        <p className="text-gray-500">
          No se encontraron datos para mostrar. Por favor, verifica el archivo cargado o selecciona otros filtros.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="export-buttons">
        <h2 className="text-xl font-semibold">Resultados del Análisis</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportExcel} variant="secondary" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar a Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <SQLExportDialog data={filteredData} />
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="summary-cards">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Muestras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredData.samples.length}</p>
            {filteredData.samples.length !== data.samples.length && (
              <p className="text-xs text-gray-500 mt-1">Filtrado de {data.samples.length} muestras totales</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Elementos Analizados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.elements.length}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedElements.length} elementos seleccionados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rango de Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {filteredData.samples.length > 0 ? (
                <>
                  {filteredData.samples[0].date} - {filteredData.samples[filteredData.samples.length - 1].date}
                </>
              ) : (
                "No hay datos"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div id="tabs-section">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="table">Tabla de Datos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-4" data-value="charts">
            <ChartDisplay
              data={filteredData}
              selectedElements={selectedElements}
              dateRange={[dateRange.from, dateRange.to]}
              onElementToggle={toggleElement}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll} onDateRangeChange={function (): void {
                throw new Error("Function not implemented.")
              } }
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4" data-value="table">
            <div id="data-table">
              <DataTable data={filteredData} diagnostics={diagnostics} />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4" data-value="stats">
            <div className="bg-white p-6 rounded-lg border overflow-x-auto" id="stats-table">
              <h3 className="text-lg font-medium mb-4">Estadísticas por Elemento</h3>
              <div className="min-w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Elemento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nº Atómico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Mínimo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Máximo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnóstico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recomendación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(statistics).map(([element, stats]) => {
                      const atomicNumber = getAtomicNumber(element)
                      return (
                        <tr key={element}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{element}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {atomicNumber !== null && atomicNumber > 0 ? atomicNumber : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.min.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.max.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.avg.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {diagnostics[element]?.diagnostic}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {diagnostics[element]?.recommendation}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
