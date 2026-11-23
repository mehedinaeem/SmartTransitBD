import { routes } from "@/mocks/data";
export function GET() {
  return Response.json(routes);
}
