import { useCreateFollowTypedDataMutation } from "@/src/graphql/generated";
import { useMutation } from "@tanstack/react-query";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import omitDeep from "omit-deep";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "../constants/contracts";
import { isTokenExpired, readAccessToken } from "./auth/helpers";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename, splitSignature } from "./helpers";

export default function useFollow() {
  const { mutateAsync: requestTypedData } = useCreateFollowTypedDataMutation();
  const sdk = useSDK();
  const address = useAddress();
  const { mutateAsync: userLogin } = useLogin();
  const { isSignedInQuery } = useLensUser();
  async function follow(userId: string) {
    // if (!isSignedInQuery.data) {
    //   await userLogin();
    // } else {
    //   console.log("user logged in with lens!");
    // }
    const accessToken = readAccessToken();
    const exp = accessToken?.exp;
    if (exp == undefined) {
      await userLogin();
    } else {
      if (!isTokenExpired(exp)) {
        await userLogin();
      }
    }
    // await userLogin();
    console.log("follow: signed in!");
    // 1. get the typed data for the user to sign, using "useCreateFollowTypedDataMutation" ✅
    const typedData = await requestTypedData({
      request: {
        follow: [
          {
            profile: userId,
          },
        ],
      },
    });
    console.log("requested typedData", typedData);
    // 2. ask the user to sign the typed data ✅

    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createFollowTypedData.typedData.domain,
      typedData.createFollowTypedData.typedData.types,
      typedData.createFollowTypedData.typedData.value
    );
    console.log("follow: signed the data");

    const { v, r, s } = splitSignature(signatureObject.signature);
    console.log("follow: split the signature");

    // 3. send the signed data to the smart contract to perform the operation on the blockchain
    //    1. get the deployed contract
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    //    2. call the followWithSig function
    const result = await lensHubContract.call("followWithSig", {
      follower: address,
      profileIds: [userId],
      datas: typedData.createFollowTypedData.typedData.value.datas,
      sig: {
        v: v,
        r: r,
        s: s,
        deadline: typedData.createFollowTypedData.typedData.value.deadline,
      },
    });
    console.log("follow: called follow with sig");
  }
  return useMutation(follow);
}
