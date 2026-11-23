"use client";
import { useEffect, useRef, useState } from "react";
import type { Vehicle } from "@/types/transit";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
export function TransitMap({ vehicles }: { vehicles: Vehicle[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false }).setView(
        [23.781, 90.389],
        12,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
        .on("tileerror", () => setFailed(true))
        .addTo(map);
      L.polyline(
        [
          [23.866, 90.4],
          [23.818, 90.401],
          [23.791, 90.401],
          [23.762, 90.389],
          [23.727, 90.419],
        ],
        { color: "#1473e6", weight: 4, opacity: 0.65, dashArray: "7 7" },
      ).addTo(map);
      vehicles.forEach((v) => {
        const marker = L.divIcon({
          className: "bus-marker-wrap",
          html: `<div class="bus-marker ${v.status === "Offline" ? "offline" : v.status === "At stop" ? "at-stop" : ""}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 10h14M8 19v2m8-2v2M9 14h.01M15 14h.01"/></svg></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([v.lat, v.lng], { icon: marker })
          .addTo(map!)
          .bindPopup(
            `${v.id} · ${v.destination}<br>${v.status} · Simulated location`,
          );
      });
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [vehicles]);
  return (
    <div className="map-container">
      <div
        ref={container}
        className="leaflet-map"
        aria-label="Simulated vehicle locations in Dhaka"
      />
      {failed && (
        <div className="map-warning">
          <MapPin size={14} />
          Some map tiles are unavailable. Vehicle markers are simulated.
        </div>
      )}
      <div className="map-city-label">DHAKA METROPOLITAN AREA</div>
    </div>
  );
}
