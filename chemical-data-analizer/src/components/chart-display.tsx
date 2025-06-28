"use client"

import { useState, useEffect } from "react"

import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { LineChart } from "./charts/line-chart"
import { BarChart } from "./charts/bar-chart"
import { ScatterChart } from "./charts/scatter-chart"
import { AreaChart } from "./charts/area-chart"
import { ComposedChart } from "./charts/composed-chart"
import { HeatMapChart } from "./charts/heatmap-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DateRangePicker } from "./date-range-picker"
import { CheckSquare, Square } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import type { ChemicalData } from "../providers/type/data-types"

interface ChartDisplayProps {
  data: ChemicalData
  selectedElements: string[]
  dateRange: [Date | undefined, Date | undefined]
  onElementToggle: (element: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onDateRangeChange: (range: any) => void
}

export function ChartDisplay({
  data,
  selectedElements,
  dateRange,
  onElementToggle,
  onSelectAll,
  onDeselectAll,
  onDateRangeChange,
}: ChartDisplayProps) {
  const [chartType, setChartType] = useState<string>("line")
  const [timeGrouping, setTimeGrouping] = useState<string>("none")
  const [filteredData, setFilteredData] = useState<ChemicalData>(data)

  // Debug: Log para verificar los datos
  console.log("ChartDisplay - Data:", data)
  console.log("ChartDisplay - Selected Elements:", selectedElements)
  console.log("ChartDisplay - Filtered Data:", filteredData)

  // Asegurarse de que los datos se inicialicen correctamente
  useEffect(() => {
    if (data && data.samples && data.elements) {
      setFilteredData(data)
    }
  }, [data])

  // Filter data based on date range
  useEffect(() => {
    if (!data || !data.samples || !data.elements) return

    if (!dateRange[0] && !dateRange[1]) {
      setFilteredData(data)
      return
    }

    const [startDate, endDate] = dateRange

    const filteredSamples = data.samples.filter((sample) => {
      const sampleDate = new Date(sample.date.split("/").reverse().join("-"))

      if (startDate && endDate) {
        return sampleDate >= startDate && sampleDate <= endDate
      } else if (startDate) {
        return sampleDate >= startDate
      } else if (endDate) {
        return sampleDate <= endDate
      }

      return true
    })

    setFilteredData({
      ...data,
      samples: filteredSamples,
    })
  }, [data, dateRange])

  // Prepare data with time grouping if needed
  const getProcessedData = () => {
    if (!filteredData || !filteredData.samples || !filteredData.elements) {
      return {
        elements: [],
        samples: [],
      }
    }

    if (timeGrouping === "none") {
      return filteredData
    }

    // Clone the data to avoid modifying the original
    const processedData = { ...filteredData, samples: [...filteredData.samples] }

    // Sort samples by date
    processedData.samples.sort((a, b) => {
      const dateA = new Date(a.date.split("/").reverse().join("-"))
      const dateB = new Date(b.date.split("/").reverse().join("-"))
      return dateA.getTime() - dateB.getTime()
    })

    return processedData
  }

  const processedData = getProcessedData()

  // Verificar si hay datos para mostrar
  const hasData = processedData.samples.length > 0 && processedData.elements.length > 0
  const hasSelectedElements = selectedElements.length > 0

  console.log("ChartDisplay - Has Data:", hasData)
  console.log("ChartDisplay - Has Selected Elements:", hasSelectedElements)

  if (!hasData) {
    return (
      <Alert className="my-4">
        <AlertDescription>
          No hay datos disponibles para mostrar. Por favor, verifica el archivo cargado o selecciona otros filtros.
          <br />
          <small>
            Debug: Samples: {processedData.samples.length}, Elements: {processedData.elements.length}
          </small>
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasSelectedElements) {
    return (
      <Alert className="my-4">
        <AlertDescription>
          No hay elementos seleccionados para mostrar. Por favor, selecciona al menos un elemento químico.
          <br />
          <small>Debug: Available elements: {data.elements.map((e) => e.name).join(", ")}</small>
          <br />
          <small>Selected elements: {selectedElements.join(", ")}</small>
          <div className="mt-2">
            <button onClick={onSelectAll} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              Seleccionar todos los elementos
            </button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2" id="date-range-picker">
                <Label>Rango de Fechas</Label>
                <DateRangePicker
                  value={{ from: dateRange[0], to: dateRange[1] }}
                  onChange={(range) => onDateRangeChange(range)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-grouping">Agrupación Temporal</Label>
                <Select value={timeGrouping} onValueChange={setTimeGrouping}>
                  <SelectTrigger id="time-grouping">
                    <SelectValue placeholder="Seleccionar agrupación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin agrupar</SelectItem>
                    <SelectItem value="chronological">Cronológico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" id="elements-selector">
                <div className="flex justify-between items-center">
                  <Label>Elementos Químicos</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSelectAll}
                      className="h-8 px-2 text-xs"
                      title="Seleccionar todos"
                    >
                      <CheckSquare className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">Todos</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onDeselectAll}
                      className="h-8 px-2 text-xs"
                      title="Deseleccionar todos"
                    >
                      <Square className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">Ninguno</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {data.elements.map((element) => (
                    <div key={element.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`element-${element.name}`}
                        checked={selectedElements.includes(element.name)}
                        onCheckedChange={() => onElementToggle(element.name)}
                      />
                      <Label htmlFor={`element-${element.name}`} className="text-sm cursor-pointer">
                        {element.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-3/4 order-1 lg:order-2">
          <div id="chart-types">
            <Tabs value={chartType} onValueChange={setChartType} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="line">Línea</TabsTrigger>
                <TabsTrigger value="bar">Barras</TabsTrigger>
                <TabsTrigger value="area">Área</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scatter">Dispersión</TabsTrigger>
                <TabsTrigger value="composed">Compuesto</TabsTrigger>
                <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
              </TabsList>

              <div id="chart-display">
                <TabsContent value="line" className="mt-4">
                  <LineChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>

                <TabsContent value="bar" className="mt-4">
                  <BarChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>

                <TabsContent value="area" className="mt-4">
                  <AreaChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>

                <TabsContent value="scatter" className="mt-4">
                  <ScatterChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>

                <TabsContent value="composed" className="mt-4">
                  <ComposedChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>

                <TabsContent value="heatmap" className="mt-4">
                  <HeatMapChart data={processedData} selectedElements={selectedElements} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
