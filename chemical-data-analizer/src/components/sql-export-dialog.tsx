import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

import { DatabaseIcon } from "lucide-react"
import type { ChemicalData } from "../providers/type/data-types"
import { downloadSQL, generateSQLExport } from "../lib/sql-exporter"

interface SQLExportDialogProps {
  data: ChemicalData
}

export function SQLExportDialog({ data }: SQLExportDialogProps) {
  const [tableName, setTableName] = useState("chemical_data")
  const [sqlPreview, setSqlPreview] = useState("")
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    // Generar vista previa SQL cuando se abre el diálogo
    const sql = generateSQLExport(data, tableName)
    setSqlPreview(sql.slice(0, 2000) + (sql.length > 2000 ? "\n\n-- ... (truncado para vista previa) ..." : ""))
    setOpen(true)
  }

  const handleExport = () => {
    const sql = generateSQLExport(data, tableName)
    downloadSQL(sql, `${tableName}_export.sql`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2" onClick={handleOpen}>
          <DatabaseIcon className="h-4 w-4" />
          <span>Exportar SQL</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Exportar datos a SQL</DialogTitle>
          <DialogDescription>
            Genera sentencias SQL para importar los datos en una base de datos relacional.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="table-name" className="text-right">
              Nombre de tabla
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label>Vista previa SQL</Label>
            <Textarea readOnly className="font-mono text-xs h-[300px] overflow-auto" value={sqlPreview} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport}>Descargar SQL</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
