import { z } from "zod";
import { bookingSelectionSchema, seatIdSchema } from "./seats";
const normalizedPhone = z
  .string()
  .trim()
  .transform((value) =>
    value
      .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
      .replace(/[\s()-]/g, ""),
  );
export const phoneSchema = normalizedPhone
  .refine(
    (value) => /^(?:\+?88)?01[3-9]\d{8}$/.test(value),
    "Enter a valid Bangladeshi mobile number.",
  )
  .transform((value) =>
    value.startsWith("+")
      ? value
      : value.startsWith("88")
        ? `+${value}`
        : `+88${value}`,
  );
export const paymentMethodSchema = z.enum(["bkash", "nagad", "card", "cash"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export const passengerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use 80 characters or fewer."),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(254, "Use a shorter email address.")
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      "Enter a valid email address or leave this blank.",
    )
    .optional()
    .transform((value) => value || undefined),
});
export const checkoutFormSchema = passengerSchema.extend({
  paymentMethod: paymentMethodSchema,
});
export type CheckoutForm = z.input<typeof checkoutFormSchema>;
export const createBookingSchema = z.object({
  tripId: bookingSelectionSchema.shape.trip,
  seatId: seatIdSchema,
  passenger: passengerSchema,
  paymentMethod: paymentMethodSchema,
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export const confirmedBookingSchema = z.object({
  bookingId: z.string().regex(/^STB-2026-\d{5}$/),
  status: z.literal("CONFIRMED"),
  tripId: z.string(),
  vehicleId: z.string(),
  from: z.string(),
  to: z.string(),
  travelDate: z.iso.date(),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  seatId: seatIdSchema,
  fare: z.number().int().nonnegative(),
  currency: z.literal("BDT"),
  passenger: passengerSchema,
  paymentMethod: paymentMethodSchema,
  paymentStatus: z.literal("SIMULATED"),
  paymentReference: z.string(),
  isDemo: z.literal(true),
  createdAt: z.iso.datetime(),
});
export type ConfirmedBooking = z.infer<typeof confirmedBookingSchema>;
export const ticketSchema = confirmedBookingSchema.extend({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"]),
});
export type TicketRecord = z.infer<typeof ticketSchema>;
export type TicketStatus = TicketRecord["status"];
