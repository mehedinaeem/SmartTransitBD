"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, BusFront, Info, Check } from "lucide-react";
import { useSeatPreview } from "@/hooks/use-bus-details";
import { ApiError } from "@/lib/api/client";
import { countSeats, formatFare, getAvailableSeat } from "@/lib/seats";
import {
  Card,
  Badge,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SeatMap } from "@/components/seats/seat-map";
import { SeatLegend } from "@/components/seats/seat-legend";
export function SeatSelectionSkeleton() {
  return (
    <div
      className="seat-selection-skeleton"
      role="status"
      aria-label="Loading seats"
    >
      <Skeleton className="seat-selection-card-skeleton" />
      <div>
        <Skeleton className="heading-skeleton" />
        <Skeleton className="heading-skeleton" />
      </div>
      <span className="sr-only">Loading seats…</span>
    </div>
  );
}
export function SeatPreviewPage({
  tripId,
  initialSeatId = null,
}: {
  tripId: string;
  initialSeatId?: string | null;
}) {
  const router = useRouter();
  const query = useSeatPreview(tripId);
  const [selectedId, setSelectedId] = useState<string | null>(initialSeatId);
  const trip = query.data;
  const selected = trip ? getAvailableSeat(trip.seats, selectedId) : undefined;
  const counts = trip ? countSeats(trip.seats) : null;
  return (
    <div className="seat-selection-page">
      <Link
        href={trip ? `/app/bus/${trip.vehicleId}` : "/app"}
        className="passenger-back-link"
      >
        <ChevronLeft size={17} />
        {trip ? "Bus details" : "Passenger home"}
      </Link>
      <header className="seat-selection-heading">
        <div>
          <p>PLAN YOUR JOURNEY</p>
          <h1>Choose your seat</h1>
        </div>
        <Badge tone="blue">Demo trip</Badge>
      </header>
      {query.isPending ? (
        <SeatSelectionSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <Card>
            <EmptyState
              title="Trip not found"
              description="This trip is not in the preview. Explore nearby buses to find a journey."
            >
              <Button asChild variant="outline">
                <Link href="/app">Nearby buses</Link>
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <Card>
            <ErrorState retry={() => query.refetch()} />
          </Card>
        )
      ) : (
        trip &&
        counts && (
          <>
            <div className="seat-selection-trip">
              <BusFront size={18} />
              <strong>{trip.vehicleId}</strong>
              <span>
                {trip.from} → {trip.to}
              </span>
              <small>{trip.id}</small>
            </div>
            <div className="seat-selection-mobile-key">
              <SeatLegend />
            </div>
            <div className="seat-selection-content">
              <Card className="seat-selection-cabin">
                <SeatMap
                  seats={trip.seats}
                  selectedSeatId={selected?.id ?? null}
                  onSeatSelect={(id) => {
                    if (getAvailableSeat(trip.seats, id))
                      setSelectedId((current) => (current === id ? null : id));
                  }}
                />
              </Card>
              <aside className="seat-selection-guide">
                <div className="seat-selection-guide-heading">
                  <h2>{counts.AVAILABLE} seats available</h2>
                  <span>40-seat bus · 2 + 2 layout</span>
                </div>
                <p>
                  Choose an available seat. The aisle runs through the center of
                  the bus.
                </p>
                <SeatLegend />
                <div className="seat-selection-help">
                  <Check size={16} />
                  <div>
                    <strong>One seat for your journey</strong>
                    <p>
                      Select a different available seat to change your choice.
                      Tap your selected seat again to clear it.
                    </p>
                  </div>
                </div>
                <div className="seat-selection-note">
                  <Info size={16} />
                  <p>
                    This is a demo seat layout. Selection does not hold or
                    reserve a seat.
                  </p>
                </div>
              </aside>
            </div>
            <section className="seat-booking-bar" aria-label="Booking summary">
              <div className="seat-booking-bar-inner">
                <dl>
                  <div>
                    <dt>Selected Seat</dt>
                    <dd aria-live="polite" aria-atomic>
                      {selected?.id ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Fare</dt>
                    <dd>{formatFare(trip.fare)}</dd>
                  </div>
                </dl>
                <Button
                  disabled={!selected}
                  onClick={() => {
                    if (!selected) return;
                    router.push(
                      `/app/booking?${new URLSearchParams({ trip: trip.id, seat: selected.id })}`,
                    );
                  }}
                >
                  Continue
                </Button>
              </div>
            </section>
          </>
        )
      )}
    </div>
  );
}
