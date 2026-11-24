import type { Seat, SeatState } from "@/types/seats";
export const SEAT_LABELS: Record<SeatState, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  OCCUPIED: "Occupied",
  SELECTED: "Selected",
  BLOCKED: "Blocked",
};
export const SEAT_STATES: SeatState[] = [
  "AVAILABLE",
  "RESERVED",
  "OCCUPIED",
  "SELECTED",
  "BLOCKED",
];
export function countSeats(seats: readonly Seat[]) {
  return seats.reduce(
    (counts, seat) => {
      counts[seat.status]++;
      return counts;
    },
    { AVAILABLE: 0, RESERVED: 0, OCCUPIED: 0, BLOCKED: 0 },
  );
}
export function getAvailableSeat(seats: readonly Seat[], id: string | null) {
  return seats.find((seat) => seat.id === id && seat.status === "AVAILABLE");
}
export function formatFare(fare: number) {
  return `৳${fare.toLocaleString("en-BD")}`;
}
