import { test, expect } from "@playwright/test";
import path from "node:path";

test("DataTable oculta/mostrar columna y pagina correctamente", async ({ page }) => {
  /* Carga rápida */
  await page.goto("/");
  await page.getByRole("button", { name: /seleccionar archivo/i })
    .setInputFiles(path.resolve(path.dirname(new URL(import.meta.url).pathname), "fixtures/sample-oil-data.csv"));
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: /continuar/i }).click();
  await page.getByRole("tab", { name: /tabla de datos/i }).click();

  /* Abrir popover Columnas y ocultar “Modelo” */
  await page.getByRole("button", { name: /^columnas$/i }).click();
  const modeloChk = page.getByLabel(/modelo/i);
  const wasChecked = await modeloChk.isChecked();
  if (wasChecked) await modeloChk.uncheck();
  await page.keyboard.press("Escape");

  /* Encabezado “Modelo” ya no aparece */
  await expect(page.locator("th", { hasText: "Modelo" })).toHaveCount(wasChecked ? 0 : 1);

  /* Cambiar a 5 filas/página y pasar a página siguiente */
  await page.selectOption("select", "5");
  await page.getByRole("button", { name: /chevron-right/i }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
});
