import { test, expect } from "@playwright/test";

test("Passenger home, vehicle details, popular routes and bottom tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Naeem", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Good morning,", { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("Where do you want to go?")).toBeVisible();
  const actions = page.getByRole("navigation", { name: "Quick actions" });
  await expect(actions.getByRole("link")).toHaveCount(4);
  expect((await actions.boundingBox())!.height).toBeLessThan(115);
  const buses = page.getByRole("region", { name: "Nearby Buses" });
  await expect(buses.getByRole("link")).toHaveCount(3);
  for (const [id, route, distance, eta, seats, status] of [
    [
      "BUS-06",
      "JKKNIU → Mymensingh",
      "1.2 km away",
      "ETA 6 min",
      "8 seats available",
      "Approaching",
    ],
    [
      "BUS-12",
      "Trishal → Mymensingh",
      "2.8 km away",
      "ETA 12 min",
      "15 seats available",
      "On Route",
    ],
    [
      "BUS-19",
      "JKKNIU → Netrokona",
      "4.1 km away",
      "ETA 18 min",
      "5 seats available",
      "On Route",
    ],
  ]) {
    const row = buses.getByRole("link", { name: new RegExp(id) });
    for (const text of [route, distance, eta, seats, status])
      await expect(row).toContainText(text);
    await expect(row).toHaveAttribute("href", `/app/bus/${id}`);
  }
  const tabs = page.getByRole("navigation", { name: "Passenger tabs" });
  await expect(
    tabs.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await buses.getByRole("link", { name: /BUS-06/ }).click();
  await expect(page).toHaveURL(/\/app\/bus\/BUS-06$/);
  await expect(
    page.getByRole("heading", { name: "BUS-06", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("8 seats available", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View route", exact: true }).click();
  await expect(page.locator(".route-row")).toHaveCount(1);
  await expect(page.locator(".route-row")).toContainText("JKKNIU");
  await tabs.getByRole("link", { name: "Home", exact: true }).click();
  await page
    .getByRole("region", { name: "Popular Routes" })
    .getByRole("link", { name: "Trishal → Dhaka", exact: true })
    .click();
  await expect(page.locator(".route-row")).toHaveCount(1);
  await expect(page.locator(".route-row")).toContainText("Trishal");
  await expect(
    tabs.getByRole("link", { name: "Routes", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await tabs.getByRole("link", { name: "Tickets", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/tickets$/);
  await expect(
    tabs.getByRole("link", { name: "Tickets", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await tabs.getByRole("link", { name: "Profile", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/profile$/);
  await expect(
    tabs.getByRole("link", { name: "Profile", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/app/bus/UNKNOWN");
  await expect(
    page.getByRole("heading", { name: "Bus not found" }),
  ).toBeVisible();
});

test("Nearby buses loading, empty, failure and retry keep routes available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mock/vehicles/nearby/", async (route) => {
    await gate;
    await route.fulfill({ json: [] });
  });
  await page.goto("/app");
  await expect(
    page.getByRole("status", { name: "Loading nearby buses" }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", { name: "No buses nearby" }),
  ).toBeVisible();
  await expect(page.locator(".popular-route-row")).toHaveCount(3);
  await page.unroute("**/api/mock/vehicles/nearby/");
  await page.route("**/api/mock/vehicles/nearby/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page.goto("/app");
  const buses = page.getByRole("region", { name: "Nearby Buses" });
  await expect(buses.getByRole("alert")).toContainText("Unable to load data");
  await expect(page.locator(".popular-route-row")).toHaveCount(3);
  await page.unroute("**/api/mock/vehicles/nearby/");
  await buses.getByRole("button", { name: "Try again" }).click();
  await expect(buses.getByRole("link")).toHaveCount(3);
});
