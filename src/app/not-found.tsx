import Link from "next/link";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <EmptyState
      title="This stop isn’t on the map"
      description="The page you’re looking for could not be found."
    >
      <Button asChild>
        <Link href="/app">Go to passenger home</Link>
      </Button>
    </EmptyState>
  );
}
