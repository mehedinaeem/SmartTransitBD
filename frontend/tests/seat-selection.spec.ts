import { test, expect } from "@playwright/test";

test("40 seats, all five states, immediate selection and exact booking navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/app/seats/TRIP-001");
  const map = page.getByRole("group", { name: "40-seat bus layout" });
  await expect(map.getByRole("button")).toHaveCount(40);
  await expect(map.getByRole("group")).toHaveCount(10);
  await expect(page.getByText("Driver", { exact: true })).toBeVisible();
  for (const [id, state] of [
    ["A1", "occupied"],
    ["A2", "occupied"],
    ["A4", "reserved"],
    ["B2", "occupied"],
    ["B4", "blocked"],
  ])
    await expect(
      map.getByRole("button", { name: `Seat ${id}, ${state}`, exact: true }),
    ).toBeDisabled();
  for (const id of ["A3", "B1", "B3"])
    await expect(
      map.getByRole("button", { name: `Seat ${id}, available`, exact: true }),
    ).toBeEnabled();
  const legend = page.getByRole("list", { name: "Seat status legend" });
  await expect(legend.getByRole("listitem")).toHaveText([
    "Available",
    "Reserved",
    "Occupied",
    "Selected",
    "Blocked",
  ]);
  const legendBounds = await legend.boundingBox();
  const mapBounds = await map.boundingBox();
  expect(legendBounds!.y + legendBounds!.height).toBeLessThan(mapBounds!.y);
  const bar = page.getByRole("region", { name: "Booking summary" });
  const proceed = bar.getByRole("button", { name: "Continue", exact: true });
  await expect(proceed).toBeDisabled();
  await expect(bar).toContainText("৳40");
  await map
    .getByRole("button", { name: "Seat B3, available", exact: true })
    .click();
  await expect(
    map.getByRole("button", { name: "Seat B3, selected", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(bar).toContainText("B3");
  await expect(proceed).toBeEnabled();
  await map
    .getByRole("button", { name: "Seat A3, available", exact: true })
    .click();
  await expect(
    map.getByRole("button", { name: "Seat B3, available", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(bar).toContainText("A3");
  await map
    .getByRole("button", { name: "Seat A3, selected", exact: true })
    .click();
  await expect(proceed).toBeDisabled();
  const b3 = map.getByRole("button", {
    name: "Seat B3, available",
    exact: true,
  });
  await b3.focus();
  await page.keyboard.press("Space");
  await expect(bar).toContainText("B3");
  await page.screenshot({ path: "artifacts/seats-selected-375.png" });
  await proceed.click();
  await expect(page).toHaveURL(/\/app\/booking\?trip=TRIP-001&seat=B3$/);
  await expect(
    page.getByRole("heading", { name: "Review your journey", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".booking-journey-summary")).toContainText("B3");
  await expect(page.locator(".booking-journey-summary")).toContainText("৳40");
  await page.getByRole("link", { name: "Change seat", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Seat B3, selected", exact: true }),
  ).toBeVisible();
});

test("Unavailable or malformed seat URLs cannot bypass selection", async ({
  page,
}) => {
  for (const seat of ["A1", "A4", "B4"]) {
    await page.goto(`/app/booking?trip=TRIP-001&seat=${seat}`);
    await expect(
      page.getByRole("heading", { name: "This seat is not available" }),
    ).toBeVisible();
  }
  await page.goto("/app/booking?trip=TRIP-001&seat=Z99");
  await expect(
    page.getByRole("heading", { name: "Choose a seat first" }),
  ).toBeVisible();
  await page.goto("/app/seats/TRIP-001?seat=A4");
  await expect(
    page
      .getByRole("region", { name: "Booking summary" })
      .getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await page.goto("/app/booking?trip=TRIP-002&seat=B3");
  await expect(page.locator(".booking-journey-summary")).toContainText(
    "BUS-12",
  );
  await expect(page.locator(".booking-journey-summary")).toContainText(
    "TRIP-002",
  );
});

test("Seat loading, request failure and retry", async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mock/trips/TRIP-001/", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/app/seats/TRIP-001");
  await expect(
    page.getByRole("status", { name: "Loading seats" }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("group", { name: "40-seat bus layout" }),
  ).toBeVisible();
  await page.unroute("**/api/mock/trips/TRIP-001/");
  await page.route("**/api/mock/trips/TRIP-001/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page.goto("/app/seats/TRIP-001");
  await expect(page.locator(".empty-state[role=alert]")).toBeVisible();
  await page.unroute("**/api/mock/trips/TRIP-001/");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("group", { name: "40-seat bus layout" }).getByRole("button"),
  ).toHaveCount(40);
});
