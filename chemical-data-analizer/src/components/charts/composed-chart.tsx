/* -----------------------------------------------------------
   ComposedChart.tsx  —  con MultiElementSelect interno
   ----------------------------------------------------------- */
   import { useMemo, useState } from "react"
   import {
     ComposedChart as RechartsComposedChart,
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
   
   import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
   import { Alert, AlertDescription } from "../ui/alert"
   import { MultiElementSelect } from "../multi-element-select"
   import type { ChemicalData } from "../../providers/type/data-types"
   
   /* ------------------------------------------------------------------ */
   /*  PROPS                                                             */
   /* ------------------------------------------------------------------ */
   interface ComposedChartProps {
     data: ChemicalData
   }
   
   /* ------------------------------------------------------------------ */
   /*  COMPONENTE                                                        */
   /* ------------------------------------------------------------------ */
   export function ComposedChart({ data }: ComposedChartProps) {
     /* 1. Selección interna ------------------------------------------- */
     const [selected, setSelected] = useState<string[]>([])
   
     /* 2. Datos transformados ----------------------------------------- */
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
   
     /* 3. Colores y tipo de trazo ------------------------------------- */
     const colors = [
       "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe",
       "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57",
     ]
     const chartType = (i: number) =>
       (["bar", "line", "area"] as const)[i % 3]
   
     /* 4. Render ------------------------------------------------------- */
     return (
       <Card className="w-full h-full">
         {/* encabezado con selector */}
         <CardHeader>
           <CardTitle className="text-base mb-3">Gráfico compuesto</CardTitle>
   
           <MultiElementSelect
             allElements={data.elements.map((e) => e.name)}
             value={selected}
             onChange={setSelected}
             placeholder="Seleccionar elementos…"
             maxHeight={300}
           />
         </CardHeader>
   
         {/* contenido */}
         <CardContent className="p-4">
           {!selected.length ? (
             <Alert>
               <AlertDescription>
                 Elige uno o más elementos para mostrar el gráfico.
               </AlertDescription>
             </Alert>
           ) : (
             <ResponsiveContainer width="100%" height={400}>
               <RechartsComposedChart data={chartData}>
                 <CartesianGrid stroke="#f5f5f5" />
                 <XAxis
                   dataKey="name"
                   tickFormatter={(v) =>
                     typeof v === "string" ? v.split(" ")[0] : v
                   }
                 />
                 <YAxis />
                 <Tooltip
                   formatter={(v, n) =>
                     [typeof v === "number" ? v.toFixed(2) : v, n]
                   }
                 />
                 <Legend />
   
                 {selected.map((el, i) => {
                   const color = colors[i % colors.length]
                   switch (chartType(i)) {
                     case "bar":
                       return (
                         <Bar key={el} dataKey={el} fill={color} name={el} />
                       )
                     case "line":
                       return (
                         <Line
                           key={el}
                           type="monotone"
                           dataKey={el}
                           stroke={color}
                           activeDot={{ r: 7 }}
                           name={el}
                         />
                       )
                     case "area":
                     default:
                       return (
                         <Area
                           key={el}
                           type="monotone"
                           dataKey={el}
                           stroke={color}
                           fill={color}
                           fillOpacity={0.3}
                           name={el}
                         />
                       )
                   }
                 })}
               </RechartsComposedChart>
             </ResponsiveContainer>
           )}
         </CardContent>
       </Card>
     )
   }
   