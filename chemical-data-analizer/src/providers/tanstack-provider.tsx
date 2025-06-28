// src/providers/tanstack-provider.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface TanStackProviderProps {
  children: ReactNode;
}

export function TanStackProvider({ children }: TanStackProviderProps) {
  /** ①  Instancia única de QueryClient */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /* ②  60 s fresco + no refetch al enfocar */
            staleTime: 60_000,
            refetchOnWindowFocus: false,

            /* ③  Default queryFn: lee lo que haya en caché,
                  devuelve null si aún no existe               */
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
