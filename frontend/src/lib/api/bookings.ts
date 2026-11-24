import { z } from "zod";
import { bookingSchema } from "@/types/transit";
import { confirmedBookingSchema, ticketSchema } from "@/types/booking";
import { createMockBookingService } from "@/mocks/bookings";
import type { BookingService } from "@/lib/booking-service";
import { getResource, listSchema, apiMode, postResource } from "./client";
const mock = createMockBookingService();
export const bookingsApi: BookingService & {
  list: (signal?: AbortSignal) => Promise<z.infer<typeof bookingSchema>[]>;
} = {
  create: (input, options) =>
    apiMode === "mock"
      ? mock.create(input, options)
      : postResource("bookings/", confirmedBookingSchema, input, options),
  get: (id) =>
    apiMode === "mock"
      ? mock.get(id)
      : getResource(`bookings/${encodeURIComponent(id)}/`, ticketSchema),
  tickets: () =>
    apiMode === "mock"
      ? mock.tickets()
      : getResource("bookings/", listSchema(ticketSchema)),
  confirmed: () =>
    apiMode === "mock"
      ? mock.confirmed()
      : getResource("bookings/", listSchema(confirmedBookingSchema)),
  list: (signal) => getResource("bookings/", listSchema(bookingSchema), signal),
};
