import { BookingStart } from "@/features/passenger/booking-start";
export const metadata = { title: "Booking checkout" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string; seat?: string }>;
}) {
  const params = await searchParams;
  return (
    <BookingStart
      key={`${params.trip}:${params.seat}`}
      tripId={params.trip ?? ""}
      seatId={params.seat ?? ""}
    />
  );
}
