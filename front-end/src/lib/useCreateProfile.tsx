import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { useCreateProfileMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { pollUntilIndexed } from "./helpers";
type CreateProfileArgs = {
  handle: string;
  image: File | null;
};
export default function useCreateProfile() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: createProfileRequest } = useCreateProfileMutation();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const sdk = useSDK();
  async function createProfile({ handle, image }: CreateProfileArgs) {
    await login();
    let imageIPFS = (await uploadToIPFS({ data: [image] }))[0];
    // if (image) {
    //   imageIPFS = (await uploadToIPFS({ data: [image] }))[0];
    // } else {
    //   imageIPFS =
    //     "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    // }
    const createProfileResult = await createProfileRequest({
      request: {
        handle: handle,
        profilePictureUri: imageIPFS,
        followModule: { freeFollowModule: true },
      },
    });
    if (createProfileResult.createProfile.__typename == "RelayError") {
      alert(
        `create profile failed, ${createProfileResult.createProfile.reason}`
      );
      return;
    }
    // const indexedTx = await pollUntilIndexed({
    //   txHash: createProfileResult.createProfile.txHash,
    // });
    // const logs = indexedTx.txReceipt?.logs;
  }
  return useMutation(createProfile);
}
