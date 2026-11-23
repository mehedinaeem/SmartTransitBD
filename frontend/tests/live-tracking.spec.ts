import { test, expect } from "@playwright/test";

test("Tracking map, bus selection, controls, panel and detail navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/app/live");
  const panel = page.getByRole("region", { name: "Selected bus" });
  await expect(page.locator(".tracking-bus-pin")).toHaveCount(3);
  await expect(
    page.getByText("You · demo location", { exact: true }),
  ).toBeAttached();
  await expect(
    page.getByText("Destination · Mymensingh", { exact: true }),
  ).toBeAttached();
  await expect(
    panel.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  for (const text of [
    "JKKNIU → Mymensingh",
    "6 min",
    "3.2 km",
    "32 km/h",
    "Available Seats",
    "Trishal",
    "Last Updated",
    "Live",
  ])
    await expect(panel).toContainText(text);
  await expect(
    page.getByRole("button", { name: "Select BUS-06", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const canvas = page.locator(".tracking-map-canvas");
  const initial = Number(await canvas.getAttribute("data-zoom"));
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-zoom", String(initial + 1));
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-zoom", String(initial));
  const follow = page.getByRole("button", { name: "Follow selected bus" });
  await follow.click();
  await expect(follow).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Recenter on passenger" }).click();
  await expect(follow).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Show entire route" }).click();
  await page
    .getByRole("button", { name: "Select BUS-12", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "BUS-12", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "Select a bus", exact: true })
    .getByRole("button", { name: "BUS-19", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "BUS-19", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Destination · Netrokona", { exact: true }),
  ).toBeAttached();
  await page.getByRole("button", { name: "Deselect bus" }).click();
  await expect(panel).toHaveCount(0);
  await expect(follow).toBeDisabled();
  await page
    .getByRole("group", { name: "Select a bus", exact: true })
    .getByRole("button", { name: "BUS-06", exact: true })
    .click();
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: "View Bus", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/bus\/BUS-06$/);
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
});

test("GPS markers interpolate through multiple positions between samples", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/app/live");
  const follow = page.getByRole("button", { name: "Follow selected bus" });
  await expect(page.locator(".tracking-bus-pin")).toHaveCount(3);
  await follow.click();
  await expect(page.locator(".tracking-map-canvas")).toHaveAttribute(
    "data-zoom",
    "14",
  );
  await follow.click();
  for (const zoom of [15, 16, 17]) {
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect(page.locator(".tracking-map-canvas")).toHaveAttribute(
      "data-zoom",
      String(zoom),
    );
  }
  const positions = new Set<string>();
  const bus = page.getByRole("button", { name: "Select BUS-06", exact: true });
  await expect(async () => {
    positions.add(
      await bus.evaluate((button) => {
        const style = button.parentElement!.style;
        return `${style.left} ${style.top} ${style.transform}`;
      }),
    );
    expect(positions.size).toBeGreaterThan(4);
  }).toPass({ timeout: 9000, intervals: [100] });
});

test("Tracking snapshot errors can be retried and tile errors retain the route", async ({
  page,
}) => {
  await page.route("**/api/mock/tracking/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page.goto("/app/live");
  await expect(page.locator(".empty-state[role=alert]")).toContainText(
    "Unable to load data",
  );
  await page.unroute("**/api/mock/tracking/");
  await page.route("**://*.tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".tracking-bus-pin")).toHaveCount(3);
  await expect(
    page.getByText("Map tiles unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Selected bus" }),
  ).toBeVisible();
});

test("Short mobile viewport keeps controls, selected panel and navigation separate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/app/live");
  const panel = page.getByRole("region", { name: "Selected bus" });
  await expect(panel).toBeVisible();
  const controls = await page
    .getByRole("group", { name: "Map controls" })
    .boundingBox();
  const bounds = await panel.boundingBox();
  const tabs = await page
    .getByRole("navigation", { name: "Passenger tabs" })
    .boundingBox();
  expect(controls!.y + controls!.height).toBeLessThan(bounds!.y);
  expect(bounds!.y + bounds!.height).toBeLessThan(tabs!.y);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
});

test("Stale GPS is marked delayed until a fresh simulated sample arrives", async ({
  page,
}) => {
  const { createTrackingSnapshot } = await import("../src/mocks/tracking");
  await page.route("**/api/mock/tracking/", (route) =>
    route.fulfill({ json: createTrackingSnapshot(Date.now() - 60000) }),
  );
  await page.goto("/app/live");
  const panel = page.getByRole("region", { name: "Selected bus" });
  await expect(panel.locator(".tracking-connection")).toContainText("Delayed");
  await expect(panel.locator(".tracking-connection")).toContainText("Live", {
    timeout: 6000,
  });
});
