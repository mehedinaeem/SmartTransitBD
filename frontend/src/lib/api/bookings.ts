import { bookingSchema } from "@/types/transit";
import { getResource, listSchema } from "./client";
export const bookingsApi = {
  list: (signal?: AbortSignal) =>
    getResource("bookings/", listSchema(bookingSchema), signal),
};
