import { SEAT_LABELS, SEAT_STATES } from "@/lib/seats";
export function SeatLegend() {
  return (
    <ul className="seat-legend" aria-label="Seat status legend">
      {SEAT_STATES.map((state) => (
        <li key={state}>
          <span
            aria-hidden
            className={`seat-legend-swatch seat-state-${state.toLowerCase()}`}
          />
          <span>{SEAT_LABELS[state]}</span>
        </li>
      ))}
    </ul>
  );
}
