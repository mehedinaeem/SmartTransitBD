import { test, expect } from "@playwright/test";

test("BUS-06 passenger summary, progress, occupancy and booking entry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/app/bus/BUS-06");
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "JKKNIU → Mymensingh", exact: true }),
  ).toBeVisible();
  const summary = page.getByLabel("Bus summary");
  for (const text of ["6 min", "32 km/h", "8", "30 / 40"])
    await expect(summary).toContainText(text);
  await expect(page.getByText("On Route", { exact: true })).toBeVisible();
  const timeline = page.getByRole("list", { name: "Route progress" });
  await expect(timeline.getByRole("heading")).toHaveText([
    "JKKNIU",
    "Trishal",
    "Bhaluka",
    "Mymensingh",
  ]);
  await expect(timeline.getByText("Completed", { exact: true })).toBeVisible();
  await expect(timeline.locator("[aria-current=step]")).toContainText(
    "Trishal",
  );
  await expect(
    timeline.getByText("BUS-06 · Current location", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "30 of 40 seats occupied; 8 seats available; 1 reserved; 1 blocked",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("SmartTransit Demo Fleet", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("a few seconds ago", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Online", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Track Live", exact: true }),
  ).toHaveAttribute("href", "/app/live");
  await expect(
    page.getByRole("link", { name: "View Seats", exact: true }),
  ).toHaveAttribute("href", "/app/seats/TRIP-001");
  await page.getByRole("link", { name: "View Seats", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Choose your seat", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Seat A1, occupied", exact: true }),
  ).toBeDisabled();
  const proceed = page.getByRole("button", { name: "Continue", exact: true });
  await expect(proceed).toBeDisabled();
  await page
    .getByRole("button", { name: "Seat B3, available", exact: true })
    .click();
  await proceed.click();
  await expect(page).toHaveURL(/\/app\/booking\?trip=TRIP-001&seat=B3$/);
  await expect(
    page.getByRole("heading", { name: "Review your journey", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".booking-journey-summary")).toContainText(
    "TRIP-001",
  );
  await expect(page.locator(".booking-journey-summary")).toContainText("B3");
});

test("Bus details loading, retry, dynamic IDs and missing trips", async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mock/vehicles/BUS-06/", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/app/bus/BUS-06");
  await expect(
    page.getByRole("status", { name: "Loading bus details" }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/mock/vehicles/BUS-06/");
  await page.route("**/api/mock/vehicles/BUS-06/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page.goto("/app/bus/BUS-06");
  await expect(page.locator(".empty-state[role=alert]")).toBeVisible();
  await page.unroute("**/api/mock/vehicles/BUS-06/");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  for (const [id, seats, trip] of [
    ["BUS-12", "15", "TRIP-002"],
    ["BUS-19", "5", "TRIP-003"],
  ]) {
    await page.goto(`/app/bus/${id}`);
    await expect(
      page.getByRole("heading", { name: id, exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Bus summary")).toContainText(seats);
    await expect(
      page.getByRole("link", { name: "View Seats", exact: true }),
    ).toHaveAttribute("href", `/app/seats/${trip}`);
  }
  await page.getByRole("link", { name: "Track Live", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Selected bus" })
      .getByRole("heading", { name: "BUS-19", exact: true }),
  ).toBeVisible();
  await page.goto("/app/bus/UNKNOWN");
  await expect(
    page.getByRole("heading", { name: "Bus not found" }),
  ).toBeVisible();
  await page.goto("/app/seats/UNKNOWN");
  await expect(
    page.getByRole("heading", { name: "Trip not found" }),
  ).toBeVisible();
});

test("Bus details retain the latest GPS fix when leaving live tracking", async ({
  page,
}) => {
  await page.goto("/app/live");
  const panel = page.getByRole("region", { name: "Selected bus" });
  await expect(panel).toBeVisible();
  await expect(page.locator(".tracking-age")).toHaveText(/^[01] sec ago$/, {
    timeout: 7000,
  });
  await panel.getByRole("link", { name: "View Bus", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  const position = await page.locator(".bus-location-coordinates").innerText();
  expect(parseFloat(position)).toBeGreaterThan(24.578);
});
