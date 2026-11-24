import { BookingTicket } from "@/features/booking/ticket";
export const metadata = { title: "Digital ticket" };
export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingTicket id={bookingId} />;
}
