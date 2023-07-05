import {
  useAuthenticateMutation,
  useDefaultProfileQuery,
} from "@/src/graphql/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import useGetNotifications from "../useGetNotifications";
import generateChallenge from "./generateChallenge";
import { setAccessToken } from "./helpers";

export default function useLogin() {
  const address = useAddress();
  const sdk = useSDK();
  const { mutateAsync: sendSignedMessage } = useAuthenticateMutation();
  const client = useQueryClient();
  async function login() {
    if (!address) {
      console.log("inside useLogin: didn't get the address!");
      return;
    }

    const { challenge } = await generateChallenge(address);
    console.log("inside useLogin: challenge generated!");
    const signature = await sdk?.wallet.sign(challenge.text);
    console.log("inside useLogin: message signed!");
    const { authenticate } = await sendSignedMessage({
      request: {
        address: address,
        signature: signature,
      },
    });
    console.log("inside useLogin: Authentication: ", authenticate);
    const { accessToken, refreshToken } = authenticate;
    setAccessToken(accessToken, refreshToken);
    console.log("inside useLogin: token stored to storage");
    client.invalidateQueries(["lens-user", address]); // this will re-run the query to fetch this cache key when the user signs the message
  }
  return useMutation(login);
}
