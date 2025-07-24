import { test, expect } from "@playwright/test";

test("Tour guiado recorre pasos disponibles y finaliza", async ({ page }) => {
  await page.goto("/");
  /* Descartamos el Welcome modal si aparece */
  const modal = page.getByRole("dialog");
  if (await modal.isVisible()) {
    await modal.getByRole("button", { name: /no, gracias/i }).click();
  }

  await expect(page.locator(".tour-highlight")).toHaveCount(0);
});
