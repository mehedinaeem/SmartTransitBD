import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PNG } from "pngjs";
import jsQR from "jsqr";
function decode(buffer: Buffer) {
  const png = PNG.sync.read(buffer);
  return JSON.parse(
    jsQR(new Uint8ClampedArray(png.data), png.width, png.height)!.data,
  );
}
const payload = {
  bookingId: "STB-2026-00183",
  tripId: "TRIP-001",
  seatId: "B3",
  vehicleId: "BUS-06",
};
test("Ticket QR and downloaded PNG are scannable", async ({
  page,
}, testInfo) => {
  await page.goto("/app/tickets/STB-2026-00183");
  const image = page.getByAltText("QR code for booking STB-2026-00183");
  await expect(image).toBeVisible();
  for (const value of [
    "SmartTransit BD",
    "Confirmed",
    "BUS-06",
    "JKKNIU",
    "Mymensingh",
    "Naeem",
    "B3",
    "8:30 AM",
    "৳40",
  ])
    await expect(page.locator(".digital-ticket")).toContainText(value);
  const src = await image.getAttribute("src");
  expect(src).toMatch(/^data:image\/png;base64,/);
  expect(decode(Buffer.from(src!.split(",")[1], "base64"))).toEqual(payload);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download Ticket", exact: true })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe(
    "SmartTransit-BD-STB-2026-00183.png",
  );
  const path = testInfo.outputPath("ticket.png");
  await download.saveAs(path);
  expect(decode(await readFile(path))).toEqual(payload);
  await download.saveAs("artifacts/ticket-download.png");
  await expect(
    page.getByRole("link", { name: "Track Bus", exact: true }),
  ).toHaveAttribute("href", "/app/live");
});
test("Ticket sections support keyboard navigation and relevant bus links", async ({
  page,
}) => {
  await page.goto("/app/tickets");
  await expect(page.getByRole("tabpanel")).toContainText("STB-2026-00183");
  await expect(
    page.getByRole("tabpanel").locator(".passenger-ticket-row"),
  ).toHaveCount(2);
  await page.getByRole("tab", { name: /Upcoming/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Completed/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("tabpanel").locator(".passenger-ticket-row"),
  ).toHaveCount(2);
  await page
    .getByRole("tabpanel")
    .getByRole("link")
    .filter({ hasText: "STB-2026-00142" })
    .click();
  await expect(page.locator(".digital-ticket")).toContainText("Completed");
  await expect(
    page.getByRole("link", { name: "Track Bus", exact: true }),
  ).toHaveAttribute("href", "/app/live?bus=BUS-19");
  await page.goto("/app/tickets");
  await page.getByRole("tab", { name: /Upcoming/ }).focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tabpanel").locator(".passenger-ticket-row"),
  ).toHaveCount(1);
  await page.getByRole("tabpanel").getByRole("link").click();
  await expect(page.locator(".digital-ticket")).toContainText("Cancelled");
});
