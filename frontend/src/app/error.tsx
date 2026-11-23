"use client";
import { ErrorState } from "@/components/ui/primitives";
export default function Error({ reset }: { reset: () => void }) {
  return <ErrorState retry={reset} />;
}
