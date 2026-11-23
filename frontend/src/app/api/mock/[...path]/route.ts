import { createTrackingSnapshot } from "@/mocks/tracking";
import { nearbyVehicles, passengerRoutes } from "@/mocks/passenger";
import { vehicles, routes, overview } from "@/mocks/data";
const resources: Record<string, unknown> = {
  "vehicles/nearby": nearbyVehicles,
  vehicles,
  routes,
  overview,
  trips: [],
  bookings: [],
  occupancy: vehicles
    .filter((v) => v.occupancy !== null)
    .map((v) => ({
      vehicleId: v.id,
      occupied: v.occupancy,
      capacity: 40,
      observedAt: "2026-11-23T03:42:00Z",
      source: "simulated",
      confidence: null,
    })),
  "users/me": {
    id: 0,
    username: "demo",
    first_name: "Demo",
    last_name: "Passenger",
    role: "passenger",
  },
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const key = (await params).path.join("/");
  if (key === "tracking")
    return Response.json(createTrackingSnapshot(), {
      headers: { "Cache-Control": "no-store" },
    });
  if (
    key === "routes" &&
    new URL(request.url).searchParams.get("audience") === "passenger"
  ) {
    const popular = new URL(request.url).searchParams.get("popular") === "true";
    return Response.json(
      popular
        ? passengerRoutes.filter((route) => route.popular)
        : passengerRoutes,
    );
  }
  if (key.startsWith("vehicles/") && key !== "vehicles/nearby") {
    const vehicle = nearbyVehicles.find(
      (vehicle) => key === `vehicles/${vehicle.id}`,
    );
    return vehicle
      ? Response.json(vehicle)
      : Response.json({ detail: "Vehicle not found" }, { status: 404 });
  }
  if (!Object.hasOwn(resources, key))
    return Response.json({ detail: "Unknown mock resource" }, { status: 404 });
  return Response.json(resources[key]);
}
