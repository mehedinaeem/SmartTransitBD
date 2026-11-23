import { test, expect } from "@playwright/test";
const routes = [
  "/operator",
  "/operator/fleet",
  "/operator/vehicles",
  "/operator/routes",
  "/operator/bookings",
  "/operator/occupancy",
  "/operator/analytics",
  "/operator/alerts",
  "/operator/settings",
  "/app",
  "/app/live",
  "/app/routes",
  "/app/tickets",
  "/app/profile",
];
for (const width of [375, 768, 1440]) {
  test(`All routes and layouts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      if (
        [
          "/operator",
          "/operator/fleet",
          "/operator/vehicles",
          "/app/live",
        ].includes(route)
      )
        await expect(
          page
            .getByText("ST-101", { exact: true })
            .first()
            .or(page.locator(".bus-marker").first())
            .first(),
        ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `Page overflow on ${route} at ${width}`,
      ).toBe(true);
      if (route === "/operator" || route === "/app") {
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("main > div")).toHaveCSS("opacity", "1");
        if (route === "/operator") {
          await expect(page.locator(".bus-marker")).toHaveCount(5);
          await page
            .locator(".leaflet-tile-loaded")
            .first()
            .waitFor({ timeout: 10000 })
            .catch(() => {});
        }
        await page.screenshot({
          path: `artifacts/${route === "/operator" ? "operator" : "passenger"}-${width}.png`,
          fullPage: false,
        });
      }
    }
    expect(errors).toEqual([]);
    if (width < 1024) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(page.getByRole("navigation")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("navigation")).toBeHidden();
    }
  });
}
test("Fleet filters, details, journey, preferences and error recovery", async ({
  page,
}) => {
  await page.goto("/operator/vehicles");
  const search = page.getByRole("textbox", { name: "Search vehicles" });
  await search.fill("ST-104");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Offline");
  await page.getByRole("button", { name: "View ST-104 details" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await search.fill("");
  await page.getByLabel("Filter by status").selectOption("Moving");
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await search.fill("No such bus");
  await expect(page.getByText("No vehicles match your search.")).toBeVisible();
  await page.goto("/app");
  await page.getByLabel("From", { exact: true }).fill("Uttara");
  await page.getByLabel("To", { exact: true }).fill("Motijheel");
  await page.getByRole("button", { name: "Explore routes" }).click();
  await expect(page.locator(".route-row")).toHaveCount(1);
  await expect(page.locator(".route-row")).toContainText("Airport corridor");
  await page.getByRole("button", { name: "Clear journey" }).click();
  await expect(page.locator(".route-row")).toHaveCount(3);
  await page.goto("/operator/settings");
  await page.getByLabel("Display name").fill("Test fleet");
  await page.getByRole("button", { name: "Save preview preferences" }).click();
  await expect(
    page.getByText("Preview preferences saved for this session"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vehicles", exact: true }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("Test fleet");
  await page.route("**/api/mock/vehicles", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/operator/vehicles");
  await expect(page.locator(".empty-state[role=alert]")).toContainText(
    "Unable to load data",
  );
  await page.unroute("**/api/mock/vehicles");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
});
