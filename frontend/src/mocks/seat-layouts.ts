import type { Seat } from "@/types/seats";
const rows: Seat["row"][] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
// First two rows of TRIP-001 match the requested fixture. All trips retain a 2+2 aisle.
const availableOrder = [
  "A3",
  "B1",
  "B3",
  "C4",
  "E2",
  "G1",
  "H3",
  "I4",
  "A1",
  "B2",
  "C1",
  "D3",
  "F2",
  "H1",
  "J4",
];
export function createMockSeatLayout(availableCount: number): Seat[] {
  const available = new Set(availableOrder.slice(0, availableCount));
  return rows.flatMap((row) =>
    [1, 2, 3, 4].map((column) => {
      const id = `${row}${column}`;
      return {
        id,
        row,
        column,
        status: available.has(id)
          ? "AVAILABLE"
          : id === "A4"
            ? "RESERVED"
            : id === "B4"
              ? "BLOCKED"
              : "OCCUPIED",
      } as Seat;
    }),
  );
}
