import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { v4 } from "uuid";

import { useCreateSetProfileMetadataViaDispatcherMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
type setProfileMetadataArgs = {
  cover_image: File | null;
  name: string;
  bio: string;
  coverImageUri?: string;
};
export default function useSetProfileMetadata() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { mutateAsync: requestDispatcher } =
    useCreateSetProfileMetadataViaDispatcherMutation();
  const sdk = useSDK();
  const { isSignedInQuery, profileQuery } = useLensUser();

  async function setProfileMetadata({
    cover_image,
    name,
    bio,
    coverImageUri,
  }: setProfileMetadataArgs) {
    await login();
    let coverImageToIpfs;
    if (coverImageUri) {
      coverImageToIpfs = coverImageUri;
    } else {
      if (cover_image != null) {
        coverImageToIpfs = (await uploadToIPFS({ data: [cover_image] }))[0];
      } else {
        coverImageToIpfs = null;
      }
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
    const typedData = await requestDispatcher({
      request: {
        metadata: dataToIpfs,
        profileId: profileQuery.data?.defaultProfile?.id,
      },
    });
  }
  return useMutation(setProfileMetadata);
}
