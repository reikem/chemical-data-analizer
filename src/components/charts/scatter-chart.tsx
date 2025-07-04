/* -----------------------------------------------------------
   ScatterChart.tsx — selector múltiple + export PNG
   ----------------------------------------------------------- */
   import { useMemo, useRef, useState } from "react"
   import {
     ScatterChart as ReScatterChart,
     Scatter,
     XAxis,
     YAxis,
     ZAxis,
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
   interface ScatterChartProps { data: ChemicalData }
   /* ------------------------------------------------------------------ */
   export function ScatterChart({ data }: ScatterChartProps) {
     const [selected, setSelected] = useState<string[]>([])
     const chartRef = useRef<HTMLDivElement>(null)
   
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
       "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1",
       "#14b8a6", "#eab308", "#f97316", "#8b5cf6", "#0ea5e9",
     ]
   
     const handleExportPNG = async () => {
       if (!chartRef.current) return
       try {
         const url = await toPng(chartRef.current, { cacheBust: true })
         const a = document.createElement("a")
         a.download = "scatter-chart.png"
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
           <CardTitle className="text-base mb-3">Gráfico de dispersión</CardTitle>
   
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
                 Elige uno o más elementos para ver el gráfico.
               </AlertDescription>
             </Alert>
           ) : (
             <div ref={chartRef}>
               <ResponsiveContainer width="100%" height={400}>
                 <ReScatterChart>
                   <CartesianGrid />
                   <XAxis type="number" dataKey="x" name="Muestra"
                     tickFormatter={(v) => `#${v + 1}`} />
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
                 </ReScatterChart>
               </ResponsiveContainer>
             </div>
           )}
         </CardContent>
       </Card>
     )
   }
   