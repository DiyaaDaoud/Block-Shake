import { useMutation } from "@tanstack/react-query";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { useCreateCollectTypedDataMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";

export default function useCollect() {
  const address = useAddress();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestTypedData } = useCreateCollectTypedDataMutation();
  const sdk = useSDK();
  async function collect(publicationId: string) {
    await login();
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
  }
  return useMutation(collect);
}
