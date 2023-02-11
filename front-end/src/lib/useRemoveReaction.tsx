import { useMutation } from "@tanstack/react-query";
import { ReactionTypes, useRemoveReactionMutation } from "../graphql/generated";
import useLogin from "./auth/useLogin";
type RemoveReactionArgs = {
  profileId: string;
  publicationId: string;
  reaction: ReactionTypes;
};
export default function useRemoveReaction() {
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: requestRemoveReaction } = useRemoveReactionMutation();
  async function removeReaction({
    profileId,
    publicationId,
    reaction,
  }: RemoveReactionArgs) {
    await login();
    await requestRemoveReaction({
      request: {
        profileId: profileId,
        publicationId: publicationId,
        reaction: reaction,
      },
    });
  }
  return useMutation(removeReaction);
}
