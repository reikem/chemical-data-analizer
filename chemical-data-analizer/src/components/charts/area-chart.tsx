import { useState, useEffect, useMemo } from "react"

import { Card, CardContent } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { MultiElementSelect } from "../multi-element-select"
import type { ChemicalData } from "../../providers/type/data-types"

interface AreaChartProps {
  data: ChemicalData

  selectedElements?: string[]
}


export function AreaChart({
  data,
  selectedElements = [],
}: AreaChartProps) {

  const [chosen, setChosen] = useState<string[]>(selectedElements)

  useEffect(() => {
    if (
      selectedElements.length &&
      selectedElements.join("|") !== chosen.join("|")
    ) {
      setChosen(selectedElements)
    }

  }, [selectedElements])


  const noSamples  = !data || data.samples.length === 0
  const noChosen   = chosen.length === 0

  const chartData = useMemo(() => {
    if (noSamples || noChosen) return []

    return data.samples.map((s) => {
      const pt: Record<string, any> = { name: s.date }
      chosen.forEach((el) => {
        const idx = data.elements.findIndex((e) => e.name === el)
        pt[el] =
          idx !== -1 && idx < s.values.length && typeof s.values[idx] === "number"
            ? s.values[idx]
            : 0
      })
      return pt
    })
  }, [data, chosen, noSamples, noChosen])

  /* ---------------------------------------------------------------------- */
  /*  4. Paleta de colores (rotativa)                                       */
  /* ---------------------------------------------------------------------- */
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe",
    "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
  ]

  /* ---------------------------------------------------------------------- */
  /*  5. Render UI                                                          */
  /* ---------------------------------------------------------------------- */
  return (
    <Card className="w-full h-full">
      {/* selector encima del gráfico ------------------------------------- */}
      <div className="p-4 border-b">
        <MultiElementSelect
          allElements={data.elements.map((e) => e.name)}
          value={chosen}
          onChange={setChosen}
          placeholder="Seleccionar elementos…"
          maxHeight={260}
        />
      </div>

      <CardContent className="p-4">
        {noSamples || noChosen ? (
          <Alert className="my-4">
            <AlertDescription>
              {noSamples
                ? "No hay datos disponibles para mostrar."
                : "Selecciona uno o más elementos para visualizar el gráfico."}
            </AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ReAreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(v) =>
                  typeof v === "string" ? v.split(" ")[0] : v
                }
              />
              <YAxis />
              <Tooltip
                formatter={(v, n) => [
                  typeof v === "number" ? v.toFixed(2) : v,
                  n,
                ]}
              />
              <Legend />
              {chosen.map((el, i) => (
                <Area
                  key={el}
                  type="monotone"
                  dataKey={el}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.3}
                  activeDot={{ r: 8 }}
                  name={el}
                />
              ))}
            </ReAreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}