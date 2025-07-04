import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns,
} from "lucide-react"

import { getAtomicNumber } from "../lib/periodic-table"
import type { ChemicalData } from "../providers/type/data-types"

/* ─────────────────────────────────────────────────────────────── */

interface DataTableProps {
  data: ChemicalData
  diagnostics?: Record<string, { diagnostic: string; recommendation: string }>
  initialHidden?: string[]           // IDs seguros a ocultar
  pageSizeOptions?: number[]
}

/* Helper: convierte cualquier cadena en un ID seguro para JS/React-Table */
const makeId = (txt: string) =>
  txt
    .normalize("NFD")                // quita tildes
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_]+/g, "_") // espacios, paréntesis, puntos → _
    .replace(/^_+|_+$/g, "")         // sin _ al inicio/final

export function DataTable({
  data,
  diagnostics,
  initialHidden = ["machine", "unit", "component", "model"], // ya en formato seguro
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps) {
  /* 1️⃣  Generamos un mapa “nombre original → idSeguro” */
  const elementIdMap = useMemo(() => {
    const map: Record<string, string> = {}
    data.elements.forEach((el) => {
      map[el.name] = makeId(el.name) // ej. “Penetración_trabajada_100_000x_0_1_mm”
    })
    return map
  }, [data.elements])

  /* 2️⃣  Definición de columnas (con el ID seguro) */
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      { accessorKey: "date",      header: "Fecha"      },
      { accessorKey: "machine",   header: "Máquina"    },
      { accessorKey: "unit",      header: "Unidad"     },
      { accessorKey: "component", header: "Componente" },
      { accessorKey: "model",     header: "Modelo"     },
    ]

    data.elements.forEach((el) => {
      const id  = elementIdMap[el.name]
      const aid = `${id}__atomic`

      cols.push({
        accessorKey: aid,
        header:      `Nº Atómico (${el.name})`,
      })
      cols.push({
        accessorKey: id,
        header:      el.name,
        cell: ({ row }) => {
          const v = row.getValue<number>(id)
          return typeof v === "number" ? v.toFixed(2) : v
        },
      })
    })

    if (diagnostics) {
      cols.push({ accessorKey: "diagnostic",     header: "Diagnóstico"   })
      cols.push({ accessorKey: "recommendation", header: "Recomendación" })
    }
    return cols
  }, [data.elements, diagnostics, elementIdMap])

  /* 3️⃣  Filas con las mismas claves seguras */
  const rows = useMemo(() => {
    return data.samples.map((s) => {
      const r: Record<string, any> = {
        date: s.date,
        machine: s.machine,
        unit: s.unit,
        component: s.component,
        model: s.model,
      }

      data.elements.forEach((el, idx) => {
        const id  = elementIdMap[el.name]
        const aid = `${id}__atomic`
        r[id]  = s.values[idx] ?? 0
        r[aid] = getAtomicNumber(el.name) ?? "-"
      })

      if (diagnostics) {
        const prob = data.elements.find(
          (e) =>
            diagnostics[e.name]?.diagnostic !== "Normal" &&
            typeof r[elementIdMap[e.name]] !== "undefined",
        )
        r.diagnostic     = prob ? diagnostics[prob.name].diagnostic     : "Normal"
        r.recommendation = prob ? diagnostics[prob.name].recommendation : "Sin acciones"
      }

      return r
    })
  }, [data, diagnostics, elementIdMap])

  /* 4️⃣  Estados de tabla */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize : pageSizeOptions[0],
  })
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(
      Object.fromEntries(initialHidden.map((k) => [k, false])),
    )

  const table = useReactTable({
    data: rows,
    columns,
    state: { pagination, columnVisibility },
    onPaginationChange:       setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel:      getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  /* 5️⃣  INTERFAZ */
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header, header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Column visibility */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1">
              <Columns className="h-4 w-4" /> Columnas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <p className="text-xs mb-2 text-muted-foreground">Mostrar / ocultar</p>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {table.getAllLeafColumns().map((col) => (
                <label key={col.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={col.getIsVisible()}
                    onCheckedChange={() => col.toggleVisibility()}
                  />
                  {col.columnDef.header as string}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Page-size */}
        <div className="flex items-center gap-2 text-sm">
          Filas:
          <select
            className="border rounded px-2 py-1"
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
            }
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="px-2 text-sm">
            Página {pagination.pageIndex + 1} de {table.getPageCount()}
          </span>

          <Button variant="outline" size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
