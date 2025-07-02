import { test, expect } from "@playwright/test";
import path from "node:path";

test("sube CSV ➜ pasa ColumnSelector ➜ muestra resumen", async ({ page }) => {
  await page.goto("/");

  /* 1. Cargar archivo */
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const filePath = path.resolve(__dirname, "fixtures/Muestras_con_Modelo_de_Equipo.csv");
  await page.getByRole("button", { name: /seleccionar archivo/i }).setInputFiles(filePath);

  /* 2. ColumnSelector visible */
  await expect(page.getByText(/configuración de columnas/i)).toBeVisible();

  /* 3. Seleccionar primera casilla de fecha y formato por defecto */
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: /continuar/i }).click();

  /* 4. Se renderiza la sección de resultados */
  await expect(page.getByRole("heading", { name: /resultados del análisis/i })).toBeVisible();

  /* 5. Tarjeta “Total de muestras” refleja las filas del CSV */
  const sampleCount = await page.locator("#summary-cards").getByText(/\d+$/).first().innerText();
  expect(Number(sampleCount)).toBeGreaterThan(0);
});
