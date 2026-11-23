"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";
import { BusFront, Flag, MapPin } from "lucide-react";
import type {
  Coordinate,
  TrackingSnapshot,
  TrackingVehicle,
} from "@/types/tracking";
import { animatePosition } from "@/lib/tracking/interpolate";
import "leaflet/dist/leaflet.css";
export interface LiveMapHandle {
  recenter: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitRoute: () => void;
}
type Props = {
  snapshot: TrackingSnapshot;
  vehicles: TrackingVehicle[];
  selectedId: string | null;
  following: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  onUserPan: () => void;
};
export const LiveMap = forwardRef<LiveMapHandle, Props>(function LiveMap(
  {
    snapshot,
    vehicles,
    selectedId,
    following,
    reducedMotion,
    onSelect,
    onUserPan,
  },
  ref,
) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const cancellations = useRef(new Map<string, () => void>());
  const selected = useRef(selectedId);
  const follow = useRef(following);
  const callbacks = useRef({ onSelect, onUserPan });
  const activeRoute = useRef<L.LayerGroup | null>(null);
  const fit = useRef<() => void>(() => {});
  const [tileError, setTileError] = useState(false);
  const [zoom, setZoom] = useState(11);
  useEffect(() => {
    selected.current = selectedId;
    follow.current = following;
    callbacks.current = { onSelect, onUserPan };
  }, [selectedId, following, onSelect, onUserPan]);
  useImperativeHandle(
    ref,
    () => ({
      recenter: () =>
        map.current?.setView(snapshot.passengerLocation, 15, {
          animate: !reducedMotion,
        }),
      zoomIn: () => map.current?.zoomIn(),
      zoomOut: () => map.current?.zoomOut(),
      fitRoute: () => fit.current(),
    }),
    [snapshot, reducedMotion],
  );
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([24.65, 90.405], 11);
    map.current = instance;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    })
      .on("tileerror", () => setTileError(true))
      .addTo(instance);
    const roots: Root[] = [];
    for (const vehicle of snapshot.vehicles) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tracking-bus-pin";
      button.setAttribute("aria-label", `Select ${vehicle.id}`);
      button.setAttribute("aria-pressed", "false");
      button.dataset.vehicleId = vehicle.id;
      const root = createRoot(button);
      roots.push(root);
      root.render(
        <>
          <BusFront size={20} aria-hidden />
          <span className="tracking-bus-label">{vehicle.id}</span>
        </>,
      );
      button.addEventListener("click", () =>
        callbacks.current.onSelect(vehicle.id),
      );
      L.DomEvent.disableClickPropagation(button);
      const marker = L.marker(vehicle.position, {
        icon: L.divIcon({
          html: button,
          className: "tracking-marker",
          iconSize: [42, 58],
          iconAnchor: [21, 21],
        }),
        keyboard: false,
      }).addTo(instance);
      markers.current.set(vehicle.id, marker);
      buttons.current.set(vehicle.id, button);
    }
    L.circleMarker(snapshot.passengerLocation, {
      radius: 16,
      color: "#1473E6",
      weight: 1,
      opacity: 0.25,
      fillColor: "#1473E6",
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(instance);
    L.circleMarker(snapshot.passengerLocation, {
      radius: 7,
      color: "#fff",
      weight: 3,
      fillColor: "#1473E6",
      fillOpacity: 1,
    })
      .bindTooltip("You · demo location", {
        permanent: true,
        direction: "left",
        offset: [-12, 0],
        className: "tracking-place-label tracking-passenger-label",
      })
      .addTo(instance);
    instance.on("dragstart", () => {
      follow.current = false;
      callbacks.current.onUserPan();
    });
    instance.on("zoomend", () => setZoom(instance.getZoom()));
    const observer = new ResizeObserver(() =>
      instance.invalidateSize({ pan: false }),
    );
    observer.observe(container.current);
    const markerCollection = markers.current;
    const buttonCollection = buttons.current;
    const animationCollection = cancellations.current;
    return () => {
      observer.disconnect();
      for (const cancel of animationCollection.values()) cancel();
      animationCollection.clear();
      markerCollection.clear();
      buttonCollection.clear();
      instance.remove();
      map.current = null;
      queueMicrotask(() => roots.forEach((root) => root.unmount()));
    };
  }, [snapshot]);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    activeRoute.current?.remove();
    const vehicle = snapshot.vehicles.find(
      (vehicle) => vehicle.id === selectedId,
    );
    const route =
      snapshot.routes.find((route) => route.id === vehicle?.routeId) ??
      snapshot.routes[0];
    if (!route) return;
    const group = L.layerGroup().addTo(instance);
    activeRoute.current = group;
    L.polyline(route.points, {
      color: "#fff",
      weight: 8,
      opacity: 0.9,
      interactive: false,
    }).addTo(group);
    L.polyline(route.points, {
      color: "#1473E6",
      weight: 4,
      opacity: 0.9,
      interactive: false,
    }).addTo(group);
    for (const stop of route.stops) {
      L.circleMarker(stop.position, {
        radius: 5,
        color: "#1473E6",
        weight: 2,
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .bindTooltip(stop.name, {
          permanent: true,
          direction: stop.id === "jkkniu" ? "top" : "right",
          offset: stop.id === "jkkniu" ? [0, -8] : [9, 0],
          className: "tracking-place-label",
        })
        .addTo(group);
    }
    const flag = document.createElement("div");
    flag.className = "tracking-destination-pin";
    const flagRoot = createRoot(flag);
    flagRoot.render(<Flag size={17} aria-hidden />);
    L.marker(route.destination.position, {
      icon: L.divIcon({
        html: flag,
        className: "tracking-destination",
        iconSize: [30, 34],
        iconAnchor: [15, 30],
      }),
      keyboard: false,
    })
      .bindTooltip(`Destination · ${route.destination.name}`, {
        permanent: true,
        direction: "left",
        offset: [-14, -16],
        className: "tracking-place-label tracking-destination-label",
      })
      .addTo(group);
    fit.current = () => {
      const height = instance.getSize().y;
      instance.fitBounds(
        L.latLngBounds([
          ...route.points,
          snapshot.passengerLocation,
          ...snapshot.vehicles.map((vehicle) => vehicle.position),
        ]),
        {
          paddingTopLeft: [40, 120],
          paddingBottomRight: [
            85,
            selectedId ? Math.min(370, height * 0.6) : 50,
          ],
          maxZoom: 14,
          animate: false,
        },
      );
    };
    if (!follow.current) fit.current();
    return () => {
      group.remove();
      queueMicrotask(() => flagRoot.unmount());
    };
  }, [snapshot, selectedId]);
  useEffect(() => {
    for (const vehicle of vehicles) {
      const marker = markers.current.get(vehicle.id);
      if (!marker) continue;
      const current = marker.getLatLng();
      if (
        current.lat === vehicle.position.lat &&
        current.lng === vehicle.position.lng
      )
        continue;
      cancellations.current.get(vehicle.id)?.();
      const cancel = animatePosition(
        { lat: current.lat, lng: current.lng },
        vehicle.position,
        (position: Coordinate) => {
          marker.setLatLng(position);
          if (follow.current && selected.current === vehicle.id)
            map.current?.panTo(position, { animate: false, noMoveStart: true });
        },
        { reducedMotion },
      );
      cancellations.current.set(vehicle.id, cancel);
    }
  }, [vehicles, reducedMotion]);
  useEffect(() => {
    for (const [id, button] of buttons.current) {
      button.classList.toggle("is-selected", id === selectedId);
      button.setAttribute("aria-pressed", String(id === selectedId));
      markers.current.get(id)?.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
  }, [selectedId]);
  useEffect(() => {
    if (!following || !selectedId || !map.current) return;
    const marker = markers.current.get(selectedId);
    if (marker)
      map.current.setView(
        marker.getLatLng(),
        Math.max(map.current.getZoom(), 14),
        { animate: !reducedMotion },
      );
  }, [following, selectedId, reducedMotion]);
  return (
    <>
      <div
        className="tracking-map-canvas"
        ref={container}
        aria-label="Tracking map: passenger location, bus stops, buses, route, and destination"
        data-zoom={zoom}
      />
      {tileError && (
        <div className="tracking-tile-warning" role="status">
          <MapPin size={14} />
          <span>
            Map tiles unavailable. Demo markers and route remain visible.
          </span>
        </div>
      )}
    </>
  );
});
