"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Banknote,
  CreditCard,
  Info,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  checkoutFormSchema,
  type CheckoutForm,
  type PaymentMethod,
} from "@/types/booking";
import type { SeatPreview } from "@/types/passenger";
import { bookingsApi } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import { PAYMENT_METHODS } from "@/lib/payments/methods";
import { formatFare } from "@/lib/seats";
import { Button } from "@/components/ui/button";
import { Card, Input } from "@/components/ui/primitives";
type Field = "name" | "phone" | "email";
const fields: {
  id: Field;
  label: string;
  placeholder: string;
  autoComplete: string;
  type: "text" | "tel" | "email";
}[] = [
  {
    id: "name",
    label: "Name",
    placeholder: "Full name",
    autoComplete: "name",
    type: "text",
  },
  {
    id: "phone",
    label: "Phone",
    placeholder: "01XXXXXXXXX",
    autoComplete: "tel",
    type: "tel",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    autoComplete: "email",
    type: "email",
  },
];
export function CheckoutForm({
  trip,
  seatId,
}: {
  trip: SeatPreview;
  seatId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CheckoutForm>({
    name: "Naeem",
    phone: "",
    email: "",
    paymentMethod: "bkash",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const latch = useRef(false);
  const key = useRef<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const mutation = useMutation({
    mutationFn: () => {
      const data = checkoutFormSchema.parse(values);
      key.current ??= crypto.randomUUID();
      return bookingsApi.create(
        {
          tripId: trip.id,
          seatId,
          passenger: { name: data.name, phone: data.phone, email: data.email },
          paymentMethod: data.paymentMethod,
        },
        { idempotencyKey: key.current },
      );
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(
        ["bookings", "ticket", booking.bookingId],
        booking,
      );
      void queryClient.invalidateQueries({
        queryKey: ["bookings", "confirmed"],
      });
      void queryClient.invalidateQueries({ queryKey: ["bookings", "tickets"] });
      toast.success("Demo booking confirmed", {
        description: "No payment was taken.",
      });
      if (mounted.current) router.push(`/app/tickets/${booking.bookingId}`);
    },
    onError: (error) => {
      latch.current = false;
      toast.error("Booking could not be confirmed", {
        description:
          error instanceof ApiError && error.status === 409
            ? error.message
            : "Please try again. No payment was taken.",
      });
    },
  });
  const busy = mutation.isPending || Boolean(mutation.data);
  function validate(field: Field, value: string) {
    const result = checkoutFormSchema.shape[field].safeParse(value);
    return result.success ? undefined : result.error.issues[0].message;
  }
  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (touched[field] || errors[field])
      setErrors((current) => ({ ...current, [field]: validate(field, value) }));
    if (mutation.isError) mutation.reset();
  }
  return (
    <form
      className="booking-checkout-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (latch.current) return;
        const result = checkoutFormSchema.safeParse(values);
        if (!result.success) {
          const next: Partial<Record<Field, string>> = {};
          for (const issue of result.error.issues) {
            const field = issue.path[0] as Field;
            if (["name", "phone", "email"].includes(field) && !next[field])
              next[field] = issue.message;
          }
          setErrors(next);
          setTouched({ name: true, phone: true, email: true });
          const first = fields.find((field) => next[field.id]);
          if (first) document.getElementById(`booking-${first.id}`)?.focus();
          return;
        }
        latch.current = true;
        mutation.mutate();
      }}
      aria-busy={mutation.isPending}
    >
      <Card className="checkout-form-card">
        <fieldset disabled={busy}>
          <legend>Passenger details</legend>
          <p className="checkout-section-description">
            Who will be travelling?
          </p>
          <div className="checkout-fields">
            {fields.map((field) => (
              <div className="checkout-field" key={field.id}>
                <label htmlFor={`booking-${field.id}`}>
                  {field.label}
                  {field.id === "email" ? (
                    <span> optional</span>
                  ) : (
                    <span className="sr-only"> required</span>
                  )}
                </label>
                <Input
                  id={`booking-${field.id}`}
                  type={field.type}
                  inputMode={
                    field.id === "phone"
                      ? "tel"
                      : field.id === "email"
                        ? "email"
                        : "text"
                  }
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  maxLength={
                    field.id === "name" ? 80 : field.id === "phone" ? 30 : 254
                  }
                  required={field.id !== "email"}
                  aria-required={field.id !== "email"}
                  aria-invalid={Boolean(errors[field.id])}
                  aria-describedby={
                    errors[field.id] ? `booking-${field.id}-error` : undefined
                  }
                  onChange={(event) => update(field.id, event.target.value)}
                  onBlur={() => {
                    setTouched((current) => ({ ...current, [field.id]: true }));
                    setErrors((current) => ({
                      ...current,
                      [field.id]: validate(field.id, values[field.id] ?? ""),
                    }));
                  }}
                />
                {errors[field.id] && (
                  <p
                    className="checkout-field-error"
                    id={`booking-${field.id}-error`}
                  >
                    <AlertCircle size={13} />
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      </Card>
      <Card className="checkout-form-card">
        <fieldset className="checkout-payments" disabled={busy}>
          <legend>Payment method</legend>
          <p className="checkout-section-description">
            Choose how you would like to pay.
          </p>
          <div className="checkout-payment-options">
            {PAYMENT_METHODS.map((method) => {
              const Icon =
                method.id === "card"
                  ? CreditCard
                  : method.id === "cash"
                    ? Banknote
                    : Smartphone;
              return (
                <label
                  key={method.id}
                  className={`checkout-payment-option ${values.paymentMethod === method.id ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={values.paymentMethod === method.id}
                    onChange={() =>
                      setValues((current) => ({
                        ...current,
                        paymentMethod: method.id as PaymentMethod,
                      }))
                    }
                  />
                  <Icon size={21} aria-hidden />
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="checkout-payment-disclaimer">
            <Info size={14} />
            <span>
              All payment methods are simulated. No money will be charged.
            </span>
          </p>
        </fieldset>
      </Card>
      {mutation.isError && (
        <div className="checkout-submit-error" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>We couldn’t confirm your booking</strong>
            <p>
              {mutation.error instanceof ApiError &&
              mutation.error.status === 409
                ? mutation.error.message
                : "Please try again. Your payment has not been charged."}
            </p>
            {mutation.error instanceof ApiError &&
              mutation.error.status === 409 && (
                <Link href={`/app/seats/${trip.id}`}>Choose another seat</Link>
              )}
          </div>
        </div>
      )}
      <div className="checkout-confirm">
        <div className="checkout-total">
          <span>Total fare</span>
          <strong>{formatFare(trip.fare)}</strong>
        </div>
        <Button type="submit" disabled={busy}>
          {mutation.isPending ? (
            <>
              <LoaderCircle size={17} className="spinning" />
              Confirming booking…
            </>
          ) : mutation.data ? (
            "Booking confirmed"
          ) : (
            "Confirm Booking"
          )}
        </Button>
        <p>
          <ShieldCheck size={14} />
          Prototype checkout · Your confirmation will be a demo ticket.
        </p>
      </div>
    </form>
  );
}
