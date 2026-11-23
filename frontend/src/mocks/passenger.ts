import type { NearbyVehicle } from "@/types/passenger";
import type { TransitRoute } from "@/types/transit";
export const nearbyVehicles: NearbyVehicle[] = [
  {
    id: "BUS-06",
    routeId: "P01",
    from: "JKKNIU",
    to: "Mymensingh",
    distanceKm: 1.2,
    etaMinutes: 6,
    availableSeats: 8,
    status: "Approaching",
  },
  {
    id: "BUS-12",
    routeId: "P04",
    from: "Trishal",
    to: "Mymensingh",
    distanceKm: 2.8,
    etaMinutes: 12,
    availableSeats: 15,
    status: "On Route",
  },
  {
    id: "BUS-19",
    routeId: "P05",
    from: "JKKNIU",
    to: "Netrokona",
    distanceKm: 4.1,
    etaMinutes: 18,
    availableSeats: 5,
    status: "On Route",
  },
];
// Fares, schedules, and stops remain unpublished; only the requested route names are fixtures.
export const passengerRoutes: TransitRoute[] = [
  {
    id: "P01",
    name: "University connection",
    from: "JKKNIU",
    to: "Mymensingh",
    popular: true,
  },
  {
    id: "P02",
    name: "Dhaka connection",
    from: "Trishal",
    to: "Dhaka",
    popular: true,
  },
  {
    id: "P03",
    name: "Netrokona connection",
    from: "Mymensingh",
    to: "Netrokona",
    popular: true,
  },
  { id: "P04", name: "Trishal connection", from: "Trishal", to: "Mymensingh" },
  { id: "P05", name: "University connection", from: "JKKNIU", to: "Netrokona" },
];
