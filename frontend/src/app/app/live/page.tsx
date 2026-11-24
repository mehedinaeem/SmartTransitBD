import { LiveTracking } from "@/features/tracking/live-tracking";
export const metadata = { title: "Live tracking" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ bus?: string }>;
}) {
  const { bus } = await searchParams;
  return (
    <LiveTracking
      key={bus ?? "BUS-06"}
      initialBusId={bus && /^BUS-\d+$/.test(bus) ? bus : "BUS-06"}
    />
  );
}
