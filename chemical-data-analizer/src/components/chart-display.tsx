import { useMemo, useState } from "react"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"

/* ► importaciones individuales de tus gráficos ◄ */
import { LineChart     } from "./charts/line-chart"
import { BarChart      } from "./charts/bar-chart"
import { AreaChart     } from "./charts/area-chart"
import { ScatterChart  } from "./charts/scatter-chart"
import { ComposedChart } from "./charts/composed-chart"
import { HeatMapChart  } from "./charts/heatmap-chart"

import type { ChemicalData } from "../providers/type/data-types"

/* -------------------------------------------------------------------------- */
/*  PROPS                                                                     */
/* -------------------------------------------------------------------------- */
interface ChartDisplayProps {
  data: ChemicalData
  selectedElements: string[]
  dateRange: [Date | undefined, Date | undefined]          // llega desde fuera
  onElementToggle:  (el: string) => void                   // ya no se usan aquí
  onSelectAll:      () => void
  onDeselectAll:    () => void
  onDateRangeChange:(range: {from?: Date; to?: Date}) => void
}

/* -------------------------------------------------------------------------- */
/*  COMPONENTE                                                                */
/* -------------------------------------------------------------------------- */
export function ChartDisplay({
  data,
  selectedElements,
  dateRange,
}: ChartDisplayProps) {
  /* 1. estados ----------------------------------------------------------- */
  const [chartType, setChartType] = useState("line")
  const [grouping,  setGrouping ] = useState("none")

  /* 2. filtrado por rango (invisible para el usuario) -------------------- */
  const filtered = useMemo(() => {
    if (!dateRange[0] && !dateRange[1]) return data
    const [from, to] = dateRange
    const inside = (d: Date) =>
      (!from || d >= from) && (!to || d <= to)

    return {
      ...data,
      samples: data.samples.filter((s) =>
        inside(new Date(s.date.split("/").reverse().join("-"))),
      ),
    }
  }, [data, dateRange])

  /* 3. agrupación opcional ----------------------------------------------- */
  const processedData = useMemo(() => {
    if (grouping !== "chronological") return filtered
    return {
      ...filtered,
      samples: [...filtered.samples].sort((a, b) =>
        new Date(a.date.split("/").reverse().join("-")).getTime() -
        new Date(b.date.split("/").reverse().join("-")).getTime(),
      ),
    }
  }, [filtered, grouping])

  const hasData     = processedData.samples.length > 0
  const hasSelected = selectedElements.length        > 0

  /* 4. mensajes de ausencia ---------------------------------------------- */
  if (!hasData)
    return (
      <Alert className="my-4">
        <AlertDescription>No hay datos disponibles para mostrar.</AlertDescription>
      </Alert>
    )

  if (!hasSelected)
    return (
      <Alert className="my-4">
        <AlertDescription>
          No hay elementos seleccionados. Selecciónalos en el panel principal de la aplicación.
        </AlertDescription>
      </Alert>
    )

  /* 5. UI ---------------------------------------------------------------- */
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Visualización de Gráficos</CardTitle>

          {/* única opción: agrupación temporal */}
          <div className="w-full sm:w-[14rem]">
            <Label className="mb-1 block text-xs font-medium">Agrupación temporal</Label>
            <Select value={grouping} onValueChange={setGrouping}>
              <SelectTrigger>
                <SelectValue placeholder="Agrupación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin agrupar</SelectItem>
                <SelectItem value="chronological">Cronológico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={chartType} onValueChange={setChartType} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
            <TabsTrigger value="line">Línea</TabsTrigger>
            <TabsTrigger value="bar">Barras</TabsTrigger>
            <TabsTrigger value="area">Área</TabsTrigger>
            <TabsTrigger value="scatter">Dispersión</TabsTrigger>
            <TabsTrigger value="composed">Compuesto</TabsTrigger>
            <TabsTrigger value="heatmap">Calor</TabsTrigger>
          </TabsList>

          <TabsContent value="line"     className="mt-4">
            <LineChart     data={processedData} />
          </TabsContent>
          <TabsContent value="bar"      className="mt-4">
            <BarChart      data={processedData}  />
          </TabsContent>
          <TabsContent value="area"     className="mt-4">
            <AreaChart     data={processedData}  />
          </TabsContent>
          <TabsContent value="scatter"  className="mt-4">
            <ScatterChart  data={processedData}  />
          </TabsContent>
          <TabsContent value="composed" className="mt-4">
            <ComposedChart data={processedData}  />
          </TabsContent>
          <TabsContent value="heatmap"  className="mt-4">
            <HeatMapChart  data={processedData} selectedElements={selectedElements} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}