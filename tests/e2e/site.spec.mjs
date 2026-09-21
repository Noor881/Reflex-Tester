import { test, expect } from "@playwright/test";

test("homepage and primary navigation render", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Measure first",
  );
  await expect(page.locator(".home-photo img")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("aim game starts with custom targets", async ({ page }) => {
  await page.goto("/tools/gridshot-arena.html");
  await page.getByRole("button", { name: "Start session" }).click();
  await expect(page.locator(".aim-target")).toHaveCount(3);
});

test("article and affiliate semantics are present", async ({ page }) => {
  await page.goto("/blog/catsan-hygiene-plus-cat-litter-review.html");
  await expect(page.locator("article")).toBeVisible();
  await expect(page.getByText("Affiliate disclosure:")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Amazon UK listing/ }),
  ).toHaveAttribute("rel", /sponsored/);
});
