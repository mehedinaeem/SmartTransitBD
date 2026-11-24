import { dhakaDateKey } from "@/lib/dates";
import { createMockSeatLayout } from "./seat-layouts";
import { countSeats } from "@/lib/seats";
import type { BusDetails, SeatPreview } from "@/types/passenger";
import { nearbyVehicles } from "./passenger";
import { createTrackingSnapshot } from "./tracking";
const itineraries: Record<
  string,
  {
    tripId: string;
    locationLabel: string;
    locationDescription: string;
    stops: BusDetails["stops"];
  }
> = {
  "BUS-06": {
    tripId: "TRIP-001",
    locationLabel: "Near JKKNIU",
    locationDescription: "Approaching Trishal",
    stops: [
      { id: "jkkniu", name: "JKKNIU", status: "completed" },
      { id: "trishal", name: "Trishal", status: "next" },
      { id: "bhaluka", name: "Bhaluka", status: "upcoming" },
      { id: "mymensingh", name: "Mymensingh", status: "destination" },
    ],
  },
  "BUS-12": {
    tripId: "TRIP-002",
    locationLabel: "North of Trishal",
    locationDescription: "Approaching Bailor",
    stops: [
      { id: "trishal", name: "Trishal", status: "completed" },
      { id: "bailor", name: "Bailor", status: "next" },
      { id: "mymensingh", name: "Mymensingh", status: "destination" },
    ],
  },
  "BUS-19": {
    tripId: "TRIP-003",
    locationLabel: "Near Chourasta",
    locationDescription: "Approaching Mymensingh",
    stops: [
      { id: "jkkniu", name: "JKKNIU", status: "completed" },
      { id: "trishal", name: "Trishal", status: "completed" },
      { id: "mymensingh", name: "Mymensingh", status: "next" },
      { id: "netrokona", name: "Netrokona", status: "destination" },
    ],
  },
};
// The requested itinerary and all positions are illustrative; this is not a routing result.
export function createBusDetails(
  id: string,
  now = Date.now(),
): BusDetails | undefined {
  const nearby = nearbyVehicles.find((vehicle) => vehicle.id === id);
  const tracking = createTrackingSnapshot(now).vehicles.find(
    (vehicle) => vehicle.id === id,
  );
  const itinerary = itineraries[id];
  if (!nearby || !tracking || !itinerary) return;
  const counts = countSeats(createMockSeatLayout(nearby.availableSeats));
  return {
    ...nearby,
    status: "On Route",
    ...itinerary,
    operator: "SmartTransit Demo Fleet",
    capacity: 40,
    occupiedSeats: counts.OCCUPIED,
    reservedSeats: counts.RESERVED,
    blockedSeats: counts.BLOCKED,
    speedKmh: tracking.speedKmh,
    position: tracking.position,
    recordedAt: tracking.recordedAt,
    deviceStatus: "Online",
    currentAfterStopId: itinerary.stops
      .filter((stop) => stop.status === "completed")
      .at(-1)!.id,
  };
}
export function createSeatPreview(tripId: string): SeatPreview | undefined {
  const entry = Object.entries(itineraries).find(
    ([, itinerary]) => itinerary.tripId === tripId,
  );
  if (!entry) return;
  const bus = createBusDetails(entry[0]);
  if (!bus) return;
  return {
    id: tripId,
    vehicleId: bus.id,
    from: bus.from,
    to: bus.to,
    capacity: 40,
    fare: 40,
    currency: "BDT",
    travelDate: dhakaDateKey(),
    departureTime: "08:30",
    seats: createMockSeatLayout(bus.availableSeats),
  };
}
