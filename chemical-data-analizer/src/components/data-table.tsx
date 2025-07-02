import { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./ui/popover"
import { Checkbox } from "./ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
} from "lucide-react"

import type { ChemicalData } from "../providers/type/data-types"
import { getAtomicNumber } from "../lib/periodic-table"

/* -------------------------------------------------------------------------- */
/*  PROPS                                                                     */
/* -------------------------------------------------------------------------- */
interface DataTableProps {
  data: ChemicalData
  diagnostics?: Record<
    string,
    { diagnostic: string; recommendation: string }
  >
  initialHidden?: string[]      // IDs de columnas que quieres ocultar al cargar
  pageSizeOptions?: number[]
}

/* -------------------------------------------------------------------------- */
/*  COMPONENTE                                                                */
/* -------------------------------------------------------------------------- */
export function DataTable({
  data,
  diagnostics,
  initialHidden = ["machine", "unit", "component", "model"],
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps) {
  /* -------------------------------------------------------------------- */
  /*  1. COLUMNAS DINÁMICAS                                               */
  /* -------------------------------------------------------------------- */
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      { accessorKey: "date", header: "Fecha" },
      { accessorKey: "machine", header: "Máquina" },
      { accessorKey: "unit", header: "Unidad" },
      { accessorKey: "component", header: "Componente" },
      { accessorKey: "model", header: "Modelo" },
    ]

    // Elementos químicos (valor + nº atómico)
    data.elements.forEach((el) => {
      cols.push({
        accessorKey: `${el.name}_atomic`,
        header: `Nº Atómico (${el.name})`,
        cell: ({ row }) => row.getValue(`${el.name}_atomic`),
      })
      cols.push({
        accessorKey: el.name,
        header: el.name,
        cell: ({ row }) =>
          typeof row.getValue(el.name) === "number"
            ? (row.getValue(el.name) as number).toFixed(2)
            : row.getValue(el.name),
      })
    })

    if (diagnostics) {
      cols.push({
        accessorKey: "diagnostic",
        header: "Diagnóstico",
        cell: ({ row }) => row.getValue("diagnostic"),
      })
      cols.push({
        accessorKey: "recommendation",
        header: "Recomendación",
        cell: ({ row }) => row.getValue("recommendation"),
      })
    }

    return cols
  }, [data.elements, diagnostics])

  /* -------------------------------------------------------------------- */
  /*  2. DATOS FILA                                                       */
  /* -------------------------------------------------------------------- */
  const rowsData = useMemo(() => {
    return data.samples.map((s) => {
      const row: Record<string, any> = {
        date: s.date,
        machine: s.machine,
        unit: s.unit,
        component: s.component,
        model: s.model,
      }

      s.values.forEach((v, i) => {
        const elName = data.elements[i].name
        row[elName] = v
        row[`${elName}_atomic`] =
          getAtomicNumber(elName) ?? "-"
      })

      if (diagnostics) {
        const elemWithIssue = data.elements.find(
          (e) =>
            diagnostics[e.name]?.diagnostic !== "Normal" &&
            typeof row[e.name] !== "undefined",
        )
        if (elemWithIssue) {
          row.diagnostic = diagnostics[elemWithIssue.name].diagnostic
          row.recommendation =
            diagnostics[elemWithIssue.name].recommendation
        } else {
          row.diagnostic = "Normal"
          row.recommendation = "Sin acciones"
        }
      }

      return row
    })
  }, [data, diagnostics])

  /* -------------------------------------------------------------------- */
  /*  3. REACT-TABLE                                                      */
  /* -------------------------------------------------------------------- */
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(
      Object.fromEntries(initialHidden.map((id) => [id, false])),
    )

  const table = useReactTable({
    data: rowsData,
    columns,
    state: { columnVisibility, pagination: {
      pageSize,
      pageIndex: 0
    } },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) =>
      table.setPagination(updater as any),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  /* -------------------------------------------------------------------- */
  /*  4. UI                                                               */
  /* -------------------------------------------------------------------- */
  return (
    <div className="space-y-4" id="data-table">
      {/* ---------- Tabla ------------------------------------------------ */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          {/* HEADERS */}
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* FILAS */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---------- Controles ------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Visibilidad de columnas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1">
              <Columns className="h-4 w-4" />
              Columnas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <p className="text-xs mb-2 font-medium text-muted-foreground">
              Mostrar / ocultar
            </p>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-1">
              {table
                .getAllLeafColumns()
                .map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
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

        {/* Selector de pageSize */}
        <div className="flex items-center gap-2 text-sm">
          <span>Filas:</span>
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
              setPageSize(Number(e.target.value))
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Paginación */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
