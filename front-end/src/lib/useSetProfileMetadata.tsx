import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import { v4 } from "uuid";
import {
  LENS_PERIPHERY_ABI,
  LENS_PERIPHERY_ADDRESS,
} from "../constants/contracts";
import { useCreateSetProfileMetadataTypedDataMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";
type setProfileMetadataArgs = {
  cover_image: File | null;
  name: string;
  bio: string;
};
export default function useSetProfileMetadata() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { mutateAsync: requestTypedData } =
    useCreateSetProfileMetadataTypedDataMutation();
  const sdk = useSDK();
  const { isSignedInQuery, profileQuery } = useLensUser();
  async function setProfileMetadata({
    cover_image,
    name,
    bio,
  }: setProfileMetadataArgs) {
    await login();
    let coverImageToIpfs;
    if (cover_image != null) {
      coverImageToIpfs = (await uploadToIPFS({ data: [cover_image] }))[0];
    } else {
      coverImageToIpfs = null;
    }
    const dataToIpfs = (
      await uploadToIPFS({
        data: [
          {
            name: name,
            bio: bio,
            cover_picture: coverImageToIpfs,
            version: "1.0.0",
            metadata_id: v4(),
          },
        ],
      })
    )[0];
    console.log("uploaded to IPFS and will request data/............");
    const typedData = await requestTypedData({
      request: {
        metadata: dataToIpfs,
        profileId: profileQuery.data?.defaultProfile?.id,
      },
    });
    console.log("requested data ans will sign/............");
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createSetProfileMetadataTypedData.typedData.domain,
      typedData.createSetProfileMetadataTypedData.typedData.types,
      typedData.createSetProfileMetadataTypedData.typedData.value
    );
    console.log("signed data and will call contract/............");
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_PERIPHERY_ADDRESS,
      LENS_PERIPHERY_ABI
    );
    const { deadline, metadata, profileId } =
      typedData.createSetProfileMetadataTypedData.typedData.value;
    const result = await lensHubContract.call("setProfileMetadataURIWithSig", {
      profileId: profileId,
      metadata: metadata,
      sig: {
        v: v,
        r: r,
        s: s,
        deadline: deadline,
      },
    });
  }
  return useMutation(setProfileMetadata);
}
