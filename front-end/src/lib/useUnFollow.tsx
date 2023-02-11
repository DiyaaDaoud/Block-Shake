import { useMutation } from "@tanstack/react-query";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import { LENS_FOLLOW_NFT_ABI } from "../constants/contracts";
import { useCreateUnfollowTypedDataMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";

export default function useUnfollow() {
  const { mutateAsync: login } = useLogin();
  const sdk = useSDK();
  const address = useAddress();
  const { mutateAsync: requestTypedData } =
    useCreateUnfollowTypedDataMutation();
  async function unfollow(userId: string | number) {
    await login();
    let typedData = await requestTypedData({
      request: {
        profile: userId,
      },
    });

    if (!sdk) return;

    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createUnfollowTypedData.typedData.domain,
      typedData.createUnfollowTypedData.typedData.types,
      typedData.createUnfollowTypedData.typedData.value
    );
    const { v, r, s } = splitSignature(signatureObject.signature);
    const { tokenId, deadline, nonce } =
      typedData.createUnfollowTypedData.typedData.value;
    const lensHubFollowNftContract = await sdk.getContractFromAbi(
      typedData.createUnfollowTypedData.typedData.domain.verifyingContract,
      LENS_FOLLOW_NFT_ABI
    );
    console.log("calling burnWithSig");
    const result = await lensHubFollowNftContract.call("burnWithSig", tokenId, {
      v,
      r,
      s,
      deadline,
    });
  }
  return useMutation(unfollow);
}
