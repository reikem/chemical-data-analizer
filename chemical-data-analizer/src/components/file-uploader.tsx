import type React from "react"
import { useState } from "react"
import { Upload, FileUp, Download } from "lucide-react"

import { Button }               from "./ui/button"
import { ColumnSelector }       from "./column-selector"
import { Alert,
         AlertDescription,
         AlertTitle }           from "./ui/alert"
import { InfoIcon }             from "lucide-react"

import { DataDisplay }          from "./data-display"
import { getFileHeaders } from "../lib/file-processor"
import { useChemicalData, useProcessFile } from "../hook/use-chemical-data"


/* -------------------------------------------------------------------------- */
/*  COMPONENTE                                                                */
/* -------------------------------------------------------------------------- */
export function FileUploader() {
  /* estado local --------------------------------------------------------- */
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [file,        setFile]        = useState<File | null>(null)
  const [headers,     setHeaders]     = useState<string[]>([])
  const [preview,     setPreview]     = useState<string[][]>([])
  const [showSel,     setShowSel]     = useState(false)
  const [downloading, setDownloading] = useState(false)

  /* caché global --------------------------------------------------------- */
  const { data } = useChemicalData()
  const {
    mutateAsync: processFile,
    isPending:   isProcessing,
  } = useProcessFile()

  /* ---------------------------------------------------------------------- */
  /*  HANDLERS                                                              */
  /* ---------------------------------------------------------------------- */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const f = e.target.files?.[0]
    if (!f) return

    setIsLoading(true)
    setError(null)
    setFile(f)

    try {
      const { headers, preview } = await getFileHeaders(f)
      setHeaders(headers)
      setPreview(preview)
      setShowSel(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el archivo",
      )
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleColumnConfirm = async (
    dateCols: number[],
    dateFmt: string,
  ) => {
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      await processFile({
        file,
        options: { dateColumnIndices: dateCols, dateFormat: dateFmt },
      })
      setShowSel(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el archivo",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setHeaders([])
    setPreview([])
    setShowSel(false)
    setError(null)
  }

  /* -------------------------------- ejemplo ----------------------------- */
  const handleDownloadExample = async () => {
    try {
      setDownloading(true)
      await generateExampleFile()
    } catch (err) {
      console.error(err)
      setError("No se pudo generar el archivo de ejemplo.")
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadSampleFile = async () => {
    try {
      setDownloading(true)
      const res = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Muestras_con_Modelo_de_Equipo-w0cV7ZTy3wFGxUV5dDfxOlYOWuc5SK.csv",
      )
      if (!res.ok) throw new Error("Descarga fallida")

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = "Muestras_con_Modelo_de_Equipo.csv"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (err) {
      console.error(err)
      setError("Error al descargar el archivo de muestra.")
    } finally {
      setDownloading(false)
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  RENDER CON SELECTOR DE COLUMNAS                                       */
  /* ---------------------------------------------------------------------- */
  if (showSel)
    return (
      <ColumnSelector
        headers={headers}
        previewData={preview}
        onConfirm={handleColumnConfirm}
        onCancel={handleReset}
      />
    )

  /* ---------------------------------------------------------------------- */
  /*  UI PRINCIPAL                                                          */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* ------------------ carga inicial -------------------------------- */}
      {!data && (
        <>
          <header className="space-y-2">
            <h2 className="text-xl font-semibold">Cargar archivo</h2>
            <p className="text-muted-foreground text-sm">
              Sube un CSV o Excel con tus datos de análisis de aceite.
            </p>
          </header>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Formato esperado</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                El documento debe incluir al menos una columna de fecha y
                múltiples columnas con los elementos químicos.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadExample}
                  disabled={downloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Ejemplo CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSampleFile}
                  disabled={downloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Muestra real
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* drag-and-drop / input file */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <Upload className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-sm">
                Arrastra tu archivo aquí o haz clic para seleccionarlo
              </p>
              <label className="cursor-pointer">
                <Button className="relative">
                  <FileUp className="mr-2 h-4 w-4" />
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </Button>
              </label>
            </div>
          </div>
        </>
      )}

      {/* spinner --------------------------------------------------------- */}
      {(isLoading || isProcessing) && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-current border-r-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            Procesando archivo…
          </p>
        </div>
      )}

      {/* error ----------------------------------------------------------- */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* resultados ------------------------------------------------------ */}
      {data && (
        <section id="results-section">
          <DataDisplay data={data} />
          <div className="text-center mt-6">
            <Button variant="outline" onClick={handleReset}>
              Cargar otro archivo
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  FUNCIÓN AUXILIAR: CSV DE EJEMPLO                                          */
/* -------------------------------------------------------------------------- */
async function generateExampleFile(rows = 10) {
  const elementHeaders = ["Fe", "Cu"]
  const headerRow = ["Fecha", "Máquina", ...elementHeaders]

  const start = new Date("2023-01-01")
  const csvRows: string[] = [headerRow.join(",")]

  for (let i = 0; i < rows; i++) {
    const d   = new Date(start)
    d.setDate(d.getDate() + i * 7)           // +1 semana por fila
    const dateStr = d.toISOString().split("T")[0] // yyyy-mm-dd
    const machine = `Equipo ${String.fromCharCode(65 + (i % 5))}`

    const Fe = (Math.random() * 80 + 20).toFixed(1) // 20-100 ppm
    const Cu = (Math.random() * 40 + 10).toFixed(1) // 10-50  ppm

    csvRows.push([dateStr, machine, Fe, Cu].join(","))
  }

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const a   = document.createElement("a")
  a.href = url
  a.download = "ejemplo_analisis_aceite.csv"
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}