import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface TanStackProviderProps {
  children: ReactNode;
}

export function TanStackProvider({ children }: TanStackProviderProps) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {

            staleTime: 60_000,
            refetchOnWindowFocus: false,

            queryFn: ({ queryKey, client }) =>
              client.getQueryData(queryKey) ?? null,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
