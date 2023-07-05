import { useMutation } from "@tanstack/react-query";
import { useCreateMirrorViaDispatcherMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
type MirrorArgs = {
  profileId: string;
  publicationId: string;
};
export default function useCreateMirror() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: mirrorViaDispatcher } =
    useCreateMirrorViaDispatcherMutation();
  async function createMirror({ profileId, publicationId }: MirrorArgs) {
    await login();
    console.log("create Mirror: logged in!");

    const dispatcherResult = await mirrorViaDispatcher({
      request: {
        profileId: profileId,
        publicationId: publicationId,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });
    console.log("create mirror: used Dispatcher", dispatcherResult);
  }
  return useMutation(createMirror);
}
