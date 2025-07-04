/* ──────────────────────────────────────────────────────────────────────────────
   HeatMapChart.tsx — tabla de calor con:

   • Multi-select de elementos externo (viene en selectedElements)
   • Posibilidad de ocultar/mostrar las columnas “administrativas”
     (Modelo / Unidad / Componente).
   • Exportar la tabla completa como PNG, sin recortes.
   ─────────────────────────────────────────────────────────────────────────── */

   import { useMemo, useRef, useState } from "react"
   import {
     Card, CardContent, CardHeader, CardTitle,
   } from "../ui/card"
   import {
     Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
   } from "../ui/table"
   import {
     Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
   } from "../ui/select"
   import { Button } from "../ui/button"
   import { Label } from "../ui/label"
   import { Alert, AlertDescription } from "../ui/alert"
   import { Download } from "lucide-react"
   import { toPng } from "html-to-image"
   
   import {
     getValueStatus,
     type ChemicalData,
   } from "../../providers/type/data-types"
   
   /* -------------------------------------------------------------------------- */
   /*  PROPS                                                                     */
   /* -------------------------------------------------------------------------- */
   interface HeatMapChartProps {
     data: ChemicalData
     selectedElements: string[]
   }
   
   /* -------------------------------------------------------------------------- */
   /*  COMPONENTE                                                                */
   /* -------------------------------------------------------------------------- */
   export function HeatMapChart({ data, selectedElements }: HeatMapChartProps) {
     /* 1. STATES ----------------------------------------------------------- */
     const [samplesLimit, setSamplesLimit] = useState("10")
     const [showAdmins,   setShowAdmins]   = useState(true)     // columnas extra
   
     const tableRef = useRef<HTMLDivElement>(null)
   
     /* 2. ELEMENTOS + SAMPLES FILTRADOS ------------------------------------ */
     const elements = useMemo(
       () => data.elements.filter((el) => selectedElements.includes(el.name)),
       [data.elements, selectedElements],
     )
   
     const samples  = useMemo(() => {
       const limit = Number.parseInt(samplesLimit)
       return data.samples.slice(0, limit)
     }, [data.samples, samplesLimit])
   
     /* 3. EXPORTAR TABLA COMPLETA ----------------------------------------- */
     const exportPNG = async () => {
       if (!tableRef.current) return
       const node   = tableRef.current
       const width  = node.scrollWidth
       const height = node.scrollHeight
   
       try {
         const dataUrl = await toPng(node, {
           cacheBust: true,
           width,
           height,
           style: { transform: "none", zoom: "1" },
         })
         const link = document.createElement("a")
         link.download = "heatmap-table.png"
         link.href     = dataUrl
         link.click()
       } catch (err) {
         console.error("Export PNG error:", err)
         alert("No se pudo exportar la imagen; inténtalo de nuevo.")
       }
     }
   
     /* 4. HELPERS DE COLOR ------------------------------------------------- */
     const bgColor = (v: number, n: string) =>
       ({
         optimal : "bg-green-100",
         warning : "bg-yellow-100",
         danger  : "bg-red-100",
       }[getValueStatus(v, n)] ?? "")
   
     const textColor = (v: number, n: string) =>
       ({
         optimal : "text-green-800",
         warning : "text-yellow-800",
         danger  : "text-red-800",
       }[getValueStatus(v, n)] ?? "")
   
     /* 5. EARLY EXIT (sin datos) ------------------------------------------ */
     if (!samples.length || !elements.length)
       return (
         <Alert className="my-4">
           <AlertDescription>
             No hay datos para mostrar. Verifica filtros y selección de elementos.
           </AlertDescription>
         </Alert>
       )
   
     /* 6. RENDER ----------------------------------------------------------- */
     return (
       <Card className="w-full h-full flex flex-col">
         {/* ── HEADER ─────────────────────────────────────────────────────── */}
         <CardHeader className="space-y-4">
           <CardTitle className="text-base">Tabla de calor</CardTitle>
   
           {/* Controles */}
           <div className="flex flex-wrap gap-4">
             {/* Nº de muestras */}
             <div>
               <Label htmlFor="samples-limit" className="text-xs mb-1 block">
                 Nº de muestras
               </Label>
               <Select value={samplesLimit} onValueChange={setSamplesLimit}>
                 <SelectTrigger id="samples-limit" className="h-8 text-xs w-32">
                   <SelectValue placeholder="Muestras" />
                 </SelectTrigger>
                 <SelectContent>
                   {["5","10","20","50","100"].map((n)=>(
                     <SelectItem value={n} key={n}>{n}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
   
             {/* Mostrar / ocultar col. administrativas */}
             <div className="flex items-end">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setShowAdmins((s) => !s)}
               >
                 {showAdmins ? "Ocultar columnas Info" : "Mostrar columnas Info"}
               </Button>
             </div>
   
             {/* Exportar PNG */}
             <div className="flex items-end">
               <Button
                 variant="secondary"
                 size="sm"
                 onClick={exportPNG}
                 title="Exportar tabla completa como PNG"
               >
                 <Download className="h-4 w-4 mr-1" />
                 Exportar PNG
               </Button>
             </div>
           </div>
         </CardHeader>
   
         {/* ── CONTENIDO (tabla) ───────────────────────────────────────────── */}
         <CardContent className="flex-1 overflow-auto">
           <div ref={tableRef} className="inline-block">
             <Table className="text-xs">
               {/* head */}
               <TableHeader>
                 <TableRow className="sticky top-0 bg-white z-10">
                   <TableHead className="whitespace-nowrap">Fecha</TableHead>
                   {showAdmins && (
                     <>
                       {data.samples[0]?.model      && <TableHead>Modelo</TableHead>}
                       {data.samples[0]?.unit       && <TableHead>Unidad</TableHead>}
                       {data.samples[0]?.component  && <TableHead>Componente</TableHead>}
                     </>
                   )}
                   {elements.map((el) => (
                     <TableHead key={el.name}>{el.name}</TableHead>
                   ))}
                 </TableRow>
               </TableHeader>
   
               {/* body */}
               <TableBody>
                 {samples.map((s, i) => (
                   <TableRow key={i}>
                     <TableCell className="font-medium">{s.date}</TableCell>
   
                     {showAdmins && (
                       <>
                         {s.model      && <TableCell>{s.model}</TableCell>}
                         {s.unit       && <TableCell>{s.unit}</TableCell>}
                         {s.component  && <TableCell>{s.component}</TableCell>}
                       </>
                     )}
   
                     {elements.map((el) => {
                       const idx   = data.elements.findIndex((e) => e.name === el.name)
                       const value = idx !== -1 ? s.values[idx] ?? 0 : 0
                       return (
                         <TableCell
                           key={el.name}
                           className={`${bgColor(value, el.name)} ${textColor(value, el.name)}`}
                         >
                           {value.toFixed(2)}
                         </TableCell>
                       )
                     })}
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         </CardContent>
       </Card>
     )
   }
   