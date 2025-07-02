import { useMemo, useState } from "react"
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

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { MultiElementSelect } from "../multi-element-select"
import type { ChemicalData } from "../../providers/type/data-types"

interface ScatterChartProps {
  data: ChemicalData
}

export function ScatterChart({ data }: ScatterChartProps) {
  /* selección local (vacía al iniciar) */
  const [selected, setSelected] = useState<string[]>([])

  /* dataset adaptado a los elementos elegidos */
  const scatterSets = useMemo(() => {
    return selected.map((el) => {
      const idx = data.elements.findIndex((e) => e.name === el)
      const serie =
        idx === -1
          ? []
          : data.samples.map((s, i) => ({
              x: i,
              y: s.values[idx] ?? 0,
              z: 200,
              name: s.date,
            }))
      return { name: el, data: serie }
    })
  }, [data, selected])

  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe",
    "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
  ]

  return (
    <Card className="w-full h-full">
      {/* selector de elementos */}
      <CardHeader>
        <CardTitle className="text-base mb-3">Gráfico de dispersión</CardTitle>

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
              Elige uno o más elementos para ver el gráfico.
            </AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsScatterChart>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name="Muestra"
                tickFormatter={(v) => `#${v + 1}`}
              />
              <YAxis type="number" dataKey="y" name="Valor" />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(val, name, props) => {
                  if (name === "y") return [val, "Valor"]
                  if (name === "x") return [props.payload.name, "Fecha"]
                  return [val, name]
                }}
              />
              <Legend />

              {scatterSets.map((set, i) => (
                <Scatter
                  key={set.name}
                  name={set.name}
                  data={set.data}
                  fill={colors[i % colors.length]}
                />
              ))}
            </RechartsScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
