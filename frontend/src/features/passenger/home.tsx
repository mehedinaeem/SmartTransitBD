"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BusFront,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  Route,
  Search,
  Ticket,
  Tickets,
  Armchair,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { useNearbyVehicles, usePopularRoutes } from "@/hooks/use-transit";
import { useJourneyStore } from "@/stores/preferences-store";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { NearbyVehicle } from "@/types/passenger";
const actions = [
  { label: "Live Tracking", href: "/app/live", icon: Navigation },
  { label: "Book Ticket", href: "/app/routes", icon: Ticket },
  { label: "My Tickets", href: "/app/tickets", icon: Tickets },
  { label: "Routes", href: "/app/routes", icon: Route },
];
export function NearbyBusRow({ vehicle }: { vehicle: NearbyVehicle }) {
  return (
    <Link
      href={`/app/bus/${encodeURIComponent(vehicle.id)}`}
      className="nearby-bus-row"
    >
      <span className="nearby-bus-icon">
        <BusFront size={22} />
      </span>
      <div className="nearby-bus-content">
        <div className="nearby-bus-title">
          <h3>{vehicle.id}</h3>
          <Badge tone={vehicle.status === "Approaching" ? "success" : "blue"}>
            {vehicle.status}
          </Badge>
        </div>
        <p className="nearby-bus-route">
          {vehicle.from} <span>→</span> {vehicle.to}
        </p>
        <div className="nearby-bus-meta">
          <span>
            <MapPin size={13} />
            {vehicle.distanceKm.toFixed(1)} km away
          </span>
          <span className="nearby-eta">
            <Clock3 size={13} />
            ETA {vehicle.etaMinutes} min
          </span>
          <span
            className={`nearby-seats ${vehicle.availableSeats <= 5 ? "few-seats" : ""}`}
          >
            <Armchair size={13} />
            {vehicle.availableSeats} seats available
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="nearby-chevron" />
    </Link>
  );
}
export function NearbyBusesSkeleton() {
  return (
    <div
      className="passenger-list-skeleton"
      role="status"
      aria-label="Loading nearby buses"
    >
      {[1, 2, 3].map((id) => (
        <div className="passenger-row-skeleton" key={id}>
          <Skeleton className="passenger-icon-skeleton" />
          <div>
            <Skeleton className="passenger-title-skeleton" />
            <Skeleton className="passenger-route-skeleton" />
            <Skeleton className="passenger-meta-skeleton" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading nearby buses…</span>
    </div>
  );
}
export function PopularRoutesSkeleton() {
  return (
    <div
      className="popular-routes-skeleton"
      role="status"
      aria-label="Loading popular routes"
    >
      {[1, 2, 3].map((id) => (
        <Skeleton key={id} className="passenger-route-skeleton" />
      ))}
      <span className="sr-only">Loading popular routes…</span>
    </div>
  );
}
export function PassengerHome() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const setJourney = useJourneyStore((s) => s.setJourney);
  const nearby = useNearbyVehicles();
  const popular = usePopularRoutes();
  return (
    <div className="passenger-home">
      <header className="passenger-greeting">
        <div>
          <p>Good morning,</p>
          <h1>Naeem</h1>
        </div>
        <Link
          href="/app/profile"
          className="passenger-profile-avatar"
          aria-label="Open Naeem’s profile"
        >
          N
        </Link>
      </header>
      <div className="passenger-location">
        <MapPin size={15} />
        <span>JKKNIU, Trishal</span>
        <Badge>Demo location</Badge>
      </div>
      <form
        className="destination-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!destination.trim()) return;
          setJourney("", destination.trim());
          router.push("/app/routes");
        }}
      >
        <Search size={21} aria-hidden />
        <input
          aria-label="Destination"
          placeholder="Where do you want to go?"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          required
          maxLength={100}
          autoComplete="off"
          enterKeyHint="search"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
      <nav className="passenger-quick-actions" aria-label="Quick actions">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={() => {
              if (href === "/app/routes") setJourney("", "");
              if (label === "Book Ticket")
                toast.info(
                  "Booking is not available yet. Explore sample routes to plan your journey.",
                );
            }}
          >
            <span>
              <Icon size={21} />
            </span>
            <strong>{label}</strong>
          </Link>
        ))}
      </nav>
      <div className="passenger-home-sections">
        <section
          aria-labelledby="nearby-buses-heading"
          className="nearby-section"
        >
          <div className="passenger-section-heading">
            <div>
              <h2 id="nearby-buses-heading">Nearby Buses</h2>
              <p>Find your next ride around campus</p>
            </div>
            <span className="nearby-location-hint">
              <MapPin size={13} />
              Near JKKNIU
            </span>
          </div>
          <Card className="passenger-list-card">
            {nearby.isPending ? (
              <NearbyBusesSkeleton />
            ) : nearby.isError ? (
              <ErrorState retry={() => nearby.refetch()} />
            ) : nearby.data.length === 0 ? (
              <EmptyState
                title="No buses nearby"
                description="There are no buses in this area right now. Explore routes to plan your journey."
              >
                <Button asChild variant="outline">
                  <Link href="/app/routes" onClick={() => setJourney("", "")}>
                    Explore routes
                  </Link>
                </Button>
              </EmptyState>
            ) : (
              nearby.data.map((vehicle) => (
                <NearbyBusRow vehicle={vehicle} key={vehicle.id} />
              ))
            )}
          </Card>
          <p className="passenger-data-note">
            <Radio size={13} />
            <span>
              Demo data · Locations, ETAs, and seat availability are simulated.
            </span>
          </p>
        </section>
        <section
          aria-labelledby="popular-routes-heading"
          className="popular-section"
        >
          <div className="passenger-section-heading">
            <div>
              <h2 id="popular-routes-heading">Popular Routes</h2>
              <p>Connections people travel every day</p>
            </div>
            <Link
              href="/app/routes"
              className="text-link"
              onClick={() => setJourney("", "")}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <Card className="passenger-list-card popular-route-list">
            {popular.isPending ? (
              <PopularRoutesSkeleton />
            ) : popular.isError ? (
              <ErrorState retry={() => popular.refetch()} />
            ) : popular.data.length === 0 ? (
              <EmptyState
                title="Routes are on the way"
                description="Popular connections will appear here when available."
              />
            ) : (
              popular.data.map((route) => (
                <Link
                  key={route.id}
                  href="/app/routes"
                  onClick={() => setJourney(route.from, route.to)}
                  className="popular-route-row"
                >
                  <span className="popular-route-icon">
                    <Route size={19} />
                  </span>
                  <span>
                    {route.from} <span className="route-connector">→</span>{" "}
                    {route.to}
                  </span>
                  <ChevronRight size={16} />
                </Link>
              ))
            )}
          </Card>
          <div className="passenger-booking-note">
            <Ticket size={16} />
            <p>
              Plan your journey today.
              <br />
              <span>Ticket booking is coming in a future release.</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
