import { z } from "zod";
export const seatIdSchema = z.string().regex(/^[A-J][1-4]$/);
export const seatAvailabilitySchema = z.enum([
  "AVAILABLE",
  "RESERVED",
  "OCCUPIED",
  "BLOCKED",
]);
export const seatStateSchema = z.enum([
  "AVAILABLE",
  "RESERVED",
  "OCCUPIED",
  "SELECTED",
  "BLOCKED",
]);
export const seatSchema = z
  .object({
    id: seatIdSchema,
    row: z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]),
    column: z.number().int().min(1).max(4),
    status: seatAvailabilitySchema,
  })
  .refine((seat) => seat.id === `${seat.row}${seat.column}`, {
    message: "Seat ID must match row and column",
  });
export type Seat = z.infer<typeof seatSchema>;
export type SeatState = z.infer<typeof seatStateSchema>;
export const bookingSelectionSchema = z.object({
  trip: z.string().regex(/^TRIP-\d{3}$/),
  seat: seatIdSchema,
});
