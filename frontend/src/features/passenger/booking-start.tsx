"use client";
import Link from "next/link";
import {
  ChevronLeft,
  BusFront,
  CalendarDays,
  Clock3,
  Armchair,
} from "lucide-react";
import { useSeatPreview } from "@/hooks/use-bus-details";
import { ApiError } from "@/lib/api/client";
import { formatFare, getAvailableSeat } from "@/lib/seats";
import { formatJourneyDate, formatDepartureTime } from "@/lib/dates";
import { bookingSelectionSchema } from "@/types/seats";
import {
  Card,
  Badge,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/features/booking/checkout-form";
export function BookingStart({
  tripId,
  seatId,
}: {
  tripId: string;
  seatId: string;
}) {
  const parsed = bookingSelectionSchema.safeParse({
    trip: tripId,
    seat: seatId,
  });
  if (!parsed.success)
    return (
      <div className="booking-start-page">
        <Card>
          <EmptyState
            title="Choose a seat first"
            description="Start with a trip and select an available seat before continuing."
          >
            <Button asChild variant="outline">
              <Link href="/app">Explore nearby buses</Link>
            </Button>
          </EmptyState>
        </Card>
      </div>
    );
  return (
    <BookingCheckout tripId={parsed.data.trip} seatId={parsed.data.seat} />
  );
}
function BookingCheckout({
  tripId,
  seatId,
}: {
  tripId: string;
  seatId: string;
}) {
  const query = useSeatPreview(tripId);
  const trip = query.data;
  const seat = trip ? getAvailableSeat(trip.seats, seatId) : undefined;
  return (
    <div className="booking-checkout-page">
      <Link
        href={`/app/seats/${encodeURIComponent(tripId)}?seat=${encodeURIComponent(seatId)}`}
        className="passenger-back-link"
      >
        <ChevronLeft size={17} />
        Seat selection
      </Link>
      <header className="checkout-page-heading">
        <div>
          <p>BOOK YOUR JOURNEY</p>
          <h1>Review your journey</h1>
          <span>A few details, then you’re ready to go.</span>
        </div>
        <Badge tone="blue">Prototype</Badge>
      </header>
      {query.isPending ? (
        <div
          className="checkout-grid"
          role="status"
          aria-label="Loading checkout"
        >
          <Skeleton className="checkout-summary-skeleton" />
          <Skeleton className="checkout-form-skeleton" />
        </div>
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <Card>
            <EmptyState
              title="Trip not found"
              description="Choose another trip to continue."
            >
              <Button asChild variant="outline">
                <Link href="/app">Passenger home</Link>
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <Card>
            <ErrorState retry={() => query.refetch()} />
          </Card>
        )
      ) : !seat ? (
        <Card>
          <EmptyState
            title="This seat is not available"
            description="Choose an available seat to continue your journey."
          >
            <Button asChild variant="outline">
              <Link href={`/app/seats/${tripId}`}>Choose another seat</Link>
            </Button>
          </EmptyState>
        </Card>
      ) : (
        trip && (
          <div className="checkout-grid">
            <aside className="checkout-trip-column">
              <Card
                className="booking-journey-summary checkout-trip-summary"
                aria-label="Trip summary"
              >
                <div className="checkout-section-title">
                  <h2>Trip summary</h2>
                  <span>{trip.id}</span>
                </div>
                <div className="checkout-bus-id">
                  <span>
                    <BusFront size={23} />
                  </span>
                  <strong>{trip.vehicleId}</strong>
                </div>
                <h3>
                  {trip.from} <span>→</span> {trip.to}
                </h3>
                <dl>
                  <div>
                    <dt>
                      <CalendarDays size={15} />
                      Date
                    </dt>
                    <dd>{formatJourneyDate(trip.travelDate)}</dd>
                  </div>
                  <div>
                    <dt>
                      <Clock3 size={15} />
                      Departure
                    </dt>
                    <dd>{formatDepartureTime(trip.departureTime)}</dd>
                  </div>
                  <div>
                    <dt>
                      <Armchair size={15} />
                      Seat
                    </dt>
                    <dd>{seat.id}</dd>
                  </div>
                  <div>
                    <dt>Fare</dt>
                    <dd>{formatFare(trip.fare)}</dd>
                  </div>
                </dl>
                <Link
                  className="text-link"
                  href={`/app/seats/${trip.id}?seat=${seat.id}`}
                >
                  Change seat
                </Link>
              </Card>
              <p className="checkout-schedule-note">
                Demo schedule · All times are Bangladesh time.
              </p>
            </aside>
            <CheckoutForm
              key={`${trip.id}:${seat.id}`}
              trip={trip}
              seatId={seat.id}
            />
          </div>
        )
      )}
    </div>
  );
}
