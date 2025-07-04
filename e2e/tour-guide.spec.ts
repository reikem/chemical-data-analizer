import { test, expect } from "@playwright/test";

test("Tour guiado recorre pasos disponibles y finaliza", async ({ page }) => {
  await page.goto("/");
  /* Descartamos el Welcome modal si aparece */
  const modal = page.getByRole("dialog");
  if (await modal.isVisible()) {
    await modal.getByRole("button", { name: /no, gracias/i }).click();
  }

  /* Botón flotante */
  await page.getByRole("button", { name: /iniciar recorrido guiado/i }).click();

  // Paso 1
  await expect(page.getByText(/carga de archivos/i)).toBeVisible();
  await page.getByRole("button", { name: /siguiente/i }).click();
  // … puedes hacer un loop genérico, aquí sólo probamos final
  await page.getByRole("button", { name: /finalizar/i }).click();

  /* Overlay desaparece */
  await expect(page.locator(".tour-highlight")).toHaveCount(0);
});
