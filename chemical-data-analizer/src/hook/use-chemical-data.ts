
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ChemicalData } from "../providers/type/data-types"
import { processFile } from "../lib/file-processor"


// Clave para el caché de datos químicos
const CHEMICAL_DATA_KEY = "chemical-data"

// Hook para obtener los datos químicos del caché
export function useChemicalData() {
  return useQuery<ChemicalData | null>({
    queryKey: [CHEMICAL_DATA_KEY],
    // Inicialmente no hay datos
    initialData: null,
  })
}

// Hook para procesar un archivo y actualizar los datos
export function useProcessFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      options,
    }: {
      file: File
      options: { dateColumnIndices?: number[]; dateFormat?: string }
    }) => {
      return await processFile(file, options)
    },
    onSuccess: (data) => {
      // Verificar que los datos sean válidos antes de actualizarlos en el caché
      if (data && data.elements && data.samples) {
        // Asegurarse de que todos los valores sean números válidos
        const validatedData = {
          ...data,
          samples: data.samples.map((sample) => ({
            ...sample,
            values: sample.values.map((value) => (typeof value === "number" && !isNaN(value) ? value : 0)),
          })),
        }
        // Actualizar los datos en el caché
        queryClient.setQueryData([CHEMICAL_DATA_KEY], validatedData)
      }
    },
  })
}

// Hook para filtrar los datos por fecha
export function useFilteredData(data: ChemicalData | null, dateRange: [Date | undefined, Date | undefined]) {
  return useQuery<ChemicalData | null>({
    queryKey: [CHEMICAL_DATA_KEY, "filtered", dateRange],
    enabled: !!data,
    initialData: data,
    queryFn: () => {
      if (!data || !data.samples || !data.elements) return null
      if (!dateRange[0] && !dateRange[1]) return data

      const [startDate, endDate] = dateRange

      const filteredSamples = data.samples.filter((sample) => {
        const sampleDate = new Date(sample.date.split("/").reverse().join("-"))

        if (startDate && endDate) {
          return sampleDate >= startDate && sampleDate <= endDate
        } else if (startDate) {
          return sampleDate >= startDate
        } else if (endDate) {
          return sampleDate <= endDate
        }

        return true
      })

      return {
        ...data,
        samples: filteredSamples,
      }
    },
  })
}

// Hook para seleccionar elementos
export function useSelectedElements(data: ChemicalData | null) {
  const queryClient = useQueryClient()

  // Obtener elementos seleccionados del caché o inicializar con todos los elementos
  const selectedElements = useQuery<string[]>({
    queryKey: [CHEMICAL_DATA_KEY, "selectedElements"],
    enabled: !!data,
    initialData: data?.elements?.map((el) => el.name) || [],
  })

  // Función para actualizar los elementos seleccionados
  const setSelectedElements = (elements: string[]) => {
    queryClient.setQueryData([CHEMICAL_DATA_KEY, "selectedElements"], elements)
  }

  // Funciones de utilidad
  const toggleElement = (element: string) => {
    const current = selectedElements.data || []
    if (current.includes(element)) {
      setSelectedElements(current.filter((el) => el !== element))
    } else {
      setSelectedElements([...current, element])
    }
  }

  const selectAll = () => {
    if (data && data.elements) {
      setSelectedElements(data.elements.map((el) => el.name))
    }
  }

  const deselectAll = () => {
    setSelectedElements([])
  }

  return {
    selectedElements: selectedElements.data || [],
    toggleElement,
    selectAll,
    deselectAll,
  }
}