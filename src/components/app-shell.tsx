"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BusFront,
  LayoutDashboard,
  Map,
  Route,
  Ticket,
  UserRound,
  Truck,
  CalendarDays,
  ScanLine,
  ChartNoAxesCombined,
  Bell,
  Settings,
  PanelLeftClose,
  Menu,
  X,
  ChevronDown,
  Radio,
  CircleHelp,
  ExternalLink,
} from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "./ui/button";
const operatorItems = [
  ["Overview", "/operator", LayoutDashboard],
  ["Live fleet", "/operator/fleet", Map],
  ["Vehicles", "/operator/vehicles", BusFront],
  ["Routes", "/operator/routes", Route],
  ["Bookings", "/operator/bookings", CalendarDays],
  ["Seat occupancy", "/operator/occupancy", ScanLine],
  ["Analytics", "/operator/analytics", ChartNoAxesCombined],
  ["Alerts", "/operator/alerts", Bell],
  ["Settings", "/operator/settings", Settings],
] as const;
const passengerItems = [
  ["Home", "/app", LayoutDashboard],
  ["Live buses", "/app/live", Map],
  ["Routes", "/app/routes", Route],
  ["My tickets", "/app/tickets", Ticket],
  ["Profile", "/app/profile", UserRound],
] as const;
export function AppShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "operator" | "passenger";
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not([disabled])",
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [mobileNavOpen, setMobileNavOpen]);
  const items = mode === "operator" ? operatorItems : passengerItems;
  const current = items.find((item) => item[1] === pathname)?.[0] ?? "Overview";
  return (
    <div className={`workspace ${mode}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {mobileNavOpen && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${mobileNavOpen ? "is-open" : ""}`}
      >
        <Link
          href={mode === "operator" ? "/operator" : "/app"}
          className="brand"
        >
          <span className="brand-icon">
            <BusFront size={23} />
          </span>
          <span>
            SmartTransit <b>BD</b>
            <small>CONNECTED. INFORMED. MOVING.</small>
          </span>
        </Link>
        <div className="workspace-label">
          <span>
            {mode === "operator" ? "OPERATOR WORKSPACE" : "PASSENGER WORKSPACE"}
          </span>
          <button
            aria-label="Close navigation"
            className="mobile-only icon-button"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={18} />
          </button>
          <PanelLeftClose size={16} className="desktop-only" />
        </div>
        <div className="organization">
          <span className="org-icon">
            <Truck size={19} />
          </span>
          <div>
            <strong>
              {mode === "operator" ? "Dhaka Transit" : "Dhaka, Bangladesh"}
            </strong>
            <small>
              {mode === "operator" ? "Fleet operations" : "Passenger preview"}
            </small>
          </div>
          <ChevronDown size={16} />
        </div>
        <nav aria-label={`${mode} navigation`}>
          {items.map(([label, href, Icon], i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={`nav-item ${pathname === href ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Alerts" && <span className="nav-count">2</span>}
              {pathname === href && (
                <motion.span
                  layoutId={`${mode}-active`}
                  className="nav-active"
                  transition={{ duration: 0.2 }}
                />
              )}
              {i === 5 && <span />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="pilot-status">
            <Radio size={17} />
            <div>
              <strong>Built for the road ahead</strong>
              <p>Hardware integration in progress</p>
            </div>
          </div>
          <Link
            href={mode === "operator" ? "/app" : "/operator"}
            className="switch-link"
          >
            <ExternalLink size={17} />
            {mode === "operator"
              ? "Open passenger app"
              : "Open operator workspace"}
          </Link>
          <div className="account">
            <span className="avatar">DT</span>
            <div>
              <strong>Demo workspace</strong>
              <small>Preview access</small>
            </div>
            <CircleHelp size={18} />
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobileNavOpen || undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-only"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <span>{mode === "operator" ? "Workspace" : "Passenger"}</span>
            <span className="slash">/</span>
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-indicator">
              <span />
              Demo environment
            </span>
            <Link
              href={mode === "operator" ? "/operator/alerts" : "/app/profile"}
              className="notification"
              aria-label="View alerts"
            >
              <Bell size={20} />
              <i />
            </Link>
            <span className="avatar avatar-small">DT</span>
          </div>
        </header>
        <div className="environment-note">
          <Radio size={15} />
          <span>
            <strong>Development preview.</strong> All vehicle locations,
            occupancy estimates, and metrics are simulated.
          </span>
          <span className="preview-label">MOCK DATA</span>
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer>
          <span>© 2026 SmartTransit BD</span>
          <span>Intelligent mobility. Built for Bangladesh.</span>
        </footer>
      </div>
    </div>
  );
}
