import { vehicles } from "@/mocks/data";
export function GET() {
  return Response.json(vehicles);
}
