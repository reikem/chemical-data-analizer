// Function to normalize dates to dd/mm/yyyy format
export function normalizeDate(dateInput: string | number | Date, format?: string): string {
    if (!dateInput) return ""
  
    let date: Date
  
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === "number") {
      // Excel dates are stored as numbers
      date = excelDateToJSDate(dateInput)
    } else {
      // Try to parse string date based on the specified format
      date = parseStringDate(dateInput, format)
    }
  
    // Format as dd/mm/yyyy
    return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}`
  }
  
  // Parse various string date formats
  function parseStringDate(dateStr: string, format?: string): Date {
    dateStr = dateStr.trim()
  
    // If format is specified, use it to parse the date
    if (format) {
      switch (format) {
        case "dd/mm/yyyy":
          return parseDateWithFormat(dateStr, "dd/mm/yyyy")
        case "mm/dd/yyyy":
          return parseDateWithFormat(dateStr, "mm/dd/yyyy")
        case "yyyy-mm-dd":
          return parseDateWithFormat(dateStr, "yyyy-mm-dd")
        case "dd-mm-yyyy":
          return parseDateWithFormat(dateStr, "dd-mm-yyyy")
        case "text":
          return parseTextDate(dateStr)
      }
    }
  
    // Check if it's already in a standard format
    const jsDate = new Date(dateStr)
    if (!isNaN(jsDate.getTime())) {
      return jsDate
    }
  
    // Try to parse dd/mm/yyyy or mm/dd/yyyy
    const slashParts = dateStr.split("/")
    if (slashParts.length === 3) {
      // Assume dd/mm/yyyy format
      const day = Number.parseInt(slashParts[0], 10)
      const month = Number.parseInt(slashParts[1], 10) - 1
      const year = Number.parseInt(slashParts[2], 10)
  
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
  
      // Try mm/dd/yyyy format
      const date2 = new Date(year, day - 1, month)
      if (!isNaN(date2.getTime())) {
        return date2
      }
    }
  
    // Try to parse formats like "12 Friday July 2025"
    return parseTextDate(dateStr)
  }
  
  function parseDateWithFormat(dateStr: string, format: string): Date {
    let day: number, month: number, year: number
  
    if (format === "dd/mm/yyyy") {
      const parts = dateStr.split("/")
      if (parts.length === 3) {
        day = Number.parseInt(parts[0], 10)
        month = Number.parseInt(parts[1], 10) - 1
        year = Number.parseInt(parts[2], 10)
      } else {
        throw new Error(`La fecha "${dateStr}" no coincide con el formato dd/mm/yyyy`)
      }
    } else if (format === "mm/dd/yyyy") {
      const parts = dateStr.split("/")
      if (parts.length === 3) {
        month = Number.parseInt(parts[0], 10) - 1
        day = Number.parseInt(parts[1], 10)
        year = Number.parseInt(parts[2], 10)
      } else {
        throw new Error(`La fecha "${dateStr}" no coincide con el formato mm/dd/yyyy`)
      }
    } else if (format === "yyyy-mm-dd") {
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        year = Number.parseInt(parts[0], 10)
        month = Number.parseInt(parts[1], 10) - 1
        day = Number.parseInt(parts[2], 10)
      } else {
        throw new Error(`La fecha "${dateStr}" no coincide con el formato yyyy-mm-dd`)
      }
    } else if (format === "dd-mm-yyyy") {
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        day = Number.parseInt(parts[0], 10)
        month = Number.parseInt(parts[1], 10) - 1
        year = Number.parseInt(parts[2], 10)
      } else {
        throw new Error(`La fecha "${dateStr}" no coincide con el formato dd-mm-yyyy`)
      }
    } else {
      throw new Error(`Formato de fecha no soportado: ${format}`)
    }
  
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900
    }
  
    const date = new Date(year, month, day)
    if (isNaN(date.getTime())) {
      throw new Error(`Fecha inválida: ${dateStr}`)
    }
  
    return date
  }
  
  function parseTextDate(dateStr: string): Date {

    const textDateRegex = /(\d{1,2})\s+(\w+)\s+(\w+)\s+(\d{4})/
    const textMatch = dateStr.match(textDateRegex)
  
    if (textMatch) {
      const day = Number.parseInt(textMatch[1], 10)
      const month = getMonthFromName(textMatch[3])
      const year = Number.parseInt(textMatch[4], 10)
  
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  
    const monthFirstRegex = /(\w+)\s+(\d{1,2})(?:,|\s+)?\s*(\d{4})/
    const monthMatch = dateStr.match(monthFirstRegex)
  
    if (monthMatch) {
      const month = getMonthFromName(monthMatch[1])
      const day = Number.parseInt(monthMatch[2], 10)
      const year = Number.parseInt(monthMatch[3], 10)
  
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  

    console.warn(`Could not parse date: ${dateStr}, using current date instead`)
    return new Date()
  }
  

  function excelDateToJSDate(excelDate: number): Date {
  
    const millisecondsPerDay = 24 * 60 * 60 * 1000
    const jsDate = new Date(Math.round((excelDate - 25569) * millisecondsPerDay))
    return jsDate
  }
  

  function getMonthFromName(monthName: string): number {
    const months: Record<string, number> = {
      january: 0,
      enero: 0,
      jan: 0,
      ene: 0,
      february: 1,
      febrero: 1,
      feb: 1,
      march: 2,
      marzo: 2,
      mar: 2,
      april: 3,
      abril: 3,
      apr: 3,
      abr: 3,
      may: 4,
      mayo: 4,
      june: 5,
      junio: 5,
      jun: 5,
      july: 6,
      julio: 6,
      jul: 6,
      august: 7,
      agosto: 7,
      aug: 7,
      ago: 7,
      september: 8,
      septiembre: 8,
      sep: 8,
      october: 9,
      octubre: 9,
      oct: 9,
      november: 10,
      noviembre: 10,
      nov: 10,
      december: 11,
      diciembre: 11,
      dec: 11,
      dic: 11,
    }
  
    const normalizedMonth = monthName.toLowerCase()
    return months[normalizedMonth] !== undefined ? months[normalizedMonth] : 0
  }

  function padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`
  }
  