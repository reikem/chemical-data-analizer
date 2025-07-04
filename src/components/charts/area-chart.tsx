 import { useState, useMemo, useRef } from "react"
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
   import { Card, CardHeader, CardContent, CardTitle } from "../ui/card"
   import { Alert, AlertDescription } from "../ui/alert"
   import { Button } from "../ui/button"
   import { Download } from "lucide-react"
   import { MultiElementSelect } from "../multi-element-select"
   import { toPng } from "html-to-image"
   import type { ChemicalData } from "../../providers/type/data-types"
   
   /* ------------------------------------------------------------------ */
   interface AreaChartProps {
     data: ChemicalData
   }
   /* ------------------------------------------------------------------ */
   export function AreaChart({ data }: AreaChartProps) {
     /* 1. selección local ------------------------------------------------- */
     const [selected, setSelected] = useState<string[]>([])
   
     /* 2. ref al contenedor para exportar -------------------------------- */
     const chartRef = useRef<HTMLDivElement>(null)
   
     /* 3. datos transformados ------------------------------------------- */
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
   
     /* 4. colores -------------------------------------------------------- */
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
   
     /* 5. exportar como PNG --------------------------------------------- */
     const handleExportPNG = async () => {
       if (!chartRef.current) return
       try {
         const dataUrl = await toPng(chartRef.current, { cacheBust: true })
         const link = document.createElement("a")
         link.download = "area-chart.png"
         link.href = dataUrl
         link.click()
       } catch (err) {
         console.error("Error al exportar gráfico:", err)
         alert("No se pudo generar la imagen. Prueba nuevamente.")
       }
     }
   
     /* 6. render --------------------------------------------------------- */
     return (
       <Card className="w-full h-full">
         {/* header: selector + botón exportar */}
         <CardHeader>
           <CardTitle className="text-base mb-3">Gráfico de áreas</CardTitle>
   
           <MultiElementSelect
             allElements={data.elements.map((e) => e.name)}
             value={selected}
             onChange={setSelected}
             placeholder="Elegir elementos…"
             maxHeight={300}
           />
   
           {/* botón “Exportar PNG” debajo del selector */}
           <div className="mt-3">
             <Button
               variant="outline"
               size="sm"
               onClick={handleExportPNG}
               disabled={!selected.length}
               title="Exportar gráfico como imagen PNG"
             >
               <Download className="mr-1 h-4 w-4" />
               Exportar PNG
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
             <div ref={chartRef}>
               <ResponsiveContainer width="100%" height={400}>
                 <ReAreaChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis
                     dataKey="date"
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
                   {selected.map((el, i) => (
                     <Area
                       key={el}
                       type="monotone"
                       dataKey={el}
                       stroke={colors[i % colors.length]}
                       fill={colors[i % colors.length]}
                       fillOpacity={0.3}
                       activeDot={{ r: 6 }}
                       name={el}
                     />
                   ))}
                 </ReAreaChart>
               </ResponsiveContainer>
             </div>
           )}
         </CardContent>
       </Card>
     )
   }
   