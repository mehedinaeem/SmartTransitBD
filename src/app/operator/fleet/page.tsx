import { Dashboard } from "@/features/dashboard";
export const metadata = { title: "Fleet" };
export default function Page() {
  return <Dashboard fleetOnly />;
}
