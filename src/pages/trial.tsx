import { Box } from "@chakra-ui/react";
import CreatePost from "../components/CreatePost";
import { useEnabledModuleCurrenciesQuery } from "../graphql/generated";

export default function trial() {
  const {
    data: enabledCurrencies,
    isLoading: loadingCurrencies,
    isError: errorCurrencies,
  } = useEnabledModuleCurrenciesQuery();
  console.log(enabledCurrencies);
  return (
    <Box
      width="60%"
      marginLeft="20%"
      marginRight="20%"
      alignItems="center"
      display="flex"
    >
      <CreatePost></CreatePost>
    </Box>
  );
}
