import type { ChemicalData } from "../providers/type/data-types"


/**
 * Genera sentencias SQL INSERT para los datos químicos
 * @param data Datos químicos a exportar
 * @param tableName Nombre de la tabla SQL (por defecto: chemical_data)
 * @returns Cadena con las sentencias SQL
 */
export function generateSQLExport(data: ChemicalData, tableName = "chemical_data"): string {
  if (!data || !data.samples || data.samples.length === 0) {
    return "-- No hay datos para exportar"
  }

  const sqlStatements: string[] = []

  // Crear tabla para los elementos
  sqlStatements.push(`-- Tabla de elementos químicos
CREATE TABLE IF NOT EXISTS ${tableName}_elements (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT
);

-- Limpiar datos existentes
DELETE FROM ${tableName}_elements;

-- Insertar elementos`)

  // Insertar elementos
  data.elements.forEach((element, index) => {
    sqlStatements.push(
      `INSERT INTO ${tableName}_elements (id, name, unit) VALUES (${index + 1}, '${escapeSQL(
        element.name,
      )}', '${escapeSQL(element.unit || "")}');`,
    )
  })

  // Crear tabla para las muestras
  sqlStatements.push(`
-- Tabla de muestras
CREATE TABLE IF NOT EXISTS ${tableName}_samples (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  machine TEXT,
  unit TEXT,
  component TEXT,
  zone TEXT,
  country TEXT,
  model TEXT
);

-- Limpiar datos existentes
DELETE FROM ${tableName}_samples;

-- Insertar muestras`)

  // Insertar muestras
  data.samples.forEach((sample, index) => {
    sqlStatements.push(
      `INSERT INTO ${tableName}_samples (id, date, machine, unit, component, zone, country, model) VALUES (${
        index + 1
      }, '${escapeSQL(sample.date)}', '${escapeSQL(sample.machine || "")}', '${escapeSQL(
        sample.unit || "",
      )}', '${escapeSQL(sample.component || "")}', '${escapeSQL(sample.zone || "")}', '${escapeSQL(
        sample.country || "",
      )}', '${escapeSQL(sample.model || "")}');`,
    )
  })

  // Crear tabla para los valores
  sqlStatements.push(`
-- Tabla de valores
CREATE TABLE IF NOT EXISTS ${tableName}_values (
  sample_id INTEGER,
  element_id INTEGER,
  value REAL,
  PRIMARY KEY (sample_id, element_id),
  FOREIGN KEY (sample_id) REFERENCES ${tableName}_samples(id),
  FOREIGN KEY (element_id) REFERENCES ${tableName}_elements(id)
);

-- Limpiar datos existentes
DELETE FROM ${tableName}_values;

-- Insertar valores`)

  // Insertar valores
  data.samples.forEach((sample, sampleIndex) => {
    sample.values.forEach((value, elementIndex) => {
      if (elementIndex < data.elements.length) {
        sqlStatements.push(
          `INSERT INTO ${tableName}_values (sample_id, element_id, value) VALUES (${sampleIndex + 1}, ${
            elementIndex + 1
          }, ${value});`,
        )
      }
    })
  })

  // Crear vistas para facilitar consultas
  sqlStatements.push(`
-- Vista para facilitar consultas
CREATE VIEW IF NOT EXISTS ${tableName}_view AS
SELECT 
  s.id AS sample_id,
  s.date,
  s.machine,
  s.unit,
  s.component,
  s.zone,
  s.country,
  s.model,
  e.id AS element_id,
  e.name AS element_name,
  e.unit AS element_unit,
  v.value
FROM 
  ${tableName}_samples s
JOIN 
  ${tableName}_values v ON s.id = v.sample_id
JOIN 
  ${tableName}_elements e ON v.element_id = e.id;

-- Ejemplo de consulta:
-- SELECT * FROM ${tableName}_view WHERE element_name = 'Fe' ORDER BY date;
`)

  return sqlStatements.join("\n")
}

/**
 * Escapa caracteres especiales en cadenas SQL
 */
function escapeSQL(str: string): string {
  if (!str) return ""
  return str.replace(/'/g, "''")
}

/**
 * Descarga el contenido SQL como un archivo
 */
export function downloadSQL(sql: string, filename = "chemical_data_export.sql"): void {
  const blob = new Blob([sql], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
