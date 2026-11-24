"use client";
import { Gauge } from "lucide-react";
import type { Seat } from "@/types/seats";
import { SeatButton } from "./seat-button";
const availableOnly = (seat: Seat) => seat.status === "AVAILABLE";
type Props = {
  seats: readonly Seat[];
  selectedSeatId: string | null;
  onSeatSelect: (id: string) => void;
  readOnly?: boolean;
  canSelect?: (seat: Seat) => boolean;
};
/** Reusable 2+2 layout. Operator read-only views can reuse it without passenger state. */
export function SeatMap({
  seats,
  selectedSeatId,
  onSeatSelect,
  readOnly = false,
  canSelect = availableOnly,
}: Props) {
  const rows = Array.from(new Set(seats.map((seat) => seat.row))).sort();
  return (
    <div className="seat-map">
      <div className="seat-map-front">
        <span>Front of bus</span>
        <span className="seat-driver">
          <Gauge size={19} />
          <span>Driver</span>
        </span>
      </div>
      <div className="seat-column-labels" aria-hidden>
        <span />
        <span>Window</span>
        <span>Aisle</span>
        <span />
        <span>Aisle</span>
        <span>Window</span>
      </div>
      <div
        className="seat-map-rows"
        role="group"
        aria-label={`${seats.length}-seat bus layout`}
      >
        {rows.map((row) => (
          <div
            className="seat-map-row"
            key={row}
            role="group"
            aria-label={`Row ${row}`}
          >
            <span className="seat-row-label" aria-hidden>
              {row}
            </span>
            {[1, 2, 3, 4].map((column) => {
              const seat = seats.find(
                (seat) => seat.row === row && seat.column === column,
              );
              return (
                <div
                  className="seat-map-slot"
                  style={{ gridColumn: column > 2 ? column + 2 : column + 1 }}
                  key={column}
                >
                  {seat && (
                    <SeatButton
                      id={seat.id}
                      state={
                        seat.id === selectedSeatId && canSelect(seat)
                          ? "SELECTED"
                          : seat.status
                      }
                      disabled={readOnly || !canSelect(seat)}
                      onSelect={onSeatSelect}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="seat-map-rear">Rear of bus</div>
    </div>
  );
}
