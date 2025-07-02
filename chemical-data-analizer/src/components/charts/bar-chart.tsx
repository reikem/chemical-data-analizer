/* -----------------------------------------------------------
   BarChart.tsx  —  con selector interno de elementos
   ----------------------------------------------------------- */
   import { useMemo, useState } from "react"
   import {
     BarChart as RechartsBarChart,
     Bar,
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
     /* 1. elementos seleccionados (arranca vacío) -------------------- */
     const [selected, setSelected] = useState<string[]>([])
   
     /* 2. datos transformados solo para los elementos elegidos -------- */
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
   
     /* 3. colores “cíclicos” ----------------------------------------- */
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
   
     /* 4. RENDER ------------------------------------------------------ */
     return (
       <Card className="w-full h-full">
         {/* encabezado con el selector */}
         <CardHeader>
           <CardTitle className="text-base mb-3">Gráfico de barras</CardTitle>
   
           <MultiElementSelect
             allElements={data.elements.map((e) => e.name)}
             value={selected}
             onChange={setSelected}
             placeholder="Elegir elementos…"
             maxHeight={300}
           />
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
             <ResponsiveContainer width="100%" height={400}>
               <RechartsBarChart data={chartData}>
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
                   <Bar
                     key={el}
                     dataKey={el}
                     fill={colors[i % colors.length]}
                     name={el}
                   />
                 ))}
               </RechartsBarChart>
             </ResponsiveContainer>
           )}
         </CardContent>
       </Card>
     )
   }
   