import type { PaymentMethod } from "@/types/booking";
export type PaymentRequest = {
  method: PaymentMethod;
  amount: number;
  currency: "BDT";
  idempotencyKey: string;
};
export type PaymentResult =
  | { status: "SIMULATED"; reference: string }
  | { status: "PENDING"; reference: string; redirectUrl?: string }
  | { status: "COMPLETED"; reference: string };
/** Payment credentials and actual provider authorization belong to a future server integration. */
export interface PaymentAdapter {
  prepare: (request: PaymentRequest) => Promise<PaymentResult>;
}
