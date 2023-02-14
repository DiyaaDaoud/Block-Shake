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

  async function updateNotifications() {
    if (!address) return;
    if (
      !customProfile?.defaultProfile?.id &&
      !profileQuery.data?.defaultProfile
    )
      return;
    if (!sdk) return;
    if (customNotifications == undefined) {
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
        setNotifs(newNotifs);
        storeNotifications(newNotifs, address);
      }
    } else {
      if (
        notifs?.notifications.pageInfo.totalCount !==
        customNotifications.notifications.pageInfo.totalCount
      ) {
        setNotifs(customNotifications);
      }
    }
  }
  async function updateSeenNotifications() {
    if (!address) return;
    if (
      !customProfile?.defaultProfile?.id &&
      !profileQuery.data?.defaultProfile
    )
      return;
    if (!sdk) return;
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
      if (seenNotifsNum !== customSeenNotifications) {
        setSeenNotifsNum(customSeenNotifications);
      }
    }
  }
  useEffect(() => {
    updateNotifications();
  }, [customNotifications, notifs]);
  useEffect(() => {
    updateSeenNotifications();
  }, [customSeenNotifications, seenNotifsNum]);

  if (!notifs?.notifications)
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className={styles.hint}>Loading Notifications ...</h3>
        </div>
      </div>
    );
  if (notifs?.notifications.items && seenNotifsNum) {
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
          {notifs.notifications.items.map((notification, index) => {
            // @ts-ignore
            return (
              <NotificationPreview
                notification={notification}
                alert={
                  index <
                  (notifs.notifications.pageInfo.totalCount ||
                    notifs.notifications.items.length) -
                    seenNotifsNum
                    ? true
                    : false
                }
                key={notification.notificationId}
              ></NotificationPreview>
            );
          })}
        </div>
      </div>
    );
  }
}
