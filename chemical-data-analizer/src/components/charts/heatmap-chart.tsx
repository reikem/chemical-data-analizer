import { useMemo, useState } from "react"

import { Card, CardContent } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

import { Alert, AlertDescription } from "../ui/alert"
import { getValueStatus, type ChemicalData } from "../../providers/type/data-types"

interface HeatMapChartProps {
  data: ChemicalData
  selectedElements: string[]
}

export function HeatMapChart({ data, selectedElements }: HeatMapChartProps) {
  const [displayMode, setDisplayMode] = useState<string>("table")
  const [samplesLimit, setSamplesLimit] = useState<string>("10")

  // Filtrar elementos seleccionados
  const filteredElements = useMemo(() => {
    return data.elements.filter((element) => selectedElements.includes(element.name))
  }, [data.elements, selectedElements])

  // Limitar el número de muestras para la visualización
  const limitedSamples = useMemo(() => {
    const limit = Number.parseInt(samplesLimit)
    return data.samples.slice(0, limit)
  }, [data.samples, samplesLimit])

  // Verificar si hay datos para mostrar
  if (data.samples.length === 0 || selectedElements.length === 0) {
    return (
      <Alert className="my-4">
        <AlertDescription>
          No hay datos disponibles para mostrar. Por favor, verifica el archivo cargado o selecciona elementos.
        </AlertDescription>
      </Alert>
    )
  }

  // Función para obtener el color de fondo según el valor
  const getBackgroundColor = (value: number, elementName: string) => {
    const status = getValueStatus(value, elementName)

    switch (status) {
      case "optimal":
        return "bg-green-100"
      case "warning":
        return "bg-yellow-100"
      case "danger":
        return "bg-red-100"
      default:
        return ""
    }
  }

  // Función para obtener el color de texto según el valor
  const getTextColor = (value: number, elementName: string) => {
    const status = getValueStatus(value, elementName)

    switch (status) {
      case "optimal":
        return "text-green-800"
      case "warning":
        return "text-yellow-800"
      case "danger":
        return "text-red-800"
      default:
        return ""
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 mb-4">
        <div className="w-1/2">
          <Label htmlFor="display-mode" className="text-xs mb-1 block">
            Modo de Visualización
          </Label>
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger id="display-mode" className="h-8 text-xs">
              <SelectValue placeholder="Modo de visualización" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Tabla de Calor</SelectItem>
              <SelectItem value="scatter">Gráfico de Dispersión</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <Label htmlFor="samples-limit" className="text-xs mb-1 block">
            Número de Muestras
          </Label>
          <Select value={samplesLimit} onValueChange={setSamplesLimit}>
            <SelectTrigger id="samples-limit" className="h-8 text-xs">
              <SelectValue placeholder="Número de muestras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 muestras</SelectItem>
              <SelectItem value="10">10 muestras</SelectItem>
              <SelectItem value="20">20 muestras</SelectItem>
              <SelectItem value="50">50 muestras</SelectItem>
              <SelectItem value="100">100 muestras</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1">
        <Card className="w-full h-full">
          <CardContent className="p-4">
            {displayMode === "table" ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      {data.samples[0]?.model && <TableHead>Modelo</TableHead>}
                      {data.samples[0]?.unit && <TableHead>Unidad</TableHead>}
                      {data.samples[0]?.component && <TableHead>Componente</TableHead>}
                      {filteredElements.map((element) => (
                        <TableHead key={element.name}>{element.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {limitedSamples.map((sample, sampleIndex) => (
                      <TableRow key={sampleIndex}>
                        <TableCell className="font-medium">{sample.date}</TableCell>
                        {sample.model && <TableCell>{sample.model}</TableCell>}
                        {sample.unit && <TableCell>{sample.unit}</TableCell>}
                        {sample.component && <TableCell>{sample.component}</TableCell>}
                        {filteredElements.map((element, elementIndex) => {
                          const elementIndex2 = data.elements.findIndex((e) => e.name === element.name)
                          if (elementIndex2 === -1 || elementIndex2 >= sample.values.length) {
                            return <TableCell key={elementIndex}>N/A</TableCell>
                          }

                          const value = sample.values[elementIndex2]
                          return (
                            <TableCell
                              key={elementIndex}
                              className={`${getBackgroundColor(value, element.name)} ${getTextColor(value, element.name)}`}
                            >
                              {value.toFixed(2)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  El gráfico de dispersión está disponible en la pestaña "Dispersión"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 mr-2"></div>
            <span className="text-xs">Óptimo</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
            <span className="text-xs">Advertencia</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 mr-2"></div>
            <span className="text-xs">Peligro</span>
          </div>
        </div>
      </div>
    </div>
  )
}
