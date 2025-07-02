  import { useMemo, useRef, useState } from "react"
   import {
     ComposedChart as ReComposedChart,
     Line,
     Bar,
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
   import { toPng } from "html-to-image"
   
   import { MultiElementSelect } from "../multi-element-select"
   import type { ChemicalData } from "../../providers/type/data-types"
   
   /* ------------------------------------------------------------------ */
   interface ComposedChartProps {
     data: ChemicalData
   }
   /* ------------------------------------------------------------------ */
   export function ComposedChart({ data }: ComposedChartProps) {
     const [selected, setSelected] = useState<string[]>([])
     const chartRef = useRef<HTMLDivElement>(null)
   
     /* datos para los elementos elegidos */
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
   
     /* colores y tipo de serie */
     const colors = [
       "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1",
       "#14b8a6", "#eab308", "#f97316", "#8b5cf6", "#0ea5e9",
     ]
     const chartType = (i: number) => (["bar", "line", "area"] as const)[i % 3]
   
     /* exportar */
     const handleExportPNG = async () => {
       if (!chartRef.current) return
       try {
         const url = await toPng(chartRef.current, { cacheBust: true })
         const link = document.createElement("a")
         link.download = "composed-chart.png"
         link.href = url
         link.click()
       } catch (err) {
         console.error(err)
         alert("No se pudo generar la imagen.")
       }
     }
   
     /* render */
     return (
       <Card className="w-full h-full">
         <CardHeader>
           <CardTitle className="text-base mb-3">Gráfico compuesto</CardTitle>
   
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
               <Download className="mr-1 h-4 w-4" />
               Exportar PNG
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
                 <ReComposedChart data={chartData}>
                   <CartesianGrid stroke="#f5f5f5" />
                   <XAxis
                     dataKey="date"
                     tickFormatter={(v) =>
                       typeof v === "string" ? v.split(" ")[0] : v
                     }
                   />
                   <YAxis />
                   <Tooltip formatter={(v, n) => [v, n]} />
                   <Legend />
   
                   {selected.map((el, i) => {
                     const clr = colors[i % colors.length]
                     switch (chartType(i)) {
                       case "bar":
                         return <Bar  key={el} dataKey={el} fill={clr} name={el} />
                       case "line":
                         return (
                           <Line key={el} type="monotone" dataKey={el}
                                 stroke={clr} activeDot={{ r: 7 }} name={el} />
                         )
                       default:
                         return (
                           <Area key={el} type="monotone" dataKey={el}
                                 stroke={clr} fill={clr} fillOpacity={0.3} name={el} />
                         )
                     }
                   })}
                 </ReComposedChart>
               </ResponsiveContainer>
             </div>
           )}
         </CardContent>
       </Card>
     )
   }
   