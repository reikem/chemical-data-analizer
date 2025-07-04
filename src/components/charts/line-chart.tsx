/* -----------------------------------------------------------
   LineChart.tsx — selector múltiple + export PNG
   ----------------------------------------------------------- */
   import { useMemo, useRef, useState } from "react"
   import {
     LineChart as ReLineChart,
     Line,
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
   interface LineChartProps { data: ChemicalData }
   /* ------------------------------------------------------------------ */
   export function LineChart({ data }: LineChartProps) {
     const [selected, setSelected] = useState<string[]>([])
     const chartRef = useRef<HTMLDivElement>(null)
   
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
   
     const colors = [
       "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1",
       "#14b8a6", "#eab308", "#f97316", "#8b5cf6", "#0ea5e9",
     ]
   
     const handleExportPNG = async () => {
       if (!chartRef.current) return
       try {
         const url = await toPng(chartRef.current, { cacheBust: true })
         const a = document.createElement("a")
         a.download = "line-chart.png"
         a.href = url
         a.click()
       } catch (e) {
         console.error(e)
         alert("No se pudo exportar la imagen.")
       }
     }
   
     return (
       <Card className="w-full h-full">
         <CardHeader>
           <CardTitle className="text-base mb-3">Gráfico de líneas</CardTitle>
   
           <MultiElementSelect
             allElements={data.elements.map((e) => e.name)}
             value={selected}
             onChange={setSelected}
             placeholder="Seleccionar elementos…"
             maxHeight={300}
           />
   
           <div className="mt-3">
             <Button
               variant="outline"
               size="sm"
               onClick={handleExportPNG}
               disabled={!selected.length}
             >
               <Download className="mr-1 h-4 w-4" /> Exportar PNG
             </Button>
           </div>
         </CardHeader>
   
         <CardContent className="p-4">
           {!selected.length ? (
             <Alert>
               <AlertDescription>
                 Elige uno o más elementos para mostrar el gráfico.
               </AlertDescription>
             </Alert>
           ) : (
             <div ref={chartRef}>
               <ResponsiveContainer width="100%" height={400}>
                 <ReLineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date"
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
                 </ReLineChart>
               </ResponsiveContainer>
             </div>
           )}
         </CardContent>
       </Card>
     )
   }
   