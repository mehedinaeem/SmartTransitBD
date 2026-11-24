import type { PaymentAdapter } from "@/lib/payments/types";
/** No SDK, network call, card data, wallet PIN, or money movement. */
export const mockPaymentAdapter: PaymentAdapter = {
  async prepare(request) {
    return {
      status: "SIMULATED",
      reference: `DEMO-${request.method.toUpperCase()}-${request.idempotencyKey}`,
    };
  },
};
