import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Container,
  Spinner,
} from "@chakra-ui/react";
import {
  ChainId,
  ConnectWallet,
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
import { readAccessToken } from "../lib/auth/helpers";
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
import { VscBell, VscBellDot } from "react-icons/vsc";
import refreshAccessToken from "../lib/auth/refreshAccessToken";
type Props = {};

export default function SignInButton({}: Props) {
  const address = useAddress(); // the connected address
  const sdk = useSDK();
  const isOnWrongNetwork = useNetworkMismatch(); // detect wrong network
  const [, switchNetwork] = useNetwork(); // switch the network
  const { mutateAsync: requestLogin } = useLogin();
  let { isSignedInQuery, profileQuery } = useLensUser();
  const [notifs, setNotifs] = useState<NotificationsQuery | null>();
  const [notifsNum, setNotifsNum] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("FirstTimeUser");
  const [seenNotifsNum, setSeenNotifsNum] = useState<number>();
  const [checkSwitch, setCheckSwitch] = useState<boolean>(false);
  const [pic, setPic] = useState<string>();
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
      await refreshAccessToken();
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
      if (newNotifs.notifications) {
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
  async function updatePic() {
    if (!customProfileQuery?.defaultProfile?.picture) return;
    let picURL: string =
      // @ts-ignore
      customProfileQuery.defaultProfile.picture.original.url ||
      // @ts-ignore
      customProfileQuery.defaultProfile.picture.uri;
    if (picURL) {
      picURL = picURL?.replace("ipfs://", "https://ipfs.io/ipfs/");
      setPic(picURL);
      return;
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
  useEffect(() => {
    updatePic();
  }, [pic, customProfileQuery]);
  if (!address) {
    return (
      <Box width="100%" flexDirection="row" display="flex">
        <Box
          alignItems="left"
          justifyContent="center"
          paddingLeft="4%"
          color="#572860"
        >
          <ConnectWallet colorMode="light" />
        </Box>
      </Box>
    );
  }
  if (isOnWrongNetwork) {
    return (
      <Button
        variant="solid"
        isLoading={checkSwitch}
        colorScheme="white"
        size="sm"
        onClick={async () => {
          setCheckSwitch(true);
          await switchNetwork?.(ChainId.Mumbai);
          setCheckSwitch(false);
        }}
      >
        Switch Network
      </Button>
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
      <Container display="flex" flexDirection="row" gap="8px">
        <Button
          variant="solid"
          isLoading={isSignedInQuery.isLoading}
          // colorScheme="white"
          size="sm"
          onClick={async () => {
            await requestLogin();
            setCurrentUser(address);
          }}
        >
          Login
        </Button>
        <Link href={"/createProfile"}>
          <Button variant="solid" size="sm">
            New user? Sign up!
          </Button>
        </Link>
      </Container>
    );
  }

  if (customProfileQuery == undefined && profileQuery.isLoading) {
    return <Spinner speed="1s" color="white"></Spinner>;
  }

  if (customProfileQuery == undefined && !profileQuery.data?.defaultProfile) {
    return (
      <Container display="flex" flexDirection="row" gap="8px">
        <Link href={"/createProfile"}>
          <Button variant="solid" colorScheme="white" size="sm">
            New user? Sign up!
          </Button>
        </Link>
      </Container>
    );
  }
  if (customProfileQuery == undefined && profileQuery.data?.defaultProfile) {
    storeProfileQuery(profileQuery.data, address);
    customProfileQuery = profileQuery.data;
  }
  if (customProfileQuery?.defaultProfile) {
    return (
      <Container
        display="flex"
        flexDirection="row"
        gap="12px"
        alignItems="center"
      >
        <Link href={`/profile/${customProfileQuery.defaultProfile?.handle}`}>
          <Avatar
            name={
              customProfileQuery.defaultProfile.name ||
              customProfileQuery.defaultProfile.handle
            }
            src={pic}
          />
        </Link>
        {notifs &&
          notifs.notifications &&
          notifs.notifications.items &&
          notifsNum &&
          seenNotifsNum &&
          (notifsNum - seenNotifsNum > 0 ? (
            <Box
              height="64px"
              alignItems="center"
              justifyContent="center"
              display="flex"
              width="12%"
            >
              <Link href="/profile/userNotifications">
                <VscBellDot size="20" color="white"></VscBellDot>
              </Link>
            </Box>
          ) : (
            <Link href="/profile/userNotifications">
              <VscBell></VscBell>
            </Link>
          ))}
      </Container>
    );
  }
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>Couldn't fetch profile</AlertTitle>
      <AlertDescription>Try to refresh the page</AlertDescription>
    </Alert>
  );
}
