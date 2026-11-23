"use client";
import Link from "next/link";
import {
  Armchair,
  BusFront,
  Clock3,
  MapPin,
  ChevronLeft,
  Route,
  Radio,
} from "lucide-react";
import { useNearbyVehicle } from "@/hooks/use-transit";
import { ApiError } from "@/lib/api/client";
import { useJourneyStore } from "@/stores/preferences-store";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { NearbyBusesSkeleton } from "./home";
export function BusDetail({ id }: { id: string }) {
  const query = useNearbyVehicle(id);
  const setJourney = useJourneyStore((s) => s.setJourney);
  return (
    <div className="passenger-bus-detail">
      <Link href="/app" className="passenger-back-link">
        <ChevronLeft size={17} />
        Passenger home
      </Link>
      {query.isPending ? (
        <Card>
          <NearbyBusesSkeleton />
        </Card>
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
        <>
          <header className="passenger-bus-detail-header">
            <span className="nearby-bus-icon">
              <BusFront size={26} />
            </span>
            <div>
              <p>Vehicle preview</p>
              <h1>{query.data.id}</h1>
            </div>
            <Badge
              tone={query.data.status === "Approaching" ? "success" : "blue"}
            >
              {query.data.status}
            </Badge>
          </header>
          <Card className="passenger-bus-route">
            <h2>
              {query.data.from} <span>→</span> {query.data.to}
            </h2>
            <p>Sample route · {query.data.routeId}</p>
            <dl className="passenger-bus-metrics">
              <div>
                <dt>
                  <MapPin size={17} />
                  Distance
                </dt>
                <dd>{query.data.distanceKm.toFixed(1)} km away</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={17} />
                  Arrival estimate
                </dt>
                <dd>{query.data.etaMinutes} min</dd>
              </div>
              <div>
                <dt>
                  <Armchair size={17} />
                  Seat availability
                </dt>
                <dd>{query.data.availableSeats} seats available</dd>
              </div>
            </dl>
            <Button asChild variant="outline">
              <Link
                href="/app/routes"
                onClick={() => setJourney(query.data.from, query.data.to)}
              >
                <Route size={16} />
                View route
              </Link>
            </Button>
          </Card>
          <div className="notice passenger-detail-notice">
            <Radio size={18} />
            <div>
              <strong>Simulated vehicle information</strong>
              <p>
                This software preview is not connected to production hardware.
                Locations, ETAs, and seat estimates are mock data. Booking is
                not available yet.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
