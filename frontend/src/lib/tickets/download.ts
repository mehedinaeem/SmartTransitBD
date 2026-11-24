import type { TicketRecord } from "@/types/booking";
import { formatJourneyDate, formatDepartureTime } from "@/lib/dates";
import { formatFare } from "@/lib/seats";
import { TICKET_STATUS_LABELS } from "./details";
async function loadImage(src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}
function drawWrapped(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = "";
  let lines = 0;
  for (const character of Array.from(text)) {
    if (context.measureText(line + character).width > maxWidth) {
      context.fillText(line, x, y + lines * lineHeight);
      line = character;
      lines++;
    } else line += character;
  }
  context.fillText(line, x, y + lines * lineHeight);
  return y + (lines + 1) * lineHeight;
}
/** Exports a self-contained local PNG; no screenshot or external renderer/service is involved. */
export async function renderTicketPng(
  ticket: TicketRecord,
  qrDataUrl: string,
): Promise<Blob> {
  await document.fonts.ready;
  const qr = await loadImage(qrDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1320;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Ticket export is not supported in this browser.");
  context.font = "600 20px Inter, Arial, sans-serif";
  const nameHeight = drawWrapped(context, ticket.passenger.name, 0, 0, 340, 26);
  const extra = Math.max(0, nameHeight - 60);
  canvas.height = 1320 + extra;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 900, 1320 + extra);
  context.strokeStyle = "#dce3eb";
  context.lineWidth = 2;
  context.strokeRect(30, 30, 840, 1260 + extra);
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    color = "#101828",
    weight = 500,
  ) => {
    context.fillStyle = color;
    context.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    context.fillText(value, x, y);
  };
  text("SmartTransit BD", 65, 103, 31, "#081A2C", 700);
  text(
    TICKET_STATUS_LABELS[ticket.status],
    665,
    101,
    23,
    ticket.status === "CONFIRMED"
      ? "#21844c"
      : ticket.status === "CANCELLED"
        ? "#b33e37"
        : "#667085",
    600,
  );
  context.beginPath();
  context.moveTo(65, 140);
  context.lineTo(835, 140);
  context.stroke();
  text(ticket.vehicleId, 65, 202, 25, "#1473e6", 650);
  text(ticket.tripId, 650, 202, 17, "#8590a0");
  context.font = "600 33px Inter, Arial, sans-serif";
  context.fillStyle = "#101828";
  drawWrapped(context, `${ticket.from} → ${ticket.to}`, 65, 265, 760, 43);
  const field = (label: string, value: string, x: number, y: number) => {
    text(label, x, y, 17, "#8590a0");
    context.fillStyle = "#101828";
    context.font = "600 25px Inter, Arial, sans-serif";
    drawWrapped(context, value, x, y + 40, 340, 30);
  };
  text("Passenger", 65, 350, 17, "#8590a0");
  context.font = "600 20px Inter, Arial, sans-serif";
  context.fillStyle = "#101828";
  drawWrapped(context, ticket.passenger.name, 65, 390, 340, 26);
  field("Seat", ticket.seatId, 480, 350);
  field("Date", formatJourneyDate(ticket.travelDate), 65, 475 + extra);
  field(
    "Departure",
    formatDepartureTime(ticket.departureTime),
    480,
    475 + extra,
  );
  field("Fare", formatFare(ticket.fare), 65, 595 + extra);
  field("Ticket status", TICKET_STATUS_LABELS[ticket.status], 480, 595 + extra);
  context.save();
  context.setLineDash([6, 6]);
  context.beginPath();
  context.moveTo(65, 690 + extra);
  context.lineTo(835, 690 + extra);
  context.stroke();
  context.restore();
  text("Ticket QR code", 65, 744 + extra, 20, "#344054", 600);
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, 300, 767 + extra, 300, 300);
  context.imageSmoothingEnabled = true;
  text("Booking ID", 65, 1130 + extra, 17, "#8590a0");
  text(ticket.bookingId, 65, 1170 + extra, 25, "#101828", 650);
  text("DEMO TICKET · PAYMENT SIMULATED", 65, 1230 + extra, 16, "#667085", 600);
  text(
    "No money was charged. This is not a valid boarding pass.",
    65,
    1260 + extra,
    15,
    "#8590a0",
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Unable to export ticket.")),
      "image/png",
    ),
  );
}
export async function downloadTicket(ticket: TicketRecord, qrDataUrl: string) {
  const blob = await renderTicketPng(ticket, qrDataUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SmartTransit-BD-${ticket.bookingId}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
