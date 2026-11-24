"use client";
import { Fragment } from "react";
import Link from "next/link";
import {
  Armchair,
  BusFront,
  Clock3,
  MapPin,
  ChevronLeft,
  Radio,
  Check,
  Flag,
  Navigation,
  Ticket,
  Gauge,
  LocateFixed,
} from "lucide-react";
import { useBusDetails } from "@/hooks/use-bus-details";
import { ApiError } from "@/lib/api/client";
import { useJourneyStore } from "@/stores/preferences-store";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { BusDetails } from "@/types/passenger";
const stopLabels = {
  completed: "Completed",
  next: "Next Stop",
  upcoming: "Upcoming",
  destination: "Destination",
};
export function BusDetailSkeleton() {
  return (
    <div
      className="bus-detail-skeleton"
      role="status"
      aria-label="Loading bus details"
    >
      <Skeleton className="heading-skeleton" />
      <Skeleton className="bus-summary-skeleton" />
      <div className="bus-detail-grid">
        <Skeleton className="bus-timeline-skeleton" />
        <Skeleton className="bus-timeline-skeleton" />
      </div>
      <span className="sr-only">Loading bus details…</span>
    </div>
  );
}
export function OccupancyPreview({
  occupied,
  capacity,
  available,
  reserved = 0,
  blocked = 0,
}: {
  occupied: number;
  capacity: number;
  available: number;
  reserved?: number;
  blocked?: number;
}) {
  return (
    <div className="bus-occupancy-preview">
      <div className="bus-occupancy-heading">
        <h3>Seat availability</h3>
        <span>{Math.round((occupied / capacity) * 100)}% occupied</span>
      </div>
      <div
        className="bus-occupancy-dots"
        role="img"
        aria-label={`${occupied} of ${capacity} seats occupied; ${available} seats available; ${reserved} reserved; ${blocked} blocked`}
      >
        {Array.from({ length: capacity }, (_, index) => (
          <span
            key={index}
            aria-hidden
            className={
              index < occupied
                ? "is-occupied"
                : index < occupied + reserved
                  ? "is-reserved"
                  : index < occupied + reserved + blocked
                    ? "is-blocked"
                    : "is-available"
            }
          />
        ))}
      </div>
      <div className="bus-occupancy-legend">
        <span>
          <i className="occupied" />
          {occupied} occupied
        </span>
        <span>
          <i className="available" />
          {available} seats available
        </span>
        {reserved > 0 && (
          <span>
            <i className="reserved" />
            {reserved} reserved
          </span>
        )}
        {blocked > 0 && (
          <span>
            <i className="blocked" />
            {blocked} blocked
          </span>
        )}
      </div>
      <p>Illustrative seat counts · availability may change.</p>
    </div>
  );
}
function RouteTimeline({ bus }: { bus: BusDetails }) {
  return (
    <ol className="bus-route-timeline" aria-label="Route progress">
      {bus.stops.map((stop) => (
        <Fragment key={stop.id}>
          <li
            className={`bus-stop is-${stop.status}`}
            aria-current={stop.status === "next" ? "step" : undefined}
          >
            <span className="bus-stop-marker" aria-hidden>
              {stop.status === "completed" ? (
                <Check size={12} />
              ) : stop.status === "destination" ? (
                <Flag size={13} />
              ) : null}
            </span>
            <div>
              <h3>{stop.name}</h3>
              <span>{stopLabels[stop.status]}</span>
            </div>
          </li>
          {bus.currentAfterStopId === stop.id && (
            <li className="bus-stop is-current-location">
              <span className="bus-current-marker" aria-hidden>
                <BusFront size={17} />
              </span>
              <div>
                <strong>{bus.id} · Current location</strong>
                <p>{bus.locationDescription}</p>
              </div>
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  );
}
export function BusDetail({ id }: { id: string }) {
  const { query, position, speedKmh, recordedAt, age } = useBusDetails(id);
  const setJourney = useJourneyStore((state) => state.setJourney);
  const bus = query.data;
  return (
    <div className="bus-details-page">
      <Link href="/app" className="passenger-back-link">
        <ChevronLeft size={17} />
        Passenger home
      </Link>
      {query.isPending ? (
        <BusDetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <Card>
            <EmptyState
              title="Bus not found"
              description="This vehicle is not in the current preview. Return home to see nearby buses."
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
        bus &&
        position && (
          <>
            <header className="bus-details-heading">
              <span className="bus-details-heading-icon">
                <BusFront size={27} />
              </span>
              <div>
                <p>YOUR JOURNEY</p>
                <h1>{bus.id}</h1>
              </div>
              <Badge tone="success">On Route</Badge>
            </header>
            <div className="bus-details-route-title">
              <h2>
                {bus.from} <span>→</span> {bus.to}
              </h2>
              <span className="bus-demo-label">Demo trip</span>
            </div>
            <dl className="bus-details-summary" aria-label="Bus summary">
              <div>
                <dt>
                  <Clock3 size={15} />
                  ETA
                </dt>
                <dd>
                  {bus.etaMinutes}
                  <span> min</span>
                </dd>
              </div>
              <div>
                <dt>
                  <Gauge size={15} />
                  Speed
                </dt>
                <dd>
                  {speedKmh}
                  <span> km/h</span>
                </dd>
              </div>
              <div>
                <dt>
                  <Armchair size={15} />
                  Available Seats
                </dt>
                <dd className="bus-available-value">{bus.availableSeats}</dd>
              </div>
              <div>
                <dt>
                  <BusFront size={15} />
                  Occupancy
                </dt>
                <dd>
                  {bus.occupiedSeats}
                  <span> / {bus.capacity}</span>
                </dd>
              </div>
            </dl>
            <div className="bus-detail-grid">
              <Card className="bus-journey-card">
                <section
                  className="bus-current-location"
                  aria-labelledby="current-location-title"
                >
                  <div className="bus-detail-section-label">
                    <MapPin size={17} />
                    <h2 id="current-location-title">Current location</h2>
                    <span>Latest known</span>
                  </div>
                  <strong>{bus.locationLabel}</strong>
                  <p>{bus.locationDescription}</p>
                  <div className="bus-location-coordinates">
                    <LocateFixed size={13} />
                    <span>
                      {Math.abs(position.lat).toFixed(5)}°{" "}
                      {position.lat >= 0 ? "N" : "S"},{" "}
                      {Math.abs(position.lng).toFixed(5)}°{" "}
                      {position.lng >= 0 ? "E" : "W"}
                    </span>
                  </div>
                </section>
                <section
                  className="bus-timeline-section"
                  aria-labelledby="route-progress-title"
                >
                  <div className="bus-detail-section-label">
                    <h2 id="route-progress-title">Route progress</h2>
                    <Link
                      href="/app/routes"
                      className="text-link"
                      onClick={() => setJourney(bus.from, bus.to)}
                    >
                      View route
                    </Link>
                  </div>
                  <RouteTimeline bus={bus} />
                </section>
              </Card>
              <Card className="bus-information-card">
                <section
                  className="bus-trip-information"
                  aria-labelledby="trip-information-title"
                >
                  <h2 id="trip-information-title">Trip information</h2>
                  <dl>
                    <div>
                      <dt>Vehicle</dt>
                      <dd>{bus.id}</dd>
                    </div>
                    <div>
                      <dt>Operator</dt>
                      <dd>{bus.operator}</dd>
                    </div>
                    <div>
                      <dt>Last GPS Update</dt>
                      <dd>
                        <time dateTime={recordedAt} title={recordedAt}>
                          {age <= 10 ? "a few seconds ago" : `${age} sec ago`}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>Device</dt>
                      <dd>
                        <span
                          className={`bus-device-status ${bus.deviceStatus === "Online" && age < 30 ? "is-online" : ""}`}
                        >
                          <i />
                          {bus.deviceStatus === "Offline"
                            ? "Offline"
                            : age >= 30
                              ? "Update delayed"
                              : "Online"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </section>
                <OccupancyPreview
                  occupied={bus.occupiedSeats}
                  capacity={bus.capacity}
                  available={bus.availableSeats}
                  reserved={bus.reservedSeats}
                  blocked={bus.blockedSeats}
                />
              </Card>
            </div>
            <div className="bus-detail-actions" aria-label="Journey actions">
              <Button asChild variant="outline">
                <Link
                  href={
                    bus.id === "BUS-06"
                      ? "/app/live"
                      : `/app/live?bus=${encodeURIComponent(bus.id)}`
                  }
                >
                  <Navigation size={16} />
                  Track Live
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/app/seats/${bus.tripId}`}>
                  <Armchair size={16} />
                  View Seats
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/app/seats/${bus.tripId}`}>
                  <Ticket size={16} />
                  Book Ticket
                </Link>
              </Button>
            </div>
            <p className="bus-detail-disclaimer">
              <Radio size={13} />
              <span>
                Demo information · Locations and seat counts are simulated.
                Booking is a preview.
              </span>
            </p>
          </>
        )
      )}
    </div>
  );
}
