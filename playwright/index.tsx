import { beforeMount } from "@playwright/experimental-ct-react/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../src/styles/global.css";

beforeMount(async ({ App }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
});
