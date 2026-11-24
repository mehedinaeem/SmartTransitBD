"use client";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
export const useTicket = (id: string) =>
  useQuery({
    queryKey: ["bookings", "ticket", id],
    queryFn: () => bookingsApi.get(id),
    retry: false,
  });
export const useConfirmedBookings = () =>
  useQuery({
    queryKey: ["bookings", "confirmed"],
    queryFn: () => bookingsApi.confirmed(),
  });

export const useTickets = () =>
  useQuery({
    queryKey: ["bookings", "tickets"],
    queryFn: () => bookingsApi.tickets(),
  });
