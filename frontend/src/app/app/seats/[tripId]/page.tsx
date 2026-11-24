import { SeatPreviewPage } from "@/features/passenger/seat-preview";
import { seatIdSchema } from "@/types/seats";
export const metadata = { title: "Choose your seat" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ seat?: string }>;
}) {
  const { tripId } = await params;
  const search = await searchParams;
  const seat = seatIdSchema.safeParse(search.seat);
  return (
    <SeatPreviewPage
      key={`${tripId}:${search.seat ?? ""}`}
      tripId={tripId}
      initialSeatId={seat.success ? seat.data : null}
    />
  );
}
