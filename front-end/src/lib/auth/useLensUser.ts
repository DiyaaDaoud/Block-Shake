import {
  useDefaultProfileQuery,
  useProfilesQuery,
} from "@/src/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useAddress } from "@thirdweb-dev/react";
import { useState } from "react";
import { readAccessToken } from "./helpers";

export default function useLensUser() {
  const [currentUser, setCurrentUser] = useState<string>();
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
  // const {
  //   data: addressProfiles,
  //   isLoading: loadingProfiles,
  //   isError: profilesError,
  // } = useProfilesQuery({
  //   request: {
  //     ownedBy: [address],
  //   },
  // });
  // console.log("addressProfiles: ", addressProfiles);
  // console.log("profileQuery: ", profileQuery.data);
  return {
    isSignedInQuery: localStorageQuery,
    profileQuery: profileQuery,
    // addressProfiles: addressProfiles,
  };
}
