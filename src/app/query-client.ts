import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Hundreds of audience clients may be connected; window-focus refetch storms must stay off.
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
