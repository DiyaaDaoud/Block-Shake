import { Tooltip } from "@mui/material";
import {
  ChainId,
  ConnectWallet,
  MediaRenderer,
  useAddress,
  useNetwork,
  useNetworkMismatch,
  useSDK,
} from "@thirdweb-dev/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  NOTIFICATIONS_HELPER_ABI,
  NOTIFICATIONS_HELPER_ADDRESS,
} from "../constants/contracts";
import { fetcher } from "../graphql/auth-fetcher";
import {
  DefaultProfileQuery,
  NotificationsDocument,
  NotificationsQuery,
  NotificationsQueryVariables,
} from "../graphql/generated";
import { deleteAccessToken, readAccessToken } from "../lib/auth/helpers";
import refreshAccessToken from "../lib/auth/refreshAccessToken";
import useLensUser from "../lib/auth/useLensUser";
import useLogin from "../lib/auth/useLogin";
import useGetNotifications from "../lib/useGetNotifications";
import styles from "../styles/SignIn.module.css";
type Props = {};

export default function SignInButton({}: Props) {
  const address = useAddress(); // the connected address
  const sdk = useSDK();
  const isOnWrongNetwork = useNetworkMismatch(); // detect wrong network
  const [, switchNetwork] = useNetwork(); // switch the network
  const { mutate: requestLogin } = useLogin();
  let { isSignedInQuery, profileQuery } = useLensUser();
  const [notifs, setNotifs] = useState<NotificationsQuery | null>();
  const { mutateAsync: getNotifs } = useGetNotifications();
  // const [defaultProfile, setDefaultProfile] = useState<DefaultProfileQuery>();
  const [currentNotifications, setCurrentNotifications] =
    useState<NotificationsQuery>();
  const [notifsNum, setNotifsNum] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("FirstTimeUser");
  const [seenNotifsNum, setSeenNotifsNum] = useState<number>();
  let accessToken = readAccessToken();
  async function updateUI() {
    accessToken = readAccessToken();
    if (!accessToken) {
      console.log(notifs);
      console.log("no access token!");
      setNotifs(null);
      return;
    }
    if (!address) return;
    if (!sdk) return;
    if (!profileQuery?.data?.defaultProfile) return;
    if (currentUser != address) {
      if (currentUser == "FirstTimeUser") {
        setCurrentUser(address);
        return;
      } else {
        console.log("changing the current user.....");
        deleteAccessToken();
        setCurrentUser(address);
        requestLogin();
        return;
      }
    }
    if (profileQuery.data.defaultProfile.ownedBy != currentUser) {
      console.log("the profile is not owned by the current user!..");
      return;
    }
    // console.log("in.........");
    const notsQuery = fetcher<NotificationsQuery, NotificationsQueryVariables>(
      NotificationsDocument,
      { request: { profileId: profileQuery.data.defaultProfile.id } }
    );
    const newNotifs = await notsQuery();
    if (newNotifs.notifications) {
      // console.log("inside updateUI: notifs are: ", newNotifs);
      setNotifs(newNotifs);
      setNotifsNum(newNotifs.notifications.items.length);
    }
    const notificationsContract = await sdk.getContractFromAbi(
      NOTIFICATIONS_HELPER_ADDRESS,
      NOTIFICATIONS_HELPER_ABI
    );
    const notifsFromContract = await notificationsContract.call(
      "getSeenNotifications",
      address
    );
    if (notifsFromContract) setSeenNotifsNum(notifsFromContract);
  }
  useEffect(() => {
    updateUI();
  });
  if (!address) {
    return <ConnectWallet colorMode="light" className={styles.connectButton} />;
  }
  refreshAccessToken();
  if (address != currentUser && currentUser != "FirstTimeUser") {
    requestLogin();
  }
  if (isOnWrongNetwork) {
    return (
      <button
        className={styles.button}
        onClick={() => {
          switchNetwork?.(ChainId.Mumbai);
        }}
      >
        Switch Network
      </button>
    );
  }
  if (!isSignedInQuery.data) {
    return (
      <div className={styles.container}>
        <button
          className={styles.button}
          onClick={async () => {
            requestLogin();
            setCurrentUser(address);
          }}
        >
          Login with Lens 😄
        </button>
        <Link href={"/createProfile"}>
          <button className={styles.button}>New user? Sign up!</button>
        </Link>
      </div>
    );
  }
  if (isSignedInQuery.isLoading) {
    return <div className={styles.hint}>Loading Sign In ... please wait</div>;
  }

  if (profileQuery.isLoading) {
    return <div className={styles.hint}>Loading profile.. please wait</div>;
  }

  if (!profileQuery.data?.defaultProfile) {
    return (
      <div>
        <Link href={"/createProfile"}>
          <button className={styles.button}>New user? Sign up!</button>
        </Link>
      </div>
    );
  }

  if (profileQuery.data.defaultProfile) {
    return (
      <div className={styles.container}>
        <Link href={`/profile/${profileQuery.data.defaultProfile?.handle}`}>
          {/** @ts-ignore */}
          {profileQuery.data.defaultProfile.picture?.original ? (
            <Tooltip
              title={
                profileQuery.data.defaultProfile.handle
                  ? profileQuery.data.defaultProfile.handle
                  : "profile pic"
              }
            >
              <MediaRenderer
                // @ts-ignore
                src={profileQuery.data.defaultProfile.picture?.original?.url}
                alt={profileQuery.data.defaultProfile.handle}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                }}
              ></MediaRenderer>
            </Tooltip>
          ) : (
            <Tooltip
              title={
                profileQuery.data.defaultProfile.handle
                  ? profileQuery.data.defaultProfile.handle
                  : "profile pic"
              }
            >
              <MediaRenderer
                // @ts-ignore
                src={
                  "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png"
                }
                alt={"profile picture"}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                }}
              ></MediaRenderer>
            </Tooltip>
          )}
        </Link>
        {notifs &&
          notifs.notifications &&
          notifs.notifications.items &&
          notifsNum &&
          seenNotifsNum &&
          (notifsNum - seenNotifsNum > 0 ? (
            <div className={styles.notificationsContainer}>
              <Link href="/profile/userNotifications">
                <img
                  src="/bell-ring.png"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                  }}
                ></img>
              </Link>
            </div>
          ) : (
            <div className={styles.notificationsContainer}>
              <Link href="/profile/userNotifications">
                <img
                  src="/bell.png"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                  }}
                ></img>
              </Link>
            </div>
          ))}
      </div>
    );
  }
  return <div>Something went wrong mate!</div>;
}
