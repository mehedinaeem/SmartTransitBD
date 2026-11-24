"use client";
import { useState } from "react";
import Link from "next/link";
import { Ticket, ChevronRight, BusFront } from "lucide-react";
import { useTickets } from "@/hooks/use-bookings";
import { formatJourneyDate, formatDepartureTime } from "@/lib/dates";
import {
  TICKET_SECTIONS,
  TICKET_STATUS_LABELS,
  type TicketSection,
} from "@/lib/tickets/details";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
export function PassengerTickets() {
  const query = useTickets();
  const [active, setActive] = useState<TicketSection>("upcoming");
  return (
    <div className="passenger-tickets-page">
      <header className="ticket-list-heading">
        <div>
          <p>YOUR JOURNEYS</p>
          <h1>My tickets</h1>
          <span>Upcoming trips and the journeys behind you.</span>
        </div>
        <Badge tone="blue">Demo</Badge>
      </header>
      <div
        className="ticket-status-tabs"
        role="tablist"
        aria-label="Ticket status"
      >
        {TICKET_SECTIONS.map((section, index) => (
          <button
            type="button"
            key={section.id}
            id={`ticket-tab-${section.id}`}
            role="tab"
            aria-selected={active === section.id}
            aria-controls={`ticket-panel-${section.id}`}
            tabIndex={active === section.id ? 0 : -1}
            onClick={() => setActive(section.id)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight")
                next = (index + 1) % TICKET_SECTIONS.length;
              else if (event.key === "ArrowLeft")
                next =
                  (index + TICKET_SECTIONS.length - 1) % TICKET_SECTIONS.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = TICKET_SECTIONS.length - 1;
              else return;
              event.preventDefault();
              setActive(TICKET_SECTIONS[next].id);
              document
                .getElementById(`ticket-tab-${TICKET_SECTIONS[next].id}`)
                ?.focus();
            }}
          >
            {section.label}
            <span>
              {query.data
                ? query.data.filter(
                    (ticket) => ticket.status === section.status,
                  ).length
                : "—"}
            </span>
          </button>
        ))}
      </div>
      {TICKET_SECTIONS.map((section) => {
        const tickets = (query.data ?? [])
          .filter((ticket) => ticket.status === section.status)
          .sort((a, b) => {
            const order = `${a.travelDate}T${a.departureTime}`.localeCompare(
              `${b.travelDate}T${b.departureTime}`,
            );
            return section.id === "upcoming"
              ? order || b.createdAt.localeCompare(a.createdAt)
              : -order;
          });
        return (
          <section
            key={section.id}
            role="tabpanel"
            id={`ticket-panel-${section.id}`}
            aria-labelledby={`ticket-tab-${section.id}`}
            hidden={active !== section.id}
            tabIndex={0}
            className="ticket-list-panel"
          >
            {query.isPending ? (
              <div role="status" aria-label="Loading tickets">
                <Skeleton className="ticket-list-skeleton" />
                <span className="sr-only">Loading tickets…</span>
              </div>
            ) : query.isError ? (
              <Card>
                <ErrorState retry={() => query.refetch()} />
              </Card>
            ) : tickets.length === 0 ? (
              <Card>
                <EmptyState
                  title={
                    section.id === "upcoming"
                      ? "No upcoming journeys"
                      : section.id === "completed"
                        ? "No completed journeys"
                        : "No cancelled tickets"
                  }
                  description={
                    section.id === "upcoming"
                      ? "Find a bus and choose a seat for your next journey."
                      : "Your tickets will appear here when their status changes."
                  }
                >
                  <Button asChild variant="outline">
                    <Link href="/app">Explore nearby buses</Link>
                  </Button>
                </EmptyState>
              </Card>
            ) : (
              <Card className="passenger-ticket-list">
                {tickets.map((ticket) => (
                  <Link
                    href={`/app/tickets/${ticket.bookingId}`}
                    className="passenger-ticket-row"
                    key={ticket.bookingId}
                  >
                    <span>
                      <Ticket size={22} />
                    </span>
                    <div>
                      <strong>
                        {ticket.from}{" "}
                        <span className="ticket-list-route-arrow">→</span>{" "}
                        {ticket.to}
                      </strong>
                      <p>
                        <BusFront size={13} />
                        {ticket.vehicleId}
                        <span>·</span>Seat {ticket.seatId}
                        <span>·</span>
                        {formatJourneyDate(ticket.travelDate)},{" "}
                        {formatDepartureTime(ticket.departureTime)}
                      </p>
                      <small>{ticket.bookingId}</small>
                    </div>
                    <Badge
                      tone={
                        ticket.status === "CONFIRMED"
                          ? "success"
                          : ticket.status === "CANCELLED"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {TICKET_STATUS_LABELS[ticket.status]}
                    </Badge>
                    <ChevronRight size={17} />
                  </Link>
                ))}
              </Card>
            )}
          </section>
        );
      })}
      <p className="ticket-list-demo-note">
        Demo journeys are shown alongside bookings made in this browser tab.
      </p>
    </div>
  );
}
