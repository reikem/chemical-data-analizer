
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "./ui/button"
import { useState, useMemo } from "react"

import type { ChemicalData } from "../providers/type/data-types"
import { getAtomicNumber } from "../lib/periodic-table"

interface DataTableProps {
  data: ChemicalData
  diagnostics?: Record<string, { diagnostic: string; recommendation: string }>
}

export function DataTable({ data, diagnostics }: DataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo<ColumnDef<any>[]>(() => {
    // Create columns dynamically based on the data
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) => row.getValue("date"),
      },
    ]

    // Add additional columns if they exist in the data
    if (data.samples[0]?.model) {
      cols.push({
        accessorKey: "model",
        header: "Modelo",
        cell: ({ row }) => row.getValue("model") || "-",
      })
    }

    if (data.samples[0]?.unit) {
      cols.push({
        accessorKey: "unit",
        header: "Unidad",
        cell: ({ row }) => row.getValue("unit") || "-",
      })
    }

    if (data.samples[0]?.component) {
      cols.push({
        accessorKey: "component",
        header: "Componente",
        cell: ({ row }) => row.getValue("component") || "-",
      })
    }

    cols.push({
      accessorKey: "machine",
      header: "Máquina",
      cell: ({ row }) => row.getValue("machine") || "-",
    })

    // Add columns for each chemical element
    data.elements.forEach((element) => {
      // Añadir columna para el número atómico
      cols.push({
        accessorKey: `${element.name}_atomic`,
        header: "Nº Atómico",
        cell: ({ row }) => {
          const atomicNumber = getAtomicNumber(element.name)
          return atomicNumber !== null && atomicNumber > 0 ? atomicNumber : "-"
        },
      })

      // Añadir columna para el valor del elemento
      cols.push({
        accessorKey: element.name,
        header: element.name,
        cell: ({ row }) => {
          const value = row.getValue(element.name)
          return typeof value === "number" ? value.toFixed(2) : value
        },
      })
    })

    // Add diagnostic and recommendation columns if provided
    if (diagnostics) {
      cols.push({
        accessorKey: "diagnostic",
        header: "Diagnóstico",
        cell: ({ row }) => {
          // Get the first element that has a non-normal diagnostic
          const elementWithIssue = data.elements.find(
            (element) => diagnostics[element.name]?.diagnostic !== "Normal" && row.getValue(element.name) !== undefined,
          )

          if (elementWithIssue) {
            return diagnostics[elementWithIssue.name]?.diagnostic
          }
          return "Normal"
        },
      })

      cols.push({
        accessorKey: "recommendation",
        header: "Recomendación",
        cell: ({ row }) => {
          // Get the first element that has a non-normal diagnostic
          const elementWithIssue = data.elements.find(
            (element) => diagnostics[element.name]?.diagnostic !== "Normal" && row.getValue(element.name) !== undefined,
          )

          if (elementWithIssue) {
            return diagnostics[elementWithIssue.name]?.recommendation
          }
          return "No se requieren acciones"
        },
      })
    }

    return cols
  }, [data, diagnostics])

  const tableData = useMemo(() => {
    return data.samples.map((sample) => {
      const rowData: Record<string, any> = {
        date: sample.date,
        machine: sample.machine,
      }

      // Add additional fields if they exist
      if (sample.model) rowData.model = sample.model
      if (sample.unit) rowData.unit = sample.unit
      if (sample.component) rowData.component = sample.component
      if (sample.zone) rowData.zone = sample.zone
      if (sample.country) rowData.country = sample.country

      // Add element values and atomic numbers
      sample.values.forEach((value, index) => {
        if (index < data.elements.length) {
          const elementName = data.elements[index].name
          rowData[elementName] = value

          // Add atomic number
          const atomicNumber = getAtomicNumber(elementName)
          rowData[`${elementName}_atomic`] = atomicNumber !== null && atomicNumber > 0 ? atomicNumber : "-"
        }
      })

      return rowData
    })
  }, [data])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  if (tableData.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No hay datos disponibles para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
