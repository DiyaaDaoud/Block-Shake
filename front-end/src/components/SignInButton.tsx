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
  DefaultProfileDocument,
  DefaultProfileQuery,
  DefaultProfileQueryVariables,
  NotificationsDocument,
  NotificationsQuery,
  NotificationsQueryVariables,
} from "../graphql/generated";
import { deleteAccessToken, readAccessToken } from "../lib/auth/helpers";
import refreshAccessToken from "../lib/auth/refreshAccessToken";
import useLensUser from "../lib/auth/useLensUser";
import useLogin from "../lib/auth/useLogin";
import {
  readNotifications,
  readProfileQuery,
  readSeenNotifications,
  storeNotifications,
  storeProfileQuery,
  storeSeenNotifications,
} from "../lib/helpers";
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
  const [notifsNum, setNotifsNum] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("FirstTimeUser");
  const [seenNotifsNum, setSeenNotifsNum] = useState<number>();
  let accessToken = readAccessToken();
  let customProfileQuery: DefaultProfileQuery | undefined =
    readProfileQuery(address);
  let profileNotifications: NotificationsQuery | undefined =
    readNotifications(address);
  let customSeenNotifications = readSeenNotifications(address);
  // console.log("         address: ", address);
  // console.log("         currentUser: ", currentUser);
  // console.log("         notifs: ", notifs);
  // console.log("         notifsNum: ", notifsNum);
  // console.log("         seenNotifsNum: ", seenNotifsNum);
  // console.log("         customProfileQuery: ", customProfileQuery);
  // console.log("         profileNotifications: ", profileNotifications);
  // console.log("         customSeenNotifications: ", customSeenNotifications);
  // console.log("         isSignedInQuery.data: ", isSignedInQuery.data);
  // console.log("         accessToken: ", accessToken);
  // console.log("----------------------------------------------------------");

  async function updateNotifs() {
    if (!address || !accessToken) return;
    if (customProfileQuery !== undefined && customProfileQuery.defaultProfile) {
      const notsQuery = fetcher<
        NotificationsQuery,
        NotificationsQueryVariables
      >(NotificationsDocument, {
        request: {
          profileId: customProfileQuery.defaultProfile.id,
        },
      });
      const newNotifs = await notsQuery();
      if (!newNotifs.notifications) return;
      if (
        newNotifs.notifications &&
        (profileNotifications == undefined || profileNotifications != newNotifs)
      ) {
        profileNotifications = newNotifs;
        storeNotifications(newNotifs, address);
        setNotifs(newNotifs);
        if (newNotifs.notifications.pageInfo.totalCount) {
          setNotifsNum(newNotifs.notifications.pageInfo.totalCount);
        } else {
          setNotifsNum(newNotifs.notifications.items.length);
        }
        return;
      }
      if (profileNotifications != undefined) {
        // console.log("inside updateUI: notifs are: ", newNotifs);
        setNotifs(profileNotifications);
        setNotifsNum(
          profileNotifications.notifications.pageInfo.totalCount ||
            profileNotifications.notifications.items.length
        );
        return;
      }
    }
  }
  async function updateCustomProfile() {
    if (!address) return;
    if (!sdk) return;
    if (!isSignedInQuery.data || !accessToken) {
      console.log("no access token!");
      return;
    }
    if (currentUser != address) {
      setCurrentUser(address);
      return;
    }
    customProfileQuery = readProfileQuery(address);

    // const refreshedAccessToken = await refreshAccessToken();
    // if (!refreshedAccessToken) return;
    if (customProfileQuery == undefined) {
      if (profileQuery.isLoading || profileQuery.isError || !profileQuery.data)
        return;
      customProfileQuery = profileQuery.data;
      storeProfileQuery(profileQuery.data, address);
    }
    if (profileQuery.data && customProfileQuery != profileQuery.data) {
      customProfileQuery = profileQuery.data;
      storeProfileQuery(profileQuery.data, address);
    }
  }
  async function updateSeenNotifs() {
    if (!address || !accessToken) return;
    if (customSeenNotifications !== undefined) {
      setSeenNotifsNum(customSeenNotifications);
      return;
    }
    if (!sdk) return;
    const notificationsContract = await sdk.getContractFromAbi(
      NOTIFICATIONS_HELPER_ADDRESS,
      NOTIFICATIONS_HELPER_ABI
    );
    const notifsFromContract = await notificationsContract.call(
      "getSeenNotifications",
      address
    );
    if (notifsFromContract) {
      customSeenNotifications = notifsFromContract;
      storeSeenNotifications(notifsFromContract, address);
      setSeenNotifsNum(notifsFromContract);
    }
  }
  useEffect(() => {
    updateCustomProfile();
  }, [
    address,
    customProfileQuery,
    currentUser,
    address,
    profileQuery.data,
    profileQuery.isLoading,
  ]);
  useEffect(() => {
    updateNotifs();
  }, [address, profileNotifications, notifs, notifsNum]);
  useEffect(() => {
    updateSeenNotifs();
  }, [address, customSeenNotifications, seenNotifsNum]);

  if (!address) {
    return <ConnectWallet colorMode="light" className={styles.connectButton} />;
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
  accessToken = readAccessToken();
  if (
    (!isSignedInQuery.data &&
      !isSignedInQuery.isLoading &&
      !isSignedInQuery.isError) ||
    !accessToken
  ) {
    return (
      <div className={styles.container}>
        <button
          className={styles.button}
          onClick={() => {
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
  if (
    isSignedInQuery.data &&
    accessToken &&
    address != currentUser &&
    currentUser != "FirstTimeUser"
  ) {
    console.log("innnnnnnnnnnnnnnnnnn");
    const ls = window.localStorage;
    ls.removeItem("LH_STORAGE_KEY");
  }

  if (customProfileQuery == undefined && profileQuery.isLoading) {
    return <div className={styles.hint}>Loading profile.. please wait</div>;
  }

  if (customProfileQuery == undefined && !profileQuery.data?.defaultProfile) {
    return (
      <div>
        <Link href={"/createProfile"}>
          <button className={styles.button}>New user? Sign up!</button>
        </Link>
      </div>
    );
  }
  if (customProfileQuery == undefined && profileQuery.data?.defaultProfile) {
    storeProfileQuery(profileQuery.data, address);
    customProfileQuery = profileQuery.data;
  }
  if (customProfileQuery?.defaultProfile) {
    return (
      <div className={styles.container}>
        <Link href={`/profile/${customProfileQuery.defaultProfile?.handle}`}>
          {/** @ts-ignore */}
          {customProfileQuery.defaultProfile.picture?.original ? (
            <Tooltip
              title={
                customProfileQuery.defaultProfile.handle
                  ? customProfileQuery.defaultProfile.handle
                  : "profile pic"
              }
            >
              <MediaRenderer
                // @ts-ignore
                src={customProfileQuery.defaultProfile.picture?.original?.url}
                alt={customProfileQuery.defaultProfile.handle}
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
                customProfileQuery.defaultProfile.handle
                  ? customProfileQuery.defaultProfile.handle
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
  return <div className={styles.hint}>Something went wrong mate!</div>;
}
