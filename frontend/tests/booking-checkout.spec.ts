import { test, expect } from "@playwright/test";
import { createSeatPreview } from "../src/mocks/bus-details";
import { checkoutFormSchema } from "../src/types/booking";

test("Zod normalizes Bangladesh phones and accepts an omitted email", () => {
  const result = checkoutFormSchema.safeParse({
    name: " Naeem ",
    phone: "০১৭১২৩৪৫৬৭৮",
    email: "",
    paymentMethod: "bkash",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.phone).toBe("+8801712345678");
    expect(result.data.name).toBe("Naeem");
    expect(result.data.email).toBeUndefined();
  }
  expect(
    checkoutFormSchema.safeParse({
      name: " ",
      phone: "123",
      email: "bad@",
      paymentMethod: "card",
    }).success,
  ).toBe(false);
});

test("Checkout displays trip details and professional inline validation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/app/booking?trip=TRIP-001&seat=B3");
  const summary = page.getByRole("region", { name: "Trip summary" });
  for (const value of [
    "BUS-06",
    "JKKNIU",
    "Mymensingh",
    "Today",
    "8:30 AM",
    "B3",
    "৳40",
  ])
    await expect(summary).toContainText(value);
  await expect(
    page.getByRole("textbox", { name: "Name", exact: false }),
  ).toHaveValue("Naeem");
  await expect(page.getByRole("radio")).toHaveCount(4);
  for (const method of ["bKash", "Nagad", "Card", "Cash"])
    await expect(
      page.getByRole("radio", { name: new RegExp(method) }),
    ).toBeVisible();
  await page.getByLabel("Name", { exact: false }).fill(" ");
  await page.getByLabel("Phone", { exact: false }).fill("123");
  await page.getByLabel("Email", { exact: false }).fill("bad@");
  await page
    .getByRole("button", { name: "Confirm Booking", exact: true })
    .click();
  await expect(
    page.getByText("Enter your full name.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter a valid Bangladeshi mobile number.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter a valid email address or leave this blank.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Name", { exact: false })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page).toHaveURL(/\/app\/booking\?/);
});

for (const method of ["bKash", "Nagad", "Card", "Cash"]) {
  test(`${method} simulates payment, confirms exactly once and retains the ticket on reload`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("/app/booking?trip=TRIP-001&seat=B3");
    await page
      .getByLabel("Phone", { exact: false })
      .fill(method === "Nagad" ? "০১৭১২৩৪৫৬৭৮" : "01712 345678");
    if (method === "bKash")
      await page
        .getByLabel("Email", { exact: false })
        .fill("naeem@example.com");
    await page.getByRole("radio", { name: new RegExp(method) }).check();
    const confirm = page.getByRole("button", {
      name: "Confirm Booking",
      exact: true,
    });
    await confirm.evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
    await expect(
      page.getByRole("button", { name: "Confirming booking…", exact: true }),
    ).toBeDisabled();
    await expect(page).toHaveURL(/\/app\/tickets\/STB-2026-00183$/);
    await expect(
      page.getByRole("heading", { name: "Your ticket", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("STB-2026-00183", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Confirmed", { exact: true })).toBeVisible();
    await expect(page.locator(".ticket-details")).toContainText("B3");
    await expect(page.locator(".ticket-details")).toContainText(method);
    await expect(
      page.getByText("Demo booking confirmed", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "No money was charged. This is not a valid boarding pass.",
        { exact: true },
      ),
    ).toBeVisible();
    expect(posts).toEqual([]);
    expect(
      await page.evaluate(
        () =>
          JSON.parse(
            sessionStorage.getItem("smarttransit.demo-bookings.v1") ?? "[]",
          ).length,
      ),
    ).toBe(1);
    if (method === "bKash")
      await page.screenshot({ path: "artifacts/booking-confirmed-375.png" });
    await page.reload();
    await expect(
      page.getByText("STB-2026-00183", { exact: true }),
    ).toBeVisible();
    await page.goto("/app/tickets");
    await expect(
      page
        .locator(".passenger-ticket-row")
        .filter({ hasText: "STB-2026-00183" }),
    ).toHaveCount(1);
    await expect(
      page
        .locator(".passenger-ticket-row")
        .filter({ hasText: "STB-2026-00183" }),
    ).toContainText("STB-2026-00183");
  });
}

test("Seat is revalidated before confirmation, and a failed request can be retried", async ({
  page,
}) => {
  await page.goto("/app/booking?trip=TRIP-001&seat=B3");
  await page.getByLabel("Phone", { exact: false }).fill("01712345678");
  await page.route("**/api/mock/trips/TRIP-001/", (route) =>
    route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
  );
  await page
    .getByRole("button", { name: "Confirm Booking", exact: true })
    .click();
  await expect(page.locator(".checkout-submit-error")).toContainText(
    "We couldn’t confirm your booking",
  );
  await expect(page.getByLabel("Phone", { exact: false })).toHaveValue(
    "01712345678",
  );
  await page.unroute("**/api/mock/trips/TRIP-001/");
  const changed = createSeatPreview("TRIP-001")!;
  changed.seats.find((seat) => seat.id === "B3")!.status = "RESERVED";
  await page.route("**/api/mock/trips/TRIP-001/", (route) =>
    route.fulfill({ json: changed }),
  );
  await page
    .getByRole("button", { name: "Confirm Booking", exact: true })
    .click();
  await expect(page.locator(".checkout-submit-error")).toContainText(
    "This seat is no longer available",
  );
  await expect(page).toHaveURL(/\/app\/booking\?/);
  await page.unroute("**/api/mock/trips/TRIP-001/");
  await page
    .getByRole("button", { name: "Confirm Booking", exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/tickets\/STB-2026-00183$/);
});

test("An unknown ticket has a useful empty state", async ({ page }) => {
  await page.goto("/app/tickets/STB-2026-00999");
  await expect(
    page.getByRole("heading", { name: "Ticket not found" }),
  ).toBeVisible();
});
