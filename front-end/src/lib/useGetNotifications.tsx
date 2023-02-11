import { fetcher } from "@/src/graphql/auth-fetcher";
import {
  NotificationsDocument,
  NotificationsQuery,
  NotificationsQueryVariables,
  useNotificationsQuery,
} from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import useLogin from "@/src/lib/auth/useLogin";
import { useMutation } from "@tanstack/react-query";
import refreshAccessToken from "./auth/refreshAccessToken";

export default function useGetNotifications() {
  const { mutateAsync: login } = useLogin();
  const { isSignedInQuery, profileQuery } = useLensUser();

  async function getNotifs(profileID: string) {
    // await login();
    await refreshAccessToken();
    const noteMutation = fetcher<
      NotificationsQuery,
      NotificationsQueryVariables
    >(NotificationsDocument, { request: { profileId: profileID } });
    const notis = await noteMutation();
    return notis;
  }
  return useMutation(getNotifs);
}
