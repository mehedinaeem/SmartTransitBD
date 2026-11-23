import { cn } from "@/lib/utils";
import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./button";
export function Card({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("card", className)} {...props} />;
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "blue";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("input", className)} {...props} />;
}
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="empty-state">
      <AlertCircle />
      <h3>Unable to load data</h3>
      <p>Check your connection and try again.</p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
