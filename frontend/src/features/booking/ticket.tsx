"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  BusFront,
  ChevronLeft,
  Info,
  Navigation,
  Download,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTicket } from "@/hooks/use-bookings";
import { paymentMethodLabel } from "@/lib/payments/methods";
import { formatJourneyDate, formatDepartureTime } from "@/lib/dates";
import { formatFare } from "@/lib/seats";
import { createTicketQr } from "@/lib/tickets/qr";
import { downloadTicket } from "@/lib/tickets/download";
import {
  ticketQrPayload,
  ticketTrackingHref,
  TICKET_STATUS_LABELS,
} from "@/lib/tickets/details";
import type { TicketRecord } from "@/types/booking";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
export function BookingTicket({ id }: { id: string }) {
  const query = useTicket(id);
  return (
    <div className="digital-ticket-page">
      <Link href="/app/tickets" className="passenger-back-link">
        <ChevronLeft size={17} />
        My tickets
      </Link>
      {query.isPending ? (
        <div role="status" aria-label="Loading ticket">
          <Skeleton className="digital-ticket-loading" />
          <span className="sr-only">Loading ticket…</span>
        </div>
      ) : query.isError ? (
        <Card>
          <ErrorState retry={() => query.refetch()} />
        </Card>
      ) : !query.data ? (
        <Card>
          <EmptyState
            title="Ticket not found"
            description="This ticket is not in the current demo. Explore your journeys to find a ticket."
          >
            <Button asChild variant="outline">
              <Link href="/app/tickets">My tickets</Link>
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <DigitalTicket ticket={query.data} />
      )}
    </div>
  );
}
function DigitalTicket({ ticket }: { ticket: TicketRecord }) {
  const [downloading, setDownloading] = useState(false);
  const payload = ticketQrPayload(ticket);
  const qr = useQuery({
    queryKey: ["tickets", "qr", payload],
    queryFn: () => createTicketQr(ticket),
    staleTime: Infinity,
    retry: 1,
  });
  const tone =
    ticket.status === "CONFIRMED"
      ? "success"
      : ticket.status === "CANCELLED"
        ? "danger"
        : "neutral";
  return (
    <>
      <header className="digital-ticket-heading">
        <div>
          <p>YOUR JOURNEY</p>
          <h1>Your ticket</h1>
        </div>
        <span>Demo ticket</span>
      </header>
      <Card className="digital-ticket">
        <header className="digital-ticket-brand">
          <div>
            <span>
              <BusFront size={22} />
            </span>
            <strong>SmartTransit BD</strong>
          </div>
          <Badge tone={tone}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
        </header>
        <div className="digital-ticket-route">
          <p>
            <span>{ticket.vehicleId}</span>
            <small>{ticket.tripId}</small>
          </p>
          <h2>
            {ticket.from} <span>→</span> {ticket.to}
          </h2>
        </div>
        <dl className="ticket-details digital-ticket-details">
          <div>
            <dt>Passenger</dt>
            <dd>{ticket.passenger.name}</dd>
          </div>
          <div>
            <dt>Seat</dt>
            <dd className="digital-ticket-seat">{ticket.seatId}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatJourneyDate(ticket.travelDate)}</dd>
          </div>
          <div>
            <dt>Departure</dt>
            <dd>{formatDepartureTime(ticket.departureTime)}</dd>
          </div>
          <div>
            <dt>Fare</dt>
            <dd>{formatFare(ticket.fare)}</dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>{paymentMethodLabel(ticket.paymentMethod)}</dd>
          </div>
        </dl>
        <div className="digital-ticket-reference">
          <span>Booking ID</span>
          <strong>{ticket.bookingId}</strong>
        </div>
        <section className="digital-ticket-qr" aria-label="Ticket QR code">
          <div>
            <h3>Ticket QR code</h3>
            <p>
              Your journey reference,
              <br />
              ready to scan.
            </p>
            <span>Demo reference only</span>
          </div>
          {qr.isPending ? (
            <Skeleton className="digital-ticket-qr-placeholder" />
          ) : qr.isError ? (
            <div className="digital-ticket-qr-error" role="alert">
              <p>Couldn’t generate the code.</p>
              <Button variant="outline" size="sm" onClick={() => qr.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <Image
              className="digital-ticket-qr-image"
              src={qr.data}
              width={168}
              height={168}
              unoptimized
              alt={`QR code for booking ${ticket.bookingId}`}
            />
          )}
        </section>
        <div className="digital-ticket-demo">
          <Info size={14} />
          <p>
            <strong>Demo ticket · Payment simulated</strong>
            <span>
              No money was charged. This is not a valid boarding pass.
            </span>
          </p>
        </div>
      </Card>
      <div className="digital-ticket-actions">
        <Button
          variant="outline"
          disabled={!qr.data || downloading}
          onClick={async () => {
            if (!qr.data) return;
            setDownloading(true);
            try {
              await downloadTicket(ticket, qr.data);
              toast.success("Ticket download started");
            } catch {
              toast.error("Unable to download the ticket. Please try again.");
            } finally {
              setDownloading(false);
            }
          }}
        >
          {downloading ? (
            <LoaderCircle className="spinning" size={16} />
          ) : (
            <Download size={16} />
          )}{" "}
          {downloading ? "Preparing ticket…" : "Download Ticket"}
        </Button>
        <Button asChild>
          <Link href={ticketTrackingHref(ticket)}>
            <Navigation size={16} />
            Track Bus
          </Link>
        </Button>
      </div>
    </>
  );
}
