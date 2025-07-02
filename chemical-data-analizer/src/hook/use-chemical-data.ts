// src/hook/use-chemical-data.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ChemicalData } from "../providers/type/data-types"
import { processFile } from "../lib/file-processor"

/* ────────────────────────────────────────────────────────────────── */
const CHEMICAL_DATA_KEY = "chemical-data"

/* DATOS CRUD  ––––––––––––––––––––––––––––––––––––––––––––––––––––– */
export function useChemicalData() {
  return useQuery<ChemicalData | null>({
    queryKey   : [CHEMICAL_DATA_KEY],
    initialData: null,
  })
}

export function useProcessFile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      options,
    }: {
      file: File
      options: { dateColumnIndices?: number[]; dateFormat?: string }
    }) => processFile(file, options),

    onSuccess: (data) => {
      /* validar numéricos */
      const validated = {
        ...data,
        samples: data.samples.map((s) => ({
          ...s,
          values: s.values.map((v) =>
            typeof v === "number" && !isNaN(v) ? v : 0,
          ),
        })),
      }
      qc.setQueryData([CHEMICAL_DATA_KEY], validated)
      /* ¡vaciar selección existente! */
      qc.setQueryData([CHEMICAL_DATA_KEY, "selectedElements"], [])
    },
  })
}

/* FILTRADO POR FECHA  –––––––––––––––––––––––––––––––––––––––––––– */
export function useFilteredData(
  data: ChemicalData | null,
  [from, to]: [Date | undefined, Date | undefined],
) {
  return useQuery<ChemicalData | null>({
    queryKey : [CHEMICAL_DATA_KEY, "filtered", from?.toISOString(), to?.toISOString()],
    enabled  : !!data,
    initialData: data,
    queryFn  : () => {
      if (!data) return null
      if (!from && !to) return data

      const inside = (d: Date) =>
        (!from || d >= from) && (!to || d <= to)

      return {
        ...data,
        samples: data.samples.filter((s) =>
          inside(new Date(s.date.split("/").reverse().join("-"))),
        ),
      }
    },
  })
}

/* SELECCIÓN DE ELEMENTOS  ––––––––––––––––––––––––––––––––––––––––– */
export function useSelectedElements(data: ChemicalData | null) {
  const qc = useQueryClient()

  /* estado react-query -------------------------------------------------- */
  const selectedElements = useQuery<string[]>({
    queryKey   : [CHEMICAL_DATA_KEY, "selectedElements"],
    enabled    : !!data,
    initialData: [],                      // ← VACÍO por defecto
  })

  /* helpers ------------------------------------------------------------- */
  const setSelectedElements = (els: string[]) =>
    qc.setQueryData([CHEMICAL_DATA_KEY, "selectedElements"], els)

  const toggleElement = (el: string) => {
    const current: string[] =
      (qc.getQueryData([CHEMICAL_DATA_KEY, "selectedElements"]) as string[]) ?? []
    setSelectedElements(
      current.includes(el)
        ? current.filter((x) => x !== el)
        : [...current, el],
    )
  }

  const selectAll   = () =>
    data && setSelectedElements(data.elements.map((e) => e.name))
  const deselectAll = () => setSelectedElements([])

  return {
    selectedElements: selectedElements.data ?? [],
    setSelectedElements,
    toggleElement,
    selectAll,
    deselectAll,
  }
}
