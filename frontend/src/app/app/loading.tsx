import { Skeleton, Card } from "@/components/ui/primitives";
import {
  NearbyBusesSkeleton,
  PopularRoutesSkeleton,
} from "@/features/passenger/home";
export default function Loading() {
  return (
    <div className="passenger-home">
      <div className="passenger-greeting">
        <Skeleton className="heading-skeleton" />
        <Skeleton className="passenger-icon-skeleton" />
      </div>
      <Skeleton className="heading-skeleton" />
      <Card>
        <NearbyBusesSkeleton />
      </Card>
      <div style={{ marginTop: 24 }}>
        <Card>
          <PopularRoutesSkeleton />
        </Card>
      </div>
    </div>
  );
}
