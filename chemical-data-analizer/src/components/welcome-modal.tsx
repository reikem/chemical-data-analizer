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


export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verificar si es la primera visita
    const hasVisited = localStorage.getItem("hasVisitedChemicalAnalyzer")
    if (!hasVisited) {
      setIsOpen(true)
      localStorage.setItem("hasVisitedChemicalAnalyzer", "true")
    }
  }, [])

  const startTour = () => {
    setIsOpen(false)
    // Iniciar el recorrido guiado
    const tourButton = document.querySelector(".tour-guide-button") as HTMLButtonElement
    if (tourButton) {
      tourButton.click()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¡Bienvenido al Analizador de Datos Químicos!</DialogTitle>
          <DialogDescription>
            Esta aplicación te permite analizar y visualizar datos de elementos químicos de manera sencilla y efectiva.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            Puedes cargar archivos CSV o Excel, visualizar los datos en diferentes tipos de gráficos, filtrar por fechas
            y exportar los resultados.
          </p>
          <p>¿Te gustaría hacer un recorrido guiado para conocer todas las funcionalidades?</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            No, gracias
          </Button>
          <Button onClick={startTour}>Iniciar recorrido guiado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}