import { BusDetail } from "@/features/passenger/bus-detail";
export const metadata = { title: "Bus details" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BusDetail id={id} />;
}
