import type {
  Coordinate,
  TrackingSnapshot,
  TrackingRoute,
} from "@/types/tracking";
// Illustrative coordinates only. These are not surveyed stops or a routing-engine result.
export const bus06SimulationPath: Coordinate[] = [
  { lat: 24.578, lng: 90.3849 },
  { lat: 24.57822, lng: 90.38494 },
  { lat: 24.57844, lng: 90.38498 },
  { lat: 24.57866, lng: 90.38502 },
  { lat: 24.57888, lng: 90.38506 },
  { lat: 24.5791, lng: 90.3851 },
  { lat: 24.57932, lng: 90.38514 },
  { lat: 24.57954, lng: 90.38518 },
  { lat: 24.57976, lng: 90.38522 },
  { lat: 24.57998, lng: 90.38526 },
  { lat: 24.5802, lng: 90.3853 },
  { lat: 24.58042, lng: 90.38534 },
  { lat: 24.58064, lng: 90.38538 },
  { lat: 24.58086, lng: 90.38542 },
  { lat: 24.58108, lng: 90.38546 },
];
const campus = {
  id: "jkkniu",
  name: "JKKNIU",
  position: { lat: 24.5786, lng: 90.3748 },
};
const trishal = {
  id: "trishal",
  name: "Trishal",
  position: { lat: 24.5824, lng: 90.3948 },
};
const bailor = {
  id: "bailor",
  name: "Bailor",
  position: { lat: 24.6284, lng: 90.3987 },
};
const chourasta = {
  id: "chourasta",
  name: "Chourasta",
  position: { lat: 24.6958, lng: 90.404 },
};
const mymensingh = {
  id: "mymensingh",
  name: "Mymensingh",
  position: { lat: 24.7471, lng: 90.4203 },
};
const netrokona = {
  id: "netrokona",
  name: "Netrokona",
  position: { lat: 24.8831, lng: 90.7316 },
};
const corridor = [
  campus.position,
  { lat: 24.578, lng: 90.38 },
  ...bus06SimulationPath,
  trishal.position,
  { lat: 24.6021, lng: 90.3971 },
  bailor.position,
  { lat: 24.6603, lng: 90.3994 },
  chourasta.position,
  { lat: 24.719, lng: 90.4113 },
  mymensingh.position,
];
const routes: TrackingRoute[] = [
  {
    id: "P01",
    from: "JKKNIU",
    to: "Mymensingh",
    points: corridor,
    stops: [campus, trishal, bailor, chourasta],
    destination: mymensingh,
  },
  {
    id: "P04",
    from: "Trishal",
    to: "Mymensingh",
    points: corridor.slice(corridor.indexOf(trishal.position)),
    stops: [trishal, bailor, chourasta],
    destination: mymensingh,
  },
  {
    id: "P05",
    from: "JKKNIU",
    to: "Netrokona",
    points: [
      ...corridor,
      { lat: 24.79, lng: 90.482 },
      { lat: 24.832, lng: 90.59 },
      netrokona.position,
    ],
    stops: [campus, trishal, mymensingh],
    destination: netrokona,
  },
];
export function createTrackingSnapshot(now = Date.now()): TrackingSnapshot {
  return {
    mode: "simulation",
    passengerLocation: { lat: 24.5801, lng: 90.3759 },
    routes,
    vehicles: [
      {
        id: "BUS-06",
        routeId: "P01",
        from: "JKKNIU",
        to: "Mymensingh",
        position: bus06SimulationPath[0],
        recordedAt: new Date(now - 5000).toISOString(),
        etaMinutes: 6,
        distanceKm: 3.2,
        speedKmh: 32,
        availableSeats: 8,
        nextStop: "Trishal",
      },
      {
        id: "BUS-12",
        routeId: "P04",
        from: "Trishal",
        to: "Mymensingh",
        position: { lat: 24.622, lng: 90.3985 },
        recordedAt: new Date(now - 4000).toISOString(),
        etaMinutes: 12,
        distanceKm: 2.8,
        speedKmh: 26,
        availableSeats: 15,
        nextStop: "Bailor",
      },
      {
        id: "BUS-19",
        routeId: "P05",
        from: "JKKNIU",
        to: "Netrokona",
        position: { lat: 24.686, lng: 90.403 },
        recordedAt: new Date(now - 7000).toISOString(),
        etaMinutes: 18,
        distanceKm: 4.1,
        speedKmh: 28,
        availableSeats: 5,
        nextStop: "Mymensingh",
      },
    ],
  };
}
