
import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { ChemicalData } from "../../providers/type/data-types"

interface ScatterChartProps {
  data: ChemicalData
  selectedElements: string[]
}

export function ScatterChart({ data, selectedElements }: ScatterChartProps) {
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

  // For scatter chart, we need to transform data differently
  // We'll create a dataset for each element
  const scatterData = selectedElements
    .map((elementName) => {
      const elementIndex = data.elements.findIndex((e) => e.name === elementName)
      if (elementIndex === -1) return { name: elementName, data: [] }

      return {
        name: elementName,
        data: data.samples.map((sample, idx) => {
          // Asegurarse de que el valor sea un número válido
          const value = elementIndex < sample.values.length ? sample.values[elementIndex] : 0
          const validValue = typeof value === "number" && !isNaN(value) ? value : 0

          return {
            x: idx, // Using index as x-axis
            y: validValue,
            z: 200, // Size of the dot
            name: sample.date, // For tooltip
          }
        }),
      }
    })
    .filter((dataset) => dataset.data.length > 0) // Filtrar datasets vacíos

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
          <RechartsScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="Muestra" tickFormatter={(value) => `#${value + 1}`} />
            <YAxis type="number" dataKey="y" name="Valor" />
            <ZAxis type="number" dataKey="z" range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name, props) => {
                if (name === "y") return [value, "Valor"]
                if (name === "x") return [props.payload.name, "Fecha"]
                return [value, name]
              }}
            />
            <Legend />
            {scatterData.map((element, index) => (
              <Scatter
                key={element.name}
                name={element.name}
                data={element.data}
                fill={colors[index % colors.length]}
              />
            ))}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
