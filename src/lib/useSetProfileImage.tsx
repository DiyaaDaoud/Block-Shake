import { useMutation } from "@tanstack/react-query";
import { useStorageUpload } from "@thirdweb-dev/react";
import { useCreateSetProfileImageUriViaDispatcherMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";

export default function useSetProfileImage() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestDispatcher } =
    useCreateSetProfileImageUriViaDispatcherMutation();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { profileQuery } = useLensUser();
  async function setProfileImage(image: File | null) {
    await login();
    const imageIPFS = (await uploadToIPFS({ data: [image] }))[0];
    const dispatcherResult = await requestDispatcher({
      request: {
        profileId: profileQuery.data?.defaultProfile?.id,
        url: imageIPFS,
      },
    });
  }
  return useMutation(setProfileImage);
}
