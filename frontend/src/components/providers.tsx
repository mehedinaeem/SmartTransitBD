"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster
          richColors
          position="bottom-right"
          mobileOffset={{
            bottom: "calc(82px + env(safe-area-inset-bottom))",
            left: 16,
            right: 16,
          }}
        />
      </MotionConfig>
    </QueryClientProvider>
  );
}
