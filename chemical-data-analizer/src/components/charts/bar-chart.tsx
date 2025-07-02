import { useMemo, useRef, useState } from "react"
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"

import { MultiElementSelect } from "../multi-element-select"
import type { ChemicalData } from "../../providers/type/data-types"

/* ------------------------------------------------------------------ */
/*  PROPS                                                             */
/* ------------------------------------------------------------------ */
interface BarChartProps {
  data: ChemicalData
}

/* ------------------------------------------------------------------ */
/*  COMPONENTE                                                        */
/* ------------------------------------------------------------------ */
export function BarChart({ data }: BarChartProps) {
  /* 1. selección de elementos (empieza vacía) ----------------------- */
  const [selected, setSelected] = useState<string[]>([])

  /* 2. ref del contenedor para exportar ----------------------------- */
  const chartRef = useRef<HTMLDivElement>(null)

  /* 3. datos preparados para Recharts ------------------------------- */
  const chartData = useMemo(() => {
    if (!selected.length) return []
    return data.samples.map((s) => {
      const row: Record<string, any> = { date: s.date }
      selected.forEach((el) => {
        const idx = data.elements.findIndex((e) => e.name === el)
        row[el] = idx !== -1 ? s.values[idx] ?? 0 : 0
      })
      return row
    })
  }, [data, selected])

  /* 4. paleta de colores “cíclica” ---------------------------------- */
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
    "#14b8a6",
    "#eab308",
    "#f97316",
    "#8b5cf6",
    "#0ea5e9",
  ]

  /* 5. exportar la imagen ------------------------------------------ */
  const handleExportPNG = async () => {
    if (!chartRef.current) return
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true })
      const link = document.createElement("a")
      link.download = "bar-chart.png"
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Error al exportar gráfico:", err)
      alert("No se pudo generar la imagen. Vuelve a intentarlo.")
    }
  }

  /* 6. render ------------------------------------------------------- */
  return (
    <Card className="w-full h-full">
      {/* encabezado con selector + botón */}
      <CardHeader>
        <CardTitle className="text-base mb-3">Gráfico de barras</CardTitle>

        <MultiElementSelect
          allElements={data.elements.map((e) => e.name)}
          value={selected}
          onChange={setSelected}
          placeholder="Elegir elementos…"
          maxHeight={300}
        />

        {/* botón exportar */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPNG}
            disabled={!selected.length}
            title="Exportar gráfico como PNG"
          >
            <Download className="mr-1 h-4 w-4" />
            Exportar&nbsp;PNG
          </Button>
        </div>
      </CardHeader>

      {/* contenido */}
      <CardContent className="p-4">
        {!selected.length ? (
          <Alert>
            <AlertDescription>
              Selecciona uno o varios elementos para visualizar la gráfica.
            </AlertDescription>
          </Alert>
        ) : (
          /* --- el wrapper con ref es lo que se captura --- */
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <ReBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) =>
                    typeof v === "string" ? v.split(" ")[0] : v
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {selected.map((el, i) => (
                  <Bar
                    key={el}
                    dataKey={el}
                    fill={colors[i % colors.length]}
                    name={el}
                  />
                ))}
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}