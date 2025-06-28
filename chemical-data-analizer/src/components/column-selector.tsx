import { useState } from "react"
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight } from "lucide-react"
import { Checkbox } from "./ui/checkbox"

interface ColumnSelectorProps {
  headers: string[]
  previewData: string[][]
  onConfirm: (dateColumns: number[], dateFormat: string) => void
  onCancel: () => void
}

export function ColumnSelector({ headers, previewData, onConfirm, onCancel }: ColumnSelectorProps) {
  const [selectedDateColumns, setSelectedDateColumns] = useState<number[]>([])
  const [selectedDateFormat, setSelectedDateFormat] = useState<string>("dd/mm/yyyy")

  const dateFormats = [
    { id: "dd/mm/yyyy", label: "DD/MM/AAAA (31/12/2023)" },
    { id: "mm/dd/yyyy", label: "MM/DD/AAAA (12/31/2023)" },
    { id: "yyyy-mm-dd", label: "AAAA-MM-DD (2023-12-31)" },
    { id: "dd-mm-yyyy", label: "DD-MM-AAAA (31-12-2023)" },
    { id: "text", label: "Texto (31 Diciembre 2023)" },
  ]

  const handleConfirm = () => {
    if (selectedDateColumns.length > 0) {
      onConfirm(selectedDateColumns, selectedDateFormat)
    }
  }

  const handleToggleDateColumn = (columnIndex: number) => {
    setSelectedDateColumns((prev) => {
      if (prev.includes(columnIndex)) {
        return prev.filter((index) => index !== columnIndex)
      } else {
        return [...prev, columnIndex]
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración de Columnas</CardTitle>
        <CardDescription>
          Selecciona las columnas que contienen fechas y especifica su formato para un procesamiento correcto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Columnas de Fecha</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`date-column-${index}`}
                  checked={selectedDateColumns.includes(index)}
                  onCheckedChange={() => handleToggleDateColumn(index)}
                />
                <Label htmlFor={`date-column-${index}`} className="text-sm cursor-pointer">
                  {header}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Puedes seleccionar múltiples columnas si tu archivo contiene varias fechas.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Formato de Fecha</Label>
          <RadioGroup
            value={selectedDateFormat}
            onValueChange={setSelectedDateFormat}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {dateFormats.map((format) => (
              <div key={format.id} className="flex items-center space-x-2">
                <RadioGroupItem value={format.id} id={`format-${format.id}`} />
                <Label htmlFor={`format-${format.id}`} className="cursor-pointer">
                  {format.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {selectedDateColumns.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label>Vista previa de datos</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          selectedDateColumns.includes(index) ? "bg-blue-100" : ""
                        }`}
                      >
                        {header}
                        {selectedDateColumns.includes(index) && " (Fecha)"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-3 py-2 text-sm text-gray-500 ${
                            selectedDateColumns.includes(cellIndex) ? "bg-blue-50" : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedDateColumns.length === 0}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
