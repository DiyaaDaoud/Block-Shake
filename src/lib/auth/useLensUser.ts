import {
  useDefaultProfileQuery,
  useProfilesQuery,
} from "@/src/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useAddress } from "@thirdweb-dev/react";
import { useState } from "react";
import { readAccessToken } from "./helpers";

export default function useLensUser() {
  const address = useAddress();
  const localStorageQuery = useQuery(["lens-user", address], () =>
    readAccessToken()
  );
  const profileQuery = useDefaultProfileQuery(
    {
      request: {
        ethereumAddress: address,
      },
    },
    { enabled: !!address } // only query profile if the user has connected his wallet
  );
  return {
    isSignedInQuery: localStorageQuery,
    profileQuery: profileQuery,
  };
}
