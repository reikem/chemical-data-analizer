

import * as React from "react"
import {
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

import { Button } from "./ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card"
import { cn } from "../lib/utils"


export type TourStep = {
  id:        string          // id del elemento a resaltar
  title:     string
  desc:      string
  pos:       "top" | "bottom" | "left" | "right" | "center"
}

export const TOUR_STEPS: TourStep[] = [
  { id: "file-upload-section", title: "Carga de archivos",   desc: "Arrastra aquí tu CSV/XLSX.",        pos: "bottom" },
  { id: "column-selector",     title: "Selector de columnas",desc: "Elige la(s) columna(s) de fecha.",  pos: "right"  },
  { id: "results-section",     title: "Resultados",          desc: "Vista general del análisis.",       pos: "top"    },
  { id: "export-buttons",      title: "Exportar",            desc: "Genera PDF, Excel o imprime.",      pos: "bottom" },
  { id: "summary-cards",       title: "Resumen",             desc: "Muestras, elementos y fechas.",     pos: "bottom" },
  { id: "tabs-section",        title: "Pestañas",            desc: "Gráficos, tabla y estadísticas.",   pos: "top"    },
  { id: "tour-end",            title: "¡Listo!",             desc: "Ya conoces la interfaz 😊",          pos: "center" },
]


export const CustomTourGuide: React.FC = () => {
  const [open,    setOpen]   = React.useState(false)
  const [index,   setIndex]  = React.useState(0)
  const [steps,   setSteps]  = React.useState<number[]>([])


  const start = (): void => {
    const available = TOUR_STEPS
      .map((s, i) =>
        s.id === "tour-end" || document.getElementById(s.id) ? i : -1,
      )
      .filter(i => i !== -1)

    if (!available.length) {
      console.warn("[tour] No hay elementos con los id esperados.")
      return
    }
    setSteps(available)
    setIndex(0)
    setOpen(true)
  }

  const end   = (): void => setOpen(false)
  const next  = (): void => setIndex(i => (i < steps.length - 1 ? i + 1 : (end(), i)))
  const prev  = (): void => setIndex(i => (i > 0 ? i - 1 : i))


  React.useEffect(() => {
    if (!open || !steps.length) return

    const step = TOUR_STEPS[steps[index]]
    if (step.id === "tour-end") return

    const el = document.getElementById(step.id)
    if (!el) return

    el.classList.add("tour-highlight")
    el.scrollIntoView({ behavior: "smooth", block: "center" })

    return () => el.classList.remove("tour-highlight")
  }, [open, index, steps])


  if (!open) {
    return (
      <Button
        onClick={start}
        variant="outline"
        size="icon"
        title="Iniciar recorrido"
        className="fixed bottom-4 right-4 z-[60] h-10 w-10 rounded-full"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    )
  }


  const step = TOUR_STEPS[steps[index]]
  const isLast  = index === steps.length - 1
  const isFirst = index === 0

  const posStyle = getTooltipPosition(step)

  return (
    <>
      {/* overlay */}
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={end} />

      {/* tarjeta */}
      <Card style={posStyle} className={cn("z-[60] w-[300px] shadow-lg", step.id === "tour-end" && "w-[380px]")}>
        <CardHeader className="pb-2 flex justify-between items-center">
          <CardTitle className="text-base">{step.title}</CardTitle>
          <Button size="icon" variant="ghost" onClick={end}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent><p className="text-sm">{step.desc}</p></CardContent>

        <CardFooter className="pt-2 justify-between">
          <span className="text-xs text-muted-foreground">{index + 1}/{steps.length}</span>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={prev}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {isLast ? "Finalizar" : "Siguiente"}
              {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* estilo highlight */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 56;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  )
}


function getTooltipPosition(step: TourStep): React.CSSProperties {
  if (step.id === "tour-end")
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }

  const el = document.getElementById(step.id)
  if (!el) return { position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)" }

  const { top, bottom, left, right, width, height } = el.getBoundingClientRect()

  switch (step.pos) {
    case "top":
      return { position: "absolute", top: top - 160, left: left + width / 2 - 150 }
    case "bottom":
      return { position: "absolute", top: bottom + 10, left: left + width / 2 - 150 }
    case "left":
      return { position: "absolute", top: top + height / 2 - 75, left: left - 310 }
    case "right":
      return { position: "absolute", top: top + height / 2 - 75, left: right + 10 }
    default:
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }
  }
}
export default CustomTourGuide