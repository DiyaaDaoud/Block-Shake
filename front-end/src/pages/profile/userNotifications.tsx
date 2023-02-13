import NotificationPreview from "@/src/components/NotificationPreview";
import {
  NOTIFICATIONS_HELPER_ABI,
  NOTIFICATIONS_HELPER_ADDRESS,
} from "@/src/constants/contracts";
import { fetcher } from "@/src/graphql/auth-fetcher";
import {
  NotificationsDocument,
  NotificationsQuery,
  NotificationsQueryVariables,
  useNotificationsQuery,
} from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import {
  readNotifications,
  readProfileQuery,
  readSeenNotifications,
  storeNotifications,
  storeSeenNotifications,
} from "@/src/lib/helpers";
import { useAddress, useSDK, Web3Button } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import styles from "../../styles/userNotifications.module.css";
export default function userNotifications() {
  const sdk = useSDK();
  const address = useAddress();
  const { isSignedInQuery, profileQuery } = useLensUser();
  const [notifs, setNotifs] = useState<NotificationsQuery>();
  const [seenNotifsNum, setSeenNotifsNum] = useState<number>();
  const customNotifications = readNotifications(address);
  const customProfile = readProfileQuery(address);
  let customSeenNotifications = readSeenNotifications(address);
  const {
    data: notifsData,
    isLoading: notifsLoading,
    isError: notifsError,
  } = useNotificationsQuery(
    {
      request: {
        profileId:
          customProfile?.defaultProfile?.id ||
          profileQuery.data?.defaultProfile?.id,
      },
    },
    {
      enabled: !!(
        customProfile?.defaultProfile?.id ||
        profileQuery.data?.defaultProfile?.id
      ),
    }
  );
  async function setAsRead(num: number) {
    if (!sdk) return;
    if (!address) return;
    const notificationsContract = await sdk.getContractFromAbi(
      NOTIFICATIONS_HELPER_ADDRESS,
      NOTIFICATIONS_HELPER_ABI
    );
    const result = await notificationsContract.call(
      "setSeenNotifications",
      address,
      num
    );
  }
  async function updateUI() {
    if (!address) return;
    if (
      !customProfile?.defaultProfile?.id &&
      !profileQuery.data?.defaultProfile
    )
      return;
    if (!sdk) return;
    if (!customNotifications?.notifications) {
      const notsQuery = fetcher<
        NotificationsQuery,
        NotificationsQueryVariables
      >(NotificationsDocument, {
        request: {
          profileId:
            customProfile?.defaultProfile?.id ||
            profileQuery?.data?.defaultProfile?.id,
        },
      });
      const newNotifs = await notsQuery();
      if (newNotifs.notifications) {
        // console.log("newNotifs: ", newNotifs);
        setNotifs(newNotifs);
        storeNotifications(newNotifs, address);
      }
    } else {
      setNotifs(customNotifications);
    }
    if (customSeenNotifications == undefined) {
      const notificationsContract = await sdk.getContractFromAbi(
        NOTIFICATIONS_HELPER_ADDRESS,
        NOTIFICATIONS_HELPER_ABI
      );
      const notifsFromContract = await notificationsContract.call(
        "getSeenNotifications",
        address
      );
      if (notifsFromContract) {
        setSeenNotifsNum(notifsFromContract);
        storeSeenNotifications(notifsFromContract, address);
      }
    } else {
      setSeenNotifsNum(customSeenNotifications);
    }
  }
  useEffect(() => {
    updateUI();
  });
  // if (notifsLoading) return <div>loading</div>;
  // if (notifsError) return <div>Error</div>;
  if (!notifs?.notifications) return <div>Loading Notifications</div>;
  // console.log("notifs: ", notifs);
  if (notifs?.notifications.items && seenNotifsNum) {
    // console.log("notifications are:", notifsData);
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className={styles.hint}>
            You have{" "}
            {(notifs.notifications.pageInfo.totalCount ||
              notifs.notifications.items.length) - seenNotifsNum}{" "}
            new notifications!
          </h3>

          <Web3Button
            className={styles.button}
            contractAddress={NOTIFICATIONS_HELPER_ADDRESS}
            contractAbi={NOTIFICATIONS_HELPER_ABI}
            action={async () => {
              // if(seenNotifsNum<notifs.notifications.items.length)
              await setAsRead(
                notifs.notifications.pageInfo.totalCount ||
                  notifs.notifications.items.length
              );
              storeSeenNotifications(
                notifs.notifications.pageInfo.totalCount ||
                  notifs.notifications.items.length,
                address
              );
            }}
          >
            Mark as Read
          </Web3Button>
        </div>
        <div className={styles.notificationsContainer}>
          {notifs.notifications.items.map((notification) => {
            // @ts-ignore
            return (
              <NotificationPreview
                notification={notification}
              ></NotificationPreview>
            );
          })}
        </div>
      </div>
    );
  }
}
