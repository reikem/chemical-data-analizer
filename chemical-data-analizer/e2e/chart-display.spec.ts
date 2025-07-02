import { test, expect } from "@playwright/test";
import path from "path";


test("MultiElementSelect pinta BarChart y exporta PNG", async ({ page }) => {
  /* Subimos un CSV usando un helper personalizado */
  await page.goto("/");
  const csv = path.resolve(path.dirname(new URL(import.meta.url).pathname), "fixtures/sample-oil-data.csv");
  await page.getByRole("button", { name: /seleccionar archivo/i }).setInputFiles(csv);
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: /continuar/i }).click();

  /* Ir a pestaña Gráficos/BarChart */
  await page.getByRole("tab", { name: /gráficos/i }).click();
  await page.getByRole("button", { name: /barras/i }).click();

  /* Abrimos el selector y elegimos dos elementos */
  await page.getByRole("combobox", { name: /elegir elementos/i }).click();
  const options = page.getByRole("option");
  await options.nth(0).click();
  await options.nth(1).click();
  await page.keyboard.press("Escape");

  /* La leyenda del BarChart muestra 2 entries  */
  await expect(page.locator(".recharts-legend-item")).toHaveCount(2);

  /* Exportar PNG */
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /exportar png/i }).click(),
  ]);
  expect((await download.path())!.endsWith(".png")).toBeTruthy();
});
