"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { House, Route, Ticket, UserRound } from "lucide-react";
const items = [
  { label: "Home", href: "/app", icon: House },
  { label: "Routes", href: "/app/routes", icon: Route },
  { label: "Tickets", href: "/app/tickets", icon: Ticket },
  { label: "Profile", href: "/app/profile", icon: UserRound },
];
export function PassengerNavigation() {
  const pathname = usePathname();
  return (
    <nav className="passenger-bottom-nav" aria-label="Passenger tabs">
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/app"
            ? pathname === "/app" ||
              pathname.startsWith("/app/bus/") ||
              pathname === "/app/live"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : ""}
          >
            {active && (
              <motion.span
                layoutId="passenger-tab"
                className="passenger-tab-indicator"
                transition={{ duration: 0.2 }}
              />
            )}
            <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
