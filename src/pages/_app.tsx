import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import Header from "../components/Header";
export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const desiredChainId = ChainId.Mumbai;
  return (
    <ChakraProvider>
      <ThirdwebProvider desiredChainId={desiredChainId}>
        <QueryClientProvider client={queryClient}>
          <Header></Header>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ThirdwebProvider>
    </ChakraProvider>
  );
}
