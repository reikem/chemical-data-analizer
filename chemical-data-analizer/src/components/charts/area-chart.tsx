
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { ChemicalData } from "../../providers/type/data-types"

interface AreaChartProps {
  data: ChemicalData
  selectedElements: string[]
}

export function AreaChart({ data, selectedElements }: AreaChartProps) {
  // Verificar si hay datos para mostrar
  if (!data || data.samples.length === 0 || selectedElements.length === 0) {
    return (
      <Alert className="my-4">
        <AlertDescription>
          No hay datos disponibles para mostrar. Por favor, verifica el archivo cargado o selecciona elementos.
        </AlertDescription>
      </Alert>
    )
  }

  // Transform data for Chart - asegurarse de que los datos estén en el formato correcto
  const chartData = data.samples.map((sample) => {
    const point: Record<string, any> = {
      name: sample.date,
    }

    // Add selected element values
    selectedElements.forEach((elementName) => {
      const elementIndex = data.elements.findIndex((e) => e.name === elementName)
      if (elementIndex !== -1 && elementIndex < sample.values.length) {
        // Asegurarse de que el valor sea un número válido
        const value = sample.values[elementIndex]
        point[elementName] = typeof value === "number" && !isNaN(value) ? value : 0
      }
    })

    return point
  })

  // Generate colors for each element
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ]

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={400}>
          <RechartsAreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickFormatter={(value) => {
                return typeof value === "string" ? value.split(" ")[0] : value
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                return [typeof value === "number" ? value.toFixed(2) : value, name]
              }}
            />
            <Legend />
            {selectedElements.map((element, index) => {
              // Verificar si el elemento existe en los datos
              const elementIndex = data.elements.findIndex((e) => e.name === element)
              if (elementIndex === -1) return null

              return (
                <Area
                  key={element}
                  type="monotone"
                  dataKey={element}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                  activeDot={{ r: 8 }}
                  name={element}
                />
              )
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
