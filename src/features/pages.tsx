"use client";
import { useState } from "react";
import {
  usePreferencesStore,
  useJourneyStore,
} from "@/stores/preferences-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BusFront,
  MapPin,
  Search,
  Route,
  Ticket,
  ShieldCheck,
  Bell,
  UserRound,
  Construction,
  Clock,
  ChevronRight,
  Radio,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useRoutes, useVehicles } from "@/hooks/use-transit";
import {
  PageHeading,
  Dashboard,
  FleetTable,
  OccupancyChart,
  SystemStatus,
} from "./dashboard";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { TransitRoute } from "@/types/transit";
export function RoutesPage({ passenger = false }: { passenger?: boolean }) {
  const query = useRoutes();
  const journey = useJourneyStore();
  const matchesRoute = (r: TransitRoute) =>
    `${r.from} ${r.to} ${r.name}`
      .toLowerCase()
      .includes(search.toLowerCase()) &&
    (!passenger ||
      (r.from.toLowerCase().includes(journey.origin.toLowerCase()) &&
        r.to.toLowerCase().includes(journey.destination.toLowerCase())));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TransitRoute | null>(null);
  return (
    <>
      <PageHeading
        eyebrow={passenger ? "PLAN YOUR JOURNEY" : "NETWORK"}
        title={passenger ? "Find your route" : "Route network"}
        description="Explore sample corridors connecting Dhaka’s neighborhoods."
      />
      <Card>
        <div className="section-header">
          <div>
            <h2>Dhaka routes</h2>
            <p>Illustrative routes and fares · Service not yet available</p>
          </div>
          <Badge tone="blue">3 corridors</Badge>
        </div>
        {passenger && (journey.origin || journey.destination) && (
          <div className="journey-filter">
            <span>
              {journey.origin || "Any origin"} →{" "}
              {journey.destination || "Any destination"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => journey.setJourney("", "")}
            >
              Clear journey
            </Button>
          </div>
        )}
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={17} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search origin or destination…"
              aria-label="Search routes"
            />
          </label>
        </div>
        {query.isPending ? (
          <Skeleton className="map-skeleton" />
        ) : query.isError ? (
          <ErrorState retry={() => query.refetch()} />
        ) : (
          <div className="route-list">
            {query.data.filter(matchesRoute).map((r) => (
              <div className="route-row" key={r.id}>
                <span className="route-symbol">
                  <Route size={22} />
                </span>
                <div className="route-description">
                  <span className="eyebrow">
                    {r.id} · {r.name}
                  </span>
                  <h3>
                    {r.from} <span>→</span> {r.to}
                  </h3>
                  <p>
                    {r.stops} stops · {r.duration}
                  </p>
                </div>
                <div className="route-fare">
                  <strong>৳{r.fare}</strong>
                  <small>Illustrative fare</small>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(r)}
                >
                  Route details
                </Button>
              </div>
            ))}
            {!query.data.some(matchesRoute) && (
              <EmptyState
                title="No routes found"
                description="Try another neighborhood or destination."
              />
            )}
          </div>
        )}
      </Card>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${selected.from} to ${selected.to}` : "Route"}
        description="Sample route · Actual stops, schedules, and fares require operator verification."
      >
        <p className="dialog-body">
          {selected?.stops} planned stops · Estimated journey:{" "}
          {selected?.duration}. Route geometry and intermediate stops will be
          added during backend integration.
        </p>
        <Badge tone="warning">Booking not yet available</Badge>
      </Dialog>
    </>
  );
}
export function VehiclesPage() {
  const q = useVehicles();
  return (
    <>
      <PageHeading
        eyebrow="FLEET MANAGEMENT"
        title="Vehicles"
        description="Your vehicle directory and latest sample telemetry."
      />
      {q.isPending ? (
        <Skeleton className="map-skeleton" />
      ) : q.isError ? (
        <ErrorState retry={() => q.refetch()} />
      ) : (
        <FleetTable vehicles={q.data} />
      )}
    </>
  );
}
export function AlertsPage() {
  return (
    <>
      <PageHeading
        eyebrow="FLEET HEALTH"
        title="Alerts"
        description="Example events that need an operator’s attention."
      />
      <Card>
        <div className="section-header">
          <h2>Open alerts</h2>
          <Badge tone="warning">2 sample alerts</Badge>
        </div>
        {[
          {
            title: "Vehicle connection lost",
            detail:
              "ST-104 · No telemetry received for 12 minutes. Sample event.",
            level: "Connection",
            icon: Radio,
          },
          {
            title: "High seat occupancy",
            detail:
              "ST-103 · Estimated 34 of 40 seats occupied. Model preview.",
            level: "Occupancy",
            icon: TriangleAlert,
          },
        ].map((a) => (
          <div className="alert-row" key={a.title}>
            <span className="event-icon warning">
              <a.icon size={19} />
            </span>
            <div>
              <h3>{a.title}</h3>
              <p>{a.detail}</p>
            </div>
            <Badge tone="warning">{a.level}</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}
export function SettingsPage({ profile = false }: { profile?: boolean }) {
  const mode = profile ? "passenger" : "operator";
  const preferences = usePreferencesStore((s) => s[mode]);
  const save = usePreferencesStore((s) => s.save);
  const [name, setName] = useState(preferences.name);
  const [notifications, setNotifications] = useState(preferences.notifications);
  return (
    <>
      <PageHeading
        eyebrow={profile ? "YOUR ACCOUNT" : "WORKSPACE"}
        title={profile ? "Passenger profile" : "Workspace settings"}
        description="Local preview preferences. Accounts and authentication are not connected."
      />
      <div className="settings-grid">
        <Card>
          <div className="section-header">
            <div>
              <h2>{profile ? "Profile details" : "Organization details"}</h2>
              <p>Changes apply to this preview session.</p>
            </div>
            <UserRound size={20} />
          </div>
          <form
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              save(mode, { name, notifications });
              toast.success("Preview preferences saved for this session");
            }}
          >
            <label>
              Display name
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label>
              Region
              <Input value="Dhaka, Bangladesh" readOnly />
            </label>
            <label>
              Timezone
              <Input value="Asia/Dhaka (UTC+06:00)" readOnly />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              Show preview notifications
            </label>
            <Button type="submit">Save preview preferences</Button>
          </form>
        </Card>
        <Card>
          <div className="section-header">
            <h2>Environment</h2>
            <ShieldCheck size={20} />
          </div>
          <div className="environment-details">
            <Badge tone="blue">Development</Badge>
            <h3>Designed for the next milestone</h3>
            <p>
              Secure operator access, passenger accounts, and production API
              integration will be implemented in a later phase.
            </p>
            <p>No real personal information is required for this preview.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
export function UpcomingPage({
  kind,
  passenger = false,
}: {
  kind: "tickets" | "bookings";
  passenger?: boolean;
}) {
  return (
    <>
      <PageHeading
        eyebrow={passenger ? "YOUR JOURNEYS" : "PASSENGER OPERATIONS"}
        title={kind === "tickets" ? "My tickets" : "Bookings"}
        description="The booking experience is planned for a future integration phase."
      />
      <Card>
        <EmptyState
          title={
            kind === "tickets"
              ? "Your next journey starts here"
              : "Booking integration is ahead"
          }
          description="Ticket reservations, payments, and confirmations will become available after the passenger application connects to production services."
        >
          <Badge tone="warning">Not yet connected</Badge>
          <Button asChild variant="outline">
            <Link href={passenger ? "/app/routes" : "/operator/routes"}>
              <Route size={16} />
              Explore sample routes
            </Link>
          </Button>
        </EmptyState>
      </Card>
      <div className="feature-outline">
        {[
          {
            icon: Ticket,
            title: "Digital tickets",
            text: "A dedicated place for upcoming and past journeys.",
          },
          {
            icon: ShieldCheck,
            title: "Secure payments",
            text: "Payment provider integration in a later phase.",
          },
          {
            icon: Bell,
            title: "Journey updates",
            text: "Service notifications backed by real telemetry.",
          },
        ].map((f) => (
          <Card key={f.title}>
            <f.icon size={22} />
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <Badge>Planned</Badge>
          </Card>
        ))}
      </div>
    </>
  );
}
export function AnalyticsPage({ occupancy = false }: { occupancy?: boolean }) {
  return (
    <>
      <PageHeading
        eyebrow="TRANSPORT INTELLIGENCE"
        title={occupancy ? "Seat occupancy" : "Fleet analytics"}
        description={
          occupancy
            ? "A preview of computer vision assisted occupancy reporting."
            : "A foundation for understanding fleet utilization and service performance."
        }
      />
      <div className="notice">
        <Construction size={20} />
        <div>
          <strong>
            {occupancy
              ? "Computer vision model under training and testing"
              : "Illustrative analytics"}
          </strong>
          <p>
            {occupancy
              ? "These estimates are simulated. Raspberry Pi and production camera integration are in progress."
              : "This chart uses a fixed sample dataset. Historical telemetry collection is not connected."}
          </p>
        </div>
      </div>
      <div className="bottom-grid">
        <OccupancyChart />
        <SystemStatus />
      </div>
      {occupancy && <VehiclesPageTable />}
    </>
  );
}
function VehiclesPageTable() {
  const q = useVehicles();
  return q.data ? <FleetTable vehicles={q.data} /> : null;
}
export function PassengerHome() {
  const router = useRouter();
  const setJourney = useJourneyStore((s) => s.setJourney);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  return (
    <>
      <PageHeading
        eyebrow="MOVE WITH CONFIDENCE"
        title="A better way around Dhaka."
        description="Find your route. See your bus. Plan your next journey."
      />
      <div className="passenger-hero">
        <div className="passenger-intro">
          <Badge tone="blue">Passenger application preview</Badge>
          <h2>
            Your city.
            <br />
            Better connected.
          </h2>
          <p>
            Building a clearer, more reliable public transport experience for
            Bangladesh.
          </p>
          <div className="hero-detail">
            <BusFront size={20} />
            <span>Real-time information starts with connected vehicles.</span>
          </div>
        </div>
        <Card className="journey-planner">
          <h2>Where are you heading?</h2>
          <p>Explore our sample route network.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setJourney(origin.trim(), destination.trim());
              router.push("/app/routes");
            }}
          >
            <label>
              <span>
                <MapPin size={15} />
                From
              </span>
              <Input
                placeholder="e.g. Uttara"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </label>
            <label>
              <span>
                <MapPin size={15} />
                To
              </span>
              <Input
                placeholder="e.g. Motijheel"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </label>
            <Button type="submit">
              <Search size={17} />
              Explore routes
            </Button>
          </form>
          <small>Route preview only · Booking is not yet available</small>
        </Card>
      </div>
      <div className="feature-outline">
        {[
          {
            icon: MapPin,
            title: "Know where your bus is",
            text: "Explore simulated locations in the live map preview.",
            href: "/app/live",
            action: "View live map",
          },
          {
            icon: Route,
            title: "Find a familiar route",
            text: "Browse sample corridors across Dhaka.",
            href: "/app/routes",
            action: "Explore routes",
          },
          {
            icon: Clock,
            title: "Your journeys, organized",
            text: "A home for digital tickets when booking launches.",
            href: "/app/tickets",
            action: "View ticket preview",
          },
        ].map((f) => (
          <Card key={f.title}>
            <f.icon size={23} />
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <Link className="text-link" href={f.href}>
              {f.action}
              <ChevronRight size={15} />
            </Link>
          </Card>
        ))}
      </div>
      <div className="notice">
        <Radio size={20} />
        <div>
          <strong>A platform in development</strong>
          <p>
            GPS transmission is working in the hardware prototype. Passenger
            services, seat estimates, and bookings are not connected to
            production hardware.
          </p>
        </div>
      </div>
    </>
  );
}
export function PassengerLive() {
  return <Dashboard fleetOnly passenger />;
}
