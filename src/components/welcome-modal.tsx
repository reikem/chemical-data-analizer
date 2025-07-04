// src/components/welcome-modal.tsx
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"

/**
 * Muestra un modal de bienvenida sólo la primera vez que el usuario
 * visita la aplicación. Desde aquí se puede lanzar el Tour Guiado.
 */
export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  /* ───────────────────────── Primera visita ─────────────────────────── */
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedChemicalAnalyzer")
    if (!hasVisited) {
      setIsOpen(true)
      localStorage.setItem("hasVisitedChemicalAnalyzer", "true")
    }
  }, [])

  /* ───────────────────────── Lanzar Tour ────────────────────────────── */
  const startTour = () => {
    setIsOpen(false)

    const tourButton = document.querySelector(
      ".tour-guide-button",
    ) as HTMLButtonElement | null

    if (tourButton) {
      tourButton.click()
    } else {

      setTimeout(() => {
        const retry = document.querySelector(
          ".tour-guide-button",
        ) as HTMLButtonElement | null
        retry?.click()
      }, 300)
    }
  }

  /* ───────────────────────── Render ─────────────────────────────────── */
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¡Bienvenido al Analizador de Datos Químicos!</DialogTitle>
          <DialogDescription>
            Esta aplicación te permite analizar y visualizar datos de aceite y
            elementos químicos de forma sencilla y efectiva.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          <p>
            • Carga archivos CSV o Excel. <br />
            • Visualiza los datos en distintos tipos de gráficos. <br />
            • Filtra por fechas y exporta los resultados.
          </p>
          <p>¿Te gustaría realizar un recorrido guiado para conocer todas las funcionalidades?</p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            No, gracias
          </Button>
          <Button onClick={startTour}>Iniciar recorrido guiado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
