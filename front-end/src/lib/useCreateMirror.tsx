import { useMutation } from "@tanstack/react-query";
import { useSDK } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { useCreateMirrorTypedDataMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";

type CreateMirrorArgs = {
  profileId: any;
  publicationId: any;
};
export default function useCreateMirror() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestTypedData } = useCreateMirrorTypedDataMutation();
  const sdk = useSDK();
  async function createMirror({ profileId, publicationId }: CreateMirrorArgs) {
    await login();
    const typedData = await requestTypedData({
      request: {
        profileId: profileId,
        publicationId: publicationId,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createMirrorTypedData.typedData.domain,
      typedData.createMirrorTypedData.typedData.types,
      typedData.createMirrorTypedData.typedData.value
    );
    console.log("inside usemirror:, signed!!");
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    const result = await lensHubContract.call("mirrorWithSig", {
      profileId: typedData.createMirrorTypedData.typedData.value.profileId,
      profileIdPointed:
        typedData.createMirrorTypedData.typedData.value.profileIdPointed,
      pubIdPointed:
        typedData.createMirrorTypedData.typedData.value.pubIdPointed,
      referenceModuleData:
        typedData.createMirrorTypedData.typedData.value.referenceModuleData,
      referenceModule:
        typedData.createMirrorTypedData.typedData.value.referenceModule,
      referenceModuleInitData:
        typedData.createMirrorTypedData.typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.createMirrorTypedData.typedData.value.deadline,
      },
    });
  }
  return useMutation(createMirror);
}
