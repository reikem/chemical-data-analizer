import { useMemo, useState } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { MultiElementSelect } from "../multi-element-select"
import type { ChemicalData } from "../../providers/type/data-types"

interface LineChartProps {
  data: ChemicalData
}

export function LineChart({ data }: LineChartProps) {
  /* selección local de elementos (vacía al iniciar) */
  const [selected, setSelected] = useState<string[]>([])

  /* datos transformados sólo con los elementos elegidos */
  const chartData = useMemo(() => {
    if (!selected.length) return []
    return data.samples.map((s) => {
      const row: Record<string, any> = { name: s.date }
      selected.forEach((el) => {
        const idx = data.elements.findIndex((e) => e.name === el)
        row[el] = idx !== -1 ? s.values[idx] ?? 0 : 0
      })
      return row
    })
  }, [data, selected])

  /* paleta de colores */
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe",
    "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
  ]

  return (
    <Card className="w-full h-full">
      {/* selector en el encabezado */}
      <CardHeader>
        <CardTitle className="text-base mb-3">Gráfico de líneas</CardTitle>

        <MultiElementSelect
          allElements={data.elements.map((e) => e.name)}
          value={selected}
          onChange={setSelected}
          placeholder="Seleccionar elementos…"
          maxHeight={300}
        />
      </CardHeader>

      <CardContent className="p-4">
        {!selected.length ? (
          <Alert>
            <AlertDescription>
              Elige uno o más elementos para mostrar el gráfico.
            </AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(v) =>
                  typeof v === "string" ? v.split(" ")[0] : v
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />

              {selected.map((el, i) => (
                <Line
                  key={el}
                  type="monotone"
                  dataKey={el}
                  stroke={colors[i % colors.length]}
                  activeDot={{ r: 8 }}
                  name={el}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
