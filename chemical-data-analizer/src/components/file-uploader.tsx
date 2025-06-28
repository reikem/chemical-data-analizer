import type React from "react"
import { useState } from "react"
import { Upload, FileUp, Download } from "lucide-react"
import { Button } from "./ui/button"
import { ColumnSelector } from "./column-selector"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { InfoIcon } from "lucide-react"
import { getFileHeaders } from "../lib/file-processor"
import { DataDisplay } from "./data-display"
import { useChemicalData, useProcessFile } from "../hook/use-chemical-data"

export function FileUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Usar TanStack Query para gestionar los datos
  const { data } = useChemicalData()
  const { mutateAsync: processFile, isPending: isProcessing } = useProcessFile()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)
    setFile(selectedFile)

    try {
      // Solo extraemos las cabeceras y una vista previa de los datos
      const { headers, preview } = await getFileHeaders(selectedFile)
      setHeaders(headers)
      setPreviewData(preview)
      setShowColumnSelector(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleColumnConfirm = async (dateColumns: number[], dateFormat: string) => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      // Usar la mutación de TanStack Query para procesar el archivo
      await processFile({
        file,
        options: { dateColumnIndices: dateColumns, dateFormat },
      })
      setShowColumnSelector(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setHeaders([])
    setPreviewData([])
    setShowColumnSelector(false)
    setError(null)
  }

  const handleDownloadExample = async () => {
    try {
      setIsDownloading(true)
      await generateExampleFile()
    } catch (error) {
      console.error("Error al generar el archivo de ejemplo:", error)
      setError("Error al generar el archivo de ejemplo. Por favor, inténtelo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadSampleFile = async () => {
    try {
      setIsDownloading(true)

      // Descargar el archivo de muestra desde la URL proporcionada
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Muestras_con_Modelo_de_Equipo-w0cV7ZTy3wFGxUV5dDfxOlYOWuc5SK.csv",
      )

      if (!response.ok) {
        throw new Error("No se pudo descargar el archivo de muestra")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "Muestras_con_Modelo_de_Equipo.csv"
      document.body.appendChild(a)
      a.click()

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      console.error("Error al descargar el archivo de muestra:", error)
      setError("Error al descargar el archivo de muestra. Por favor, inténtelo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (showColumnSelector) {
    return (
      <div id="column-selector">
        <ColumnSelector
          headers={headers}
          previewData={previewData}
          onConfirm={handleColumnConfirm}
          onCancel={handleReset}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!data && (
        <>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Cargar Archivo</h2>
            <p className="text-gray-500 text-sm">Sube un archivo CSV o Excel con datos de elementos químicos</p>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Formato de archivo</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                El archivo debe contener al menos una columna de fecha y columnas para cada elemento químico. Las
                cabeceras de las columnas se utilizarán como nombres de los elementos.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleDownloadExample} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar archivo de ejemplo
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadSampleFile} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar muestra de aceite
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                <p className="text-xs text-gray-500">Soporta archivos CSV y Excel (.xlsx, .xls)</p>
              </div>
              <label className="cursor-pointer">
                <Button className="relative">
                  <FileUp className="mr-2 h-4 w-4" />
                  Seleccionar Archivo
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </Button>
              </label>
            </div>
          </div>
        </>
      )}

      {(isLoading || isProcessing) && (
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-gray-500">Procesando archivo...</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      {data && (
        <div id="results-section">
          <DataDisplay data={data} />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleReset}>
              Cargar otro archivo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
function generateExampleFile() {
    throw new Error("Function not implemented.")
}

