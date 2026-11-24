import type { PaymentMethod } from "@/types/booking";
export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
  { id: "bkash", label: "bKash", description: "Mobile wallet" },
  { id: "nagad", label: "Nagad", description: "Mobile wallet" },
  { id: "card", label: "Card", description: "Debit or credit card" },
  { id: "cash", label: "Cash", description: "Pay in person" },
];
export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((item) => item.id === method)!.label;
}
