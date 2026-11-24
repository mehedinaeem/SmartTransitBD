import type { TicketRecord, TicketStatus } from "@/types/booking";
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
export const TICKET_SECTIONS = [
  { id: "upcoming", label: "Upcoming", status: "CONFIRMED" },
  { id: "completed", label: "Completed", status: "COMPLETED" },
  { id: "cancelled", label: "Cancelled", status: "CANCELLED" },
] as const;
export type TicketSection = (typeof TICKET_SECTIONS)[number]["id"];
export function ticketQrPayload(
  ticket: Pick<TicketRecord, "bookingId" | "tripId" | "seatId" | "vehicleId">,
) {
  return JSON.stringify({
    bookingId: ticket.bookingId,
    tripId: ticket.tripId,
    seatId: ticket.seatId,
    vehicleId: ticket.vehicleId,
  });
}
export function ticketTrackingHref(ticket: Pick<TicketRecord, "vehicleId">) {
  return ticket.vehicleId === "BUS-06"
    ? "/app/live"
    : `/app/live?bus=${encodeURIComponent(ticket.vehicleId)}`;
}
