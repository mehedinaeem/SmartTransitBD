"use client";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BusFront,
  ChevronLeft,
  LocateFixed,
  Plus,
  Minus,
  Navigation,
  Radio,
  Route,
  X,
} from "lucide-react";
import { useLiveTracking } from "@/hooks/use-live-tracking";
import { gpsAgeSeconds, STALE_GPS_AFTER_MS } from "@/lib/tracking/gps";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { LiveMapHandle } from "./live-map";
const LiveMap = dynamic(
  () => import("./live-map").then((module) => module.LiveMap),
  { ssr: false, loading: () => <TrackingMapSkeleton /> },
);
export function TrackingMapSkeleton() {
  return (
    <div
      className="tracking-map-loading"
      role="status"
      aria-label="Loading tracking map"
    >
      <div className="tracking-loading-surface">
        <Skeleton className="tracking-loading-icon" />
        <strong>Preparing your map</strong>
        <span>Loading buses and route information</span>
      </div>
    </div>
  );
}
export function LiveTracking({
  initialBusId = "BUS-06",
}: {
  initialBusId?: string;
}) {
  const { query, vehicles, connection, now } = useLiveTracking();
  const [selectedId, setSelectedId] = useState<string | null>(initialBusId);
  const [following, setFollowing] = useState(false);
  const reducedMotion = useReducedMotion();
  const map = useRef<LiveMapHandle>(null);
  const onSelect = useCallback((id: string) => setSelectedId(id), []);
  const onUserPan = useCallback(() => setFollowing(false), []);
  const selected = vehicles.find((vehicle) => vehicle.id === selectedId);
  const age = selected ? gpsAgeSeconds(selected.recordedAt, now) : 0;
  const fresh = selected && age * 1000 < STALE_GPS_AFTER_MS;
  const status =
    connection === "live"
      ? fresh
        ? "Live"
        : "Delayed"
      : connection === "connecting"
        ? "Connecting"
        : "Offline";
  return (
    <div className="live-tracking-stage">
      <h1 className="sr-only">Live tracking</h1>
      {query.isPending ? (
        <TrackingMapSkeleton />
      ) : query.isError ? (
        <div className="tracking-state">
          <Card>
            <ErrorState retry={() => query.refetch()} />
            <Link href="/app" className="tracking-back-link">
              Back to passenger home
            </Link>
          </Card>
        </div>
      ) : query.data.vehicles.length === 0 || query.data.routes.length === 0 ? (
        <div className="tracking-state">
          <Card>
            <EmptyState
              title="No buses to track"
              description="Live tracking will appear when vehicles are available."
            >
              <Button asChild variant="outline">
                <Link href="/app">Passenger home</Link>
              </Button>
            </EmptyState>
          </Card>
        </div>
      ) : (
        <>
          <LiveMap
            ref={map}
            snapshot={query.data}
            vehicles={vehicles}
            selectedId={selectedId}
            following={following}
            reducedMotion={Boolean(reducedMotion)}
            onSelect={onSelect}
            onUserPan={onUserPan}
          />
          <div className="tracking-top">
            <header className="tracking-heading-surface">
              <Link
                href="/app"
                className="tracking-home-button"
                aria-label="Back to passenger home"
              >
                <ChevronLeft size={20} />
              </Link>
              <div>
                <strong>Live tracking</strong>
                <p>
                  {selected
                    ? `${selected.from} → ${selected.to}`
                    : "Select a bus to see its route"}
                </p>
              </div>
              <Badge tone="blue">
                {query.data.mode === "simulation"
                  ? "Simulated GPS"
                  : "GPS feed"}
              </Badge>
            </header>
            <div
              className="tracking-bus-selector"
              role="group"
              aria-label="Select a bus"
            >
              {vehicles.map((vehicle) => (
                <button
                  type="button"
                  key={vehicle.id}
                  aria-pressed={selectedId === vehicle.id}
                  onClick={() => onSelect(vehicle.id)}
                >
                  <BusFront size={14} />
                  {vehicle.id}
                </button>
              ))}
            </div>
          </div>
          <div
            className="tracking-map-controls"
            role="group"
            aria-label="Map controls"
          >
            <div className="tracking-zoom-controls">
              <button
                type="button"
                onClick={() => map.current?.zoomIn()}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <Plus size={19} />
              </button>
              <button
                type="button"
                onClick={() => map.current?.zoomOut()}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <Minus size={19} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setFollowing(false);
                map.current?.recenter();
              }}
              aria-label="Recenter on passenger"
              title="Recenter on passenger"
            >
              <LocateFixed size={19} />
            </button>
            <button
              type="button"
              onClick={() => setFollowing((current) => !current)}
              disabled={!selected}
              aria-pressed={following}
              className={following ? "is-active" : ""}
              aria-label="Follow selected bus"
              title="Follow selected bus"
            >
              <Navigation size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setFollowing(false);
                map.current?.fitRoute();
              }}
              aria-label="Show entire route"
              title="Show entire route"
            >
              <Route size={18} />
            </button>
          </div>
          <div className="tracking-map-legend" aria-label="Map legend">
            <span>
              <i className="tracking-you-dot" />
              You
            </span>
            <span>
              <i className="tracking-stop-dot" />
              Stop
            </span>
            <span>
              <i className="tracking-route-line" />
              Route
            </span>
          </div>
          <AnimatePresence mode="wait">
            {selected && (
              <motion.section
                key={selected.id}
                className="tracking-selected-panel"
                aria-label="Selected bus"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <header>
                  <span className="tracking-panel-bus-icon">
                    <BusFront size={21} />
                  </span>
                  <div>
                    <h2>{selected.id}</h2>
                    <p>
                      {selected.from} → {selected.to}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="tracking-panel-close"
                    aria-label="Deselect bus"
                    onClick={() => {
                      setSelectedId(null);
                      setFollowing(false);
                    }}
                  >
                    <X size={17} />
                  </button>
                </header>
                <dl className="tracking-panel-metrics">
                  <div>
                    <dt>ETA</dt>
                    <dd>
                      {selected.etaMinutes}
                      <span> min</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Distance</dt>
                    <dd>
                      {selected.distanceKm.toFixed(1)}
                      <span> km</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Speed</dt>
                    <dd>
                      {selected.speedKmh}
                      <span> km/h</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Available Seats</dt>
                    <dd className="tracking-seat-value">
                      {selected.availableSeats}
                    </dd>
                  </div>
                  <div>
                    <dt>Next Stop</dt>
                    <dd>{selected.nextStop}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd className="tracking-age">{age} sec ago</dd>
                  </div>
                </dl>
                <footer>
                  <div className="tracking-connection">
                    <span>Connection</span>
                    <strong className={status === "Live" ? "is-live" : ""}>
                      <i />
                      {status}
                    </strong>
                  </div>
                  <Button asChild>
                    <Link href={`/app/bus/${encodeURIComponent(selected.id)}`}>
                      View Bus
                    </Link>
                  </Button>
                </footer>
              </motion.section>
            )}
          </AnimatePresence>
          <div className="tracking-simulation-note">
            <Radio size={12} />
            {query.data.mode === "simulation"
              ? "Development simulation · not connected to hardware"
              : "Vehicle telemetry · location may be delayed"}
          </div>
        </>
      )}
    </div>
  );
}
