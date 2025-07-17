
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Set a default staleTime to avoid unnecessary refetches on navigation.
        // Data will be considered fresh for this duration.
        staleTime: 1000 * 60 * 2, // 2 minutes
        // GC time is how long unused data remains in cache. Default is 5 mins.
        gcTime: 1000 * 60 * 5, // 5 minutes
        // Refetch on window refocus can be helpful but sometimes aggressive.
        // Let's keep it enabled as it's often a good default.
        refetchOnWindowFocus: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
