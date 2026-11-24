import QRCode from "qrcode";
import type { TicketRecord } from "@/types/booking";
import { ticketQrPayload } from "./details";
/** Entirely local generation: no URL, passenger name, or contact information is encoded. */
export function createTicketQr(ticket: TicketRecord): Promise<string> {
  return QRCode.toDataURL(ticketQrPayload(ticket), {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 320,
    color: { dark: "#081A2C", light: "#FFFFFF" },
  });
}
