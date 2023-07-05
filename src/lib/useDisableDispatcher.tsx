import { useMutation } from "@tanstack/react-query";
import { useSDK } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { useCreateSetDispatcherTypedDataMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";

export default function useDisableDispatcher() {
  const { mutateAsync: requestTypedData } =
    useCreateSetDispatcherTypedDataMutation();
  const { mutateAsync: login } = useLogin();
  const sdk = useSDK();
  async function disableDispather(profileId: string) {
    await login();
    const typedData = await requestTypedData({
      request: {
        profileId: profileId,
        enable: false,
      },
    });
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createSetDispatcherTypedData.typedData.domain,
      typedData.createSetDispatcherTypedData.typedData.types,
      typedData.createSetDispatcherTypedData.typedData.value
    );
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    await lensHubContract.call("setDispatcherWithSig", {
      profileId:
        typedData.createSetDispatcherTypedData.typedData.value.profileId,
      dispatcher:
        typedData.createSetDispatcherTypedData.typedData.value.dispatcher,
      sig: {
        v: v,
        r: r,
        s: s,
        deadline:
          typedData.createSetDispatcherTypedData.typedData.value.deadline,
      },
    });
  }
  return useMutation(disableDispather);
}
