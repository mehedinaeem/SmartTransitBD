import type {
  ConfirmedBooking,
  CreateBookingInput,
  TicketRecord,
} from "@/types/booking";
export interface BookingService {
  create: (
    input: CreateBookingInput,
    options: { idempotencyKey: string },
  ) => Promise<ConfirmedBooking>;
  get: (id: string) => Promise<TicketRecord | null>;
  confirmed: () => Promise<ConfirmedBooking[]>;
  tickets: () => Promise<TicketRecord[]>;
}
