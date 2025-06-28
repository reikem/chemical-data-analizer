import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { HelpCircle, X, ArrowRight, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { cn } from "../lib/utils"


// Definición de los pasos del recorrido
const tourSteps = [
  {
    id: "file-upload-section",
    title: "Carga de Archivos",
    description: "Aquí puedes cargar tus archivos CSV o Excel con datos de elementos químicos.",
    position: "bottom",
  },
  {
    id: "column-selector",
    title: "Selector de Columnas",
    description: "Después de cargar un archivo, selecciona qué columna contiene las fechas y su formato.",
    position: "right",
  },
  {
    id: "results-section",
    title: "Resultados del Análisis",
    description: "Aquí verás los resultados del análisis de tus datos químicos.",
    position: "top",
  },
  {
    id: "export-buttons",
    title: "Exportación",
    description: "Exporta tus resultados a PDF o Excel, o imprímelos directamente.",
    position: "bottom",
  },
  {
    id: "summary-cards",
    title: "Resumen",
    description:
      "Estas tarjetas muestran un resumen de tus datos: total de muestras, elementos analizados y rango de fechas.",
    position: "bottom",
  },
  {
    id: "tabs-section",
    title: "Pestañas de Visualización",
    description: "Cambia entre diferentes vistas: gráficos, tabla de datos y estadísticas.",
    position: "top",
  },
  {
    id: "date-range-picker",
    title: "Selector de Rango de Fechas",
    description: "Filtra tus datos por un rango de fechas específico.",
    position: "right",
  },
  {
    id: "elements-selector",
    title: "Selector de Elementos",
    description: "Selecciona qué elementos químicos quieres visualizar en los gráficos.",
    position: "right",
  },
  {
    id: "chart-types",
    title: "Tipos de Gráficos",
    description: "Cambia entre diferentes tipos de visualizaciones: línea, barras, área, etc.",
    position: "top",
  },
  {
    id: "chart-display",
    title: "Visualización de Gráficos",
    description: "Aquí se muestran los gráficos de tus datos químicos según los elementos seleccionados.",
    position: "left",
  },
  {
    id: "data-table",
    title: "Tabla de Datos",
    description: "Visualiza todos tus datos en formato de tabla, con opciones de paginación.",
    position: "top",
  },
  {
    id: "stats-table",
    title: "Estadísticas",
    description:
      "Consulta estadísticas detalladas de cada elemento químico, incluyendo diagnósticos y recomendaciones.",
    position: "top",
  },
  {
    id: "tour-end",
    title: "¡Recorrido Completado!",
    description:
      "Ahora ya conoces todas las funcionalidades de la aplicación. Puedes volver a iniciar este recorrido en cualquier momento haciendo clic en el botón de ayuda.",
    position: "center",
  },
]

export function CustomTourGuide() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [availableSteps, setAvailableSteps] = useState<number[]>([])

  // Iniciar el recorrido
  const startTour = () => {
    // Identificar qué pasos están disponibles en el DOM actual
    const steps = tourSteps
      .map((step, index) => {
        if (step.id === "tour-end" || document.getElementById(step.id)) {
          return index
        }
        return -1
      })
      .filter((index) => index !== -1)

    setAvailableSteps(steps)
    setCurrentStep(0)
    setIsActive(true)
  }

  // Finalizar el recorrido
  const endTour = () => {
    setIsActive(false)
  }

  // Ir al siguiente paso
  const nextStep = () => {
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      endTour()
    }
  }

  // Ir al paso anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Efecto para resaltar el elemento actual
  useEffect(() => {
    if (!isActive || availableSteps.length === 0) return

    const stepIndex = availableSteps[currentStep]
    const step = tourSteps[stepIndex]

    // Si es el paso final, no hay elemento para resaltar
    if (step.id === "tour-end") return

    const element = document.getElementById(step.id)
    if (!element) return

    // Añadir clase para resaltar el elemento
    element.classList.add("tour-highlight")

    // Hacer scroll al elemento
    element.scrollIntoView({ behavior: "smooth", block: "center" })

    return () => {
      // Limpiar la clase al cambiar de paso
      element.classList.remove("tour-highlight")
    }
  }, [isActive, currentStep, availableSteps])

  if (!isActive) {
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
  }

  const stepIndex = availableSteps[currentStep]
  const step = tourSteps[stepIndex]
  const isLastStep = currentStep === availableSteps.length - 1
  const isFirstStep = currentStep === 0

  // Calcular la posición del tooltip
  const getTooltipPosition = () => {
    if (step.id === "tour-end") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    const element = document.getElementById(step.id)
    if (!element) return {}

    const rect = element.getBoundingClientRect()

    switch (step.position) {
      case "top":
        return {
          position: "absolute",
          top: `${rect.top - 150}px`,
          left: `${rect.left + rect.width / 2 - 150}px`,
        }
      case "bottom":
        return {
          position: "absolute",
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2 - 150}px`,
        }
      case "left":
        return {
          position: "absolute",
          top: `${rect.top + rect.height / 2 - 75}px`,
          left: `${rect.left - 310}px`,
        }
      case "right":
        return {
          position: "absolute",
          top: `${rect.top + rect.height / 2 - 75}px`,
          left: `${rect.right + 10}px`,
        }
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }
    }
  }

  return (
    <>
      {/* Overlay semi-transparente */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={endTour} />

      {/* Tooltip del paso actual */}
      <Card
        className={cn("w-[300px] z-[60] shadow-lg", step.id === "tour-end" && "w-[400px]")}
        style={getTooltipPosition() as React.CSSProperties}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">{step.title}</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={endTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{step.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            {currentStep + 1} / {availableSteps.length}
          </div>
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? "Finalizar" : "Siguiente"}
              {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Estilos para el elemento resaltado */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 55;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  )
}