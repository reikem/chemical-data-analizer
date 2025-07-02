import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import {
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { cn } from "../lib/utils"

/* ---------------------------------------------------------
 * ¡NO CAMBIES el tipo ni el nombre de este export!
 * --------------------------------------------------------- */
export const TOUR_STEPS = [
  {
    id: "file-upload-section",
    title: "Carga de Archivos",
    description:
      "Aquí puedes cargar tus archivos CSV o Excel con datos de elementos químicos.",
    position: "bottom" as "top" | "bottom" | "left" | "right",
  },
  /* … resto de pasos … */
  {
    id: "tour-end",
    title: "¡Recorrido Completado!",
    description:
      "Ahora ya conoces todas las funcionalidades de la aplicación. Puedes volver a iniciar este recorrido en cualquier momento haciendo clic en el botón de ayuda.",
    position: "center" as "top" | "bottom" | "left" | "right" | "center",
  },
] as const   // ← mantiene inmutable la forma del array

/* ---------------------------------------------------------
 *  COMPONENTE
 * --------------------------------------------------------- */
export function CustomTourGuide() {
  const [isActive, setIsActive]     = useState(false)
  const [current, setCurrent]       = useState(0)
  const [available, setAvailable]   = useState<number[]>([])

  /* ---------- Lógica de inicio --------------------------------------- */
  const startTour = () => {
    const visible = TOUR_STEPS
      .map((s, i) =>
        s.id === "tour-end" || document.getElementById(s.id) ? i : -1,
      )
      .filter((i) => i !== -1)

    setAvailable(visible)
    setCurrent(0)
    setIsActive(true)
  }

  const endTour   = () => setIsActive(false)
  const nextStep  = () =>
    current < available.length - 1 ? setCurrent((p) => p + 1) : endTour()
  const prevStep  = () =>
    current > 0 && setCurrent((p) => p - 1)

  /* ---------- Resaltar elemento -------------------------------------- */
  useEffect(() => {
    if (!isActive || !available.length) return

    const step = TOUR_STEPS[available[current]]
    if (step.id === "tour-end") return

    const el = document.getElementById(step.id)
    if (!el) return

    el.classList.add("tour-highlight")
    el.scrollIntoView({ behavior: "smooth", block: "center" })

    return () => el.classList.remove("tour-highlight")
  }, [isActive, current, available])

  /* ---------- Botón flotante ----------------------------------------- */
  if (!isActive)
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={startTour}
        className="fixed bottom-4 right-4 z-50 rounded-full w-10 h-10 p-0 tour-guide-button"
        title="Iniciar recorrido guiado"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    )

  /* ---------- Tooltip ------------------------------------------------- */
  const step      = TOUR_STEPS[available[current]]
  const last      = current === available.length - 1
  const first     = current === 0

  /* Función para calcular posición … (sin cambios) */
  const tooltipPos = () => {
    if (step.id === "tour-end")
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }

    const el = document.getElementById(step.id)!
    const r  = el.getBoundingClientRect()

    switch (step.position) {
      case "top":
        return { position: "absolute", top: r.top - 150, left: r.left + r.width / 2 - 150 }
      case "bottom":
        return { position: "absolute", top: r.bottom + 10, left: r.left + r.width / 2 - 150 }
      case "left":
        return { position: "absolute", top: r.top + r.height / 2 - 75, left: r.left - 310 }
      case "right":
        return { position: "absolute", top: r.top + r.height / 2 - 75, left: r.right + 10 }
      default:
        return {}
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={endTour} />

      <Card
        className={cn("w-[300px] z-[60] shadow-lg",
          step.id === "tour-end" && "w-[400px]")}
        style={tooltipPos() as React.CSSProperties}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">{step.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={endTour}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm">{step.description}</p>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {current + 1} / {available.length}
          </span>

          <div className="flex gap-2">
            {!first && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={nextStep}>
              {last ? "Finalizar" : "Siguiente"}
              {!last && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Estilo para resaltar */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 55;
          box-shadow: 0 0 0 4px rgba(59,130,246,.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  )
}