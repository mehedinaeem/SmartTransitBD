"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BusFront,
  Radio,
  Users,
  TriangleAlert,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  Search,
  SlidersHorizontal,
  MapPin,
  CircleCheck,
  Cpu,
  Satellite,
  Signal,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useVehicles } from "@/hooks/use-transit";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  ErrorState,
  Input,
  Skeleton,
} from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { activity } from "@/mocks/data";
import type { Vehicle } from "@/types/transit";
const TransitMap = dynamic(
  () => import("@/components/transit-map").then((m) => m.TransitMap),
  { ssr: false, loading: () => <Skeleton className="map-skeleton" /> },
);
const chartData = [
  { time: "06:00", passengers: 12 },
  { time: "08:00", passengers: 31 },
  { time: "10:00", passengers: 24 },
  { time: "12:00", passengers: 29 },
  { time: "14:00", passengers: 22 },
  { time: "16:00", passengers: 36 },
  { time: "18:00", passengers: 32 },
  { time: "20:00", passengers: 18 },
  { time: "22:00", passengers: 9 },
];
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function FleetTable({
  vehicles,
  compact = false,
}: {
  vehicles: Vehicle[];
  compact?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const filtered = vehicles.filter(
    (v) =>
      `${v.id} ${v.registration} ${v.destination}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" || v.status === status),
  );
  return (
    <Card className="fleet-card">
      <div className="section-header">
        <div>
          <h2>
            {compact ? "Fleet at a glance" : "Vehicle directory"}{" "}
            <span className="count">{vehicles.length} vehicles</span>
          </h2>
          <p>Sample vehicle telemetry across your routes</p>
        </div>
        {compact ? (
          <Link className="text-link" href="/operator/vehicles">
            View all vehicles <ChevronRight size={15} />
          </Link>
        ) : (
          <Badge tone="blue">Demo fleet</Badge>
        )}
      </div>
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} />
          <Input
            aria-label="Search vehicles"
            placeholder="Search vehicle or route…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="select-control">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All statuses", "Moving", "At stop", "Offline"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>VEHICLE</th>
              <th>ASSIGNED ROUTE</th>
              <th>STATUS</th>
              <th>SEAT OCCUPANCY</th>
              <th>LAST UPDATE</th>
              <th>
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div className="vehicle-cell">
                    <span className="vehicle-icon">
                      <BusFront size={18} />
                    </span>
                    <div>
                      <strong>{v.id}</strong>
                      <small>{v.registration}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="route-id">{v.route}</span>
                  <span>{v.destination}</span>
                </td>
                <td>
                  <Badge
                    tone={
                      v.status === "Moving"
                        ? "success"
                        : v.status === "Offline"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {v.status}
                  </Badge>
                </td>
                <td>
                  {v.occupancy === null ? (
                    <span className="muted">Unavailable</span>
                  ) : (
                    <div className="occupancy-cell">
                      <div className="progress">
                        <span
                          style={{
                            width: `${(v.occupancy / 40) * 100}%`,
                            background:
                              v.occupancy > 30 ? "#F59E0B" : "#1473E6",
                          }}
                        />
                      </div>
                      <span>
                        {v.occupancy}
                        <span className="muted"> / 40</span>
                      </span>
                    </div>
                  )}
                </td>
                <td className="muted">{v.updated}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${v.id} details`}
                    onClick={() => setSelected(v)}
                  >
                    <MoreHorizontal size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="no-results">No vehicles match your search.</div>
        )}
      </div>
      <div className="table-footer">
        Showing {filtered.length} of {vehicles.length} sample vehicles
        <span>Occupancy is a model preview</span>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.id ?? "Vehicle"}
        description="Simulated telemetry · Hardware is not connected to this application."
      >
        {selected && (
          <dl className="detail-list">
            <dt>Registration</dt>
            <dd>{selected.registration}</dd>
            <dt>Route</dt>
            <dd>{selected.destination}</dd>
            <dt>Status</dt>
            <dd>{selected.status}</dd>
            <dt>Speed</dt>
            <dd>{selected.speed} km/h</dd>
            <dt>Seat estimate</dt>
            <dd>{selected.occupancy ?? "Unavailable"} / 40</dd>
          </dl>
        )}
      </Dialog>
    </Card>
  );
}
export function OccupancyChart() {
  return (
    <Card>
      <div className="section-header">
        <div>
          <h2>Passenger activity</h2>
          <p>Illustrative average occupied seats per vehicle</p>
        </div>
        <Badge>Sample day</Badge>
      </div>
      <div className="chart-summary">
        <strong>
          26<span> / 40 seats</span>
        </strong>
        <span className="chart-legend">
          <i />
          Average occupancy
        </span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ left: -22, right: 18, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1473E6" stopOpacity={0.17} />
                <stop offset="100%" stopColor="#1473E6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              vertical={false}
              stroke="#e9edf3"
            />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#667085" }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 40]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#667085" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 6,
                border: "1px solid #e4e7ec",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="passengers"
              name="Occupied seats"
              stroke="#1473E6"
              strokeWidth={2.5}
              fill="url(#occupancyFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
export function SystemStatus() {
  return (
    <Card>
      <div className="section-header">
        <div>
          <h2>Integration readiness</h2>
          <p>Actual project development status</p>
        </div>
        <Cpu size={18} className="muted" />
      </div>
      <div className="system-list">
        {[
          [Satellite, "GPS / GNSS prototype", "Working", "success"],
          [Signal, "Cellular transmission", "Working", "success"],
          [Users, "Seat occupancy model", "Testing", "warning"],
          [Cpu, "Raspberry Pi integration", "In progress", "blue"],
        ].map(([Icon, label, status, tone]) => {
          const I = Icon as typeof Cpu;
          return (
            <div key={String(label)}>
              <I size={18} />
              <span>{String(label)}</span>
              <Badge tone={tone as "success" | "warning" | "blue"}>
                {String(status)}
              </Badge>
            </div>
          );
        })}
      </div>
      <div className="integration-note">
        <CircleCheck size={16} />
        <span>Application connection is the next milestone.</span>
      </div>
    </Card>
  );
}
export function Dashboard({
  fleetOnly = false,
  passenger = false,
}: {
  fleetOnly?: boolean;
  passenger?: boolean;
}) {
  const query = useVehicles();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
    toast.success("Demo fleet data refreshed");
  };
  return (
    <div>
      <PageHeading
        eyebrow={passenger ? "PASSENGER MAP" : "OPERATIONS CENTER"}
        title={
          passenger
            ? "Live bus preview"
            : fleetOnly
              ? "Live fleet"
              : "Fleet overview"
        }
        description={
          passenger
            ? "Explore simulated buses across Dhaka. Locations are not live."
            : fleetOnly
              ? "A location-first view of your demonstration fleet."
              : "A clear view of your fleet. A better journey for everyone."
        }
      >
        <span className="date-label">
          <CalendarDays size={16} />
          23 Nov 2026
        </span>
        <Button variant="outline" onClick={refresh} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? "spinning" : ""} />
          Refresh
        </Button>
      </PageHeading>
      {query.isPending ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="stat-skeleton" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState retry={() => query.refetch()} />
      ) : (
        <>
          <div className="stats-grid">
            {[
              {
                label: "Total vehicles",
                value: "05",
                suffix: "in demo fleet",
                icon: BusFront,
                foot: "Across 3 assigned routes",
                color: "blue",
              },
              {
                label: "On the road",
                value: "04",
                suffix: "vehicles online",
                icon: Radio,
                foot: "3 moving · 1 at stop",
                color: "success",
              },
              {
                label: "Average occupancy",
                value: "62",
                suffix: "% of seats",
                icon: Users,
                foot: "Model preview · 40-seat vehicles",
                color: "blue",
              },
              {
                label: "Needs attention",
                value: "02",
                suffix: "open alerts",
                icon: TriangleAlert,
                foot: "1 connection · 1 high occupancy",
                color: "warning",
              },
            ].map((s) => (
              <Card key={s.label} className="stat-card">
                <div className="stat-label">
                  {s.label}
                  <span className={`stat-icon ${s.color}`}>
                    <s.icon size={18} />
                  </span>
                </div>
                <div className="stat-value">
                  {s.value}
                  <span>{s.suffix}</span>
                </div>
                <div className="stat-foot">{s.foot}</div>
              </Card>
            ))}
          </div>
          <div className="overview-grid">
            <Card className="map-card">
              <div className="section-header">
                <div>
                  <h2>
                    Fleet location <Badge tone="blue">Simulated</Badge>
                  </h2>
                  <p>
                    <MapPin size={13} /> Dhaka, Bangladesh
                  </p>
                </div>
                <Link
                  href={passenger ? "/app/routes" : "/operator/fleet"}
                  className="text-link"
                >
                  {passenger ? "Explore routes" : "Expand map"}{" "}
                  <ChevronRight size={15} />
                </Link>
              </div>
              <TransitMap vehicles={query.data} />
              <div className="map-footer">
                <span>
                  <i className="legend-dot blue" />
                  Moving <b>3</b>
                </span>
                <span>
                  <i className="legend-dot amber" />
                  At stop <b>1</b>
                </span>
                <span>
                  <i className="legend-dot gray" />
                  Offline <b>1</b>
                </span>
                <span className="map-foot-right">5 sample vehicles</span>
              </div>
            </Card>
            <Card className="activity-card">
              <div className="section-header">
                <div>
                  <h2>Activity feed</h2>
                  <p>Latest sample fleet events</p>
                </div>
                <span className="activity-dot" />
              </div>
              <div className="activity-list">
                {activity.map((a, i) => (
                  <div className="activity-item" key={a.time}>
                    <span
                      className={`event-icon ${a.type === "warning" ? "warning" : ""}`}
                    >
                      {a.type === "warning" ? (
                        <TriangleAlert size={16} />
                      ) : i === 0 ? (
                        <MapPin size={16} />
                      ) : (
                        <Users size={16} />
                      )}
                    </span>
                    <div>
                      <time>{a.time} BST</time>
                      <strong>{a.title}</strong>
                      <p>{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={passenger ? "/app/routes" : "/operator/alerts"}
                className="activity-link"
              >
                {passenger ? "View routes" : "View alerts"}{" "}
                <ChevronRight size={15} />
              </Link>
            </Card>
          </div>
          {!fleetOnly && (
            <>
              <FleetTable vehicles={query.data} compact />
              <div className="bottom-grid">
                <OccupancyChart />
                <SystemStatus />
              </div>
            </>
          )}
        </>
      )}
      <div className="foundation-note">
        <Radio size={15} />
        <span>From prototype to platform</span>
        <p>
          GPS hardware is working. Production telemetry and booking integration
          are still ahead.
        </p>
      </div>
    </div>
  );
}
