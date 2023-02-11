import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider, ChainId } from "@thirdweb-dev/react";
import Header from "../components/Header";
import { ChakraProvider } from "@chakra-ui/react";
export default function App({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const desiredChainId = ChainId.Mumbai;
  return (
    <ThirdwebProvider desiredChainId={desiredChainId}>
      <QueryClientProvider client={queryClient}>
        <Header></Header>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
