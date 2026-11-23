import { Skeleton } from "@/components/ui/primitives";
export default function Loading() {
  return (
    <div className="loading-page" role="status" aria-label="Loading workspace">
      <Skeleton className="heading-skeleton" />
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="stat-skeleton" />
        ))}
      </div>
      <Skeleton className="map-skeleton" />
      <span className="sr-only">Loading workspace…</span>
    </div>
  );
}
