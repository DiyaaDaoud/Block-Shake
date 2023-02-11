import { useMutation } from "@tanstack/react-query";
import { ReactionTypes, useAddReactionMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";

type AddReactionArgs = {
  profileId: string;
  publicationId: string;
  reaction: ReactionTypes;
};
export default function useAddReaction() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestReactionData } = useAddReactionMutation();
  async function addReaction({
    profileId,
    publicationId,
    reaction,
  }: AddReactionArgs) {
    await login();
    const data = await requestReactionData({
      request: {
        profileId: profileId,
        publicationId: publicationId,
        reaction: reaction,
      },
    });
  }

  return useMutation(addReaction);
}
