"use client";
import { Check, Slash } from "lucide-react";
import { SEAT_LABELS } from "@/lib/seats";
import type { SeatState } from "@/types/seats";
import { cn } from "@/lib/utils";
type Props = {
  id: string;
  state: SeatState;
  disabled?: boolean;
  onSelect?: (id: string) => void;
};
/** Controlled visual primitive: no passenger API, store, or navigation dependency. */
export function SeatButton({ id, state, disabled = false, onSelect }: Props) {
  return (
    <button
      type="button"
      className={cn("seat-button", `seat-state-${state.toLowerCase()}`)}
      disabled={disabled}
      aria-label={`Seat ${id}, ${SEAT_LABELS[state].toLowerCase()}`}
      aria-pressed={state === "SELECTED"}
      title={`${id} · ${SEAT_LABELS[state]}`}
      onClick={() => onSelect?.(id)}
    >
      <span className="seat-button-indicator" aria-hidden />
      {state === "SELECTED" && (
        <Check size={11} className="seat-button-symbol" aria-hidden />
      )}
      {state === "BLOCKED" && (
        <Slash size={11} className="seat-button-symbol" aria-hidden />
      )}
      <span>{id}</span>
    </button>
  );
}
