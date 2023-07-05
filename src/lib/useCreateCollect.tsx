import { useMutation } from "@tanstack/react-query";
import useLogin from "./auth/useLogin";
import { useCreateCollectTypedDataMutation } from "../graphql/generated";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { signTypedDatawithOmittedTypename, splitSignature } from "./helpers";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
type CollectArgs = {
  publicationId: string;
};
export default function useCreateCollect() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestTypedData } = useCreateCollectTypedDataMutation();
  const sdk = useSDK();
  const address = useAddress();
  async function createCollect({ publicationId }: CollectArgs) {
    await login();
    console.log("create Collect: logged in!");
    const typedData = await requestTypedData({
      request: {
        publicationId: publicationId,
      },
    });
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createCollectTypedData.typedData.domain,
      typedData.createCollectTypedData.typedData.types,
      typedData.createCollectTypedData.typedData.value
    );
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    const { data, deadline, nonce, profileId, pubId } =
      typedData.createCollectTypedData.typedData.value;
    const result = await lensHubContract.call("collectWithSig", {
      collector: address,
      profileId: profileId,
      pubId: pubId,
      data: data,
      sig: {
        v: v,
        r: r,
        s: s,
        deadline: deadline,
      },
    });
    console.log("create mirror: done");
  }
  return useMutation(createCollect);
}
