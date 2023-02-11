import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { useCreateSetProfileImageUriTypedDataMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";

export default function useSetProfileImage() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestTypedData } =
    useCreateSetProfileImageUriTypedDataMutation();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { isSignedInQuery, profileQuery } = useLensUser();
  const sdk = useSDK();
  async function setProfileImage(image: File) {
    await login();
    const imageIPFS = (await uploadToIPFS({ data: [image] }))[0];
    const typedData = await requestTypedData({
      request: {
        profileId: profileQuery.data?.defaultProfile?.id,
        url: imageIPFS,
      },
    });
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createSetProfileImageURITypedData.typedData.domain,
      typedData.createSetProfileImageURITypedData.typedData.types,
      typedData.createSetProfileImageURITypedData.typedData.value
    );
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    const { profileId, imageURI, deadline } =
      typedData.createSetProfileImageURITypedData.typedData.value;
    console.log("profileId: ", profileId);
    console.log("imageURI: ", imageURI);
    const result = await lensHubContract.call("setProfileImageURIWithSig", {
      profileId: profileId,
      imageURI: imageURI,
      sig: {
        v: v,
        r: r,
        s: s,
        deadline: deadline,
      },
    });
  }
  return useMutation(setProfileImage);
}
