import { MediaRenderer } from "@thirdweb-dev/react";
import Link from "next/link";
import { NotificationsQuery, ReactionTypes } from "../graphql/generated";
import styles from "../styles/userNotifications.module.css";
type NotificationPreviewArgs = {
  notification: NotificationsQuery["notifications"]["items"][0];
};
export default function NotificationPreview({
  notification,
}: NotificationPreviewArgs) {
  if (notification.__typename == "NewCollectNotification") {
    const collector =
      notification.wallet.defaultProfile?.name ||
      notification.wallet.defaultProfile?.handle;
    const collectedPubType = notification.collectedPublication.__typename;
    const collectedPublicationId = notification.collectedPublication.id;
    // @ts-ignore
    const collectorPic = notification.wallet.defaultProfile?.picture
      ? // @ts-ignore
        notification.wallet.defaultProfile?.picture.uri ||
        // @ts-ignore
        notification.wallet.defaultProfile.picture.original.url
      : "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    return (
      <div className={styles.NotificationPreviewContainer}>
        <MediaRenderer
          src={collectorPic}
          className={styles.profilePreviewPicture}
        ></MediaRenderer>
        <Link
          href={{
            pathname: `/profile/publication/[publicationId]-collect`,
            query: { publicationId: `${collectedPublicationId}` },
          }}
        >
          {collector} has collected your {collectedPubType || "publication"}.
        </Link>
      </div>
    );
  }
  if (notification.__typename == "NewCommentNotification") {
    const commentor = notification.profile.name || notification.profile.handle;
    const pubType = notification.comment.commentOn?.__typename;
    const pubId = notification.comment.commentOn?.id;
    const commentorPic = notification.profile?.picture
      ? // @ts-ignore
        notification.profile?.picture.uri ||
        // @ts-ignore
        notification.profile?.picture.original.url
      : "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    return (
      <div className={styles.NotificationPreviewContainer}>
        <MediaRenderer
          src={commentorPic}
          className={styles.profilePreviewPicture}
        ></MediaRenderer>
        <Link
          href={{
            pathname: `/profile/publication/[publicationId]-comment`,
            query: { publicationId: `${pubId}` },
          }}
        >
          {commentor} has commented on your {pubType || "publication"}.
        </Link>
      </div>
    );
  }
  if (notification.__typename == "NewFollowerNotification") {
    const follower =
      notification.wallet.defaultProfile?.name ||
      notification.wallet.defaultProfile?.handle;
    const followerHandle = notification.wallet.defaultProfile?.handle;
    const followerPic = notification.wallet.defaultProfile?.picture
      ? // @ts-ignore
        notification.wallet.defaultProfile?.picture.uri ||
        // @ts-ignore
        notification.wallet.defaultProfile.picture.original.url
      : "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    return (
      <div className={styles.NotificationPreviewContainer}>
        <MediaRenderer
          src={followerPic}
          className={styles.profilePreviewPicture}
        ></MediaRenderer>
        <Link
          href={{
            pathname: `/profile/[id]`,
            query: { id: `${followerHandle}` },
          }}
        >
          {follower} has followed you.
        </Link>
      </div>
    );
  }
  if (notification.__typename == "NewMirrorNotification") {
    const user = notification.profile.name || notification.profile.handle;
    const pubType = notification.publication.__typename;
    const pubId = notification.publication.id;
    const userPic = notification.profile?.picture
      ? // @ts-ignore
        notification.profile?.picture.uri ||
        // @ts-ignore
        notification.profile.picture.original.url
      : "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    return (
      <div className={styles.NotificationPreviewContainer}>
        <MediaRenderer
          src={userPic}
          className={styles.profilePreviewPicture}
        ></MediaRenderer>
        <Link
          href={{
            pathname: `/profile/publication/[publicationId]-mirror`,
            query: { publicationId: `${pubId}` },
          }}
        >
          {user} has mirrored your {pubType || "publication"}.
        </Link>
      </div>
    );
  }
  if (notification.__typename == "NewReactionNotification") {
    const user = notification.profile.name || notification.profile.handle;
    const reaction =
      notification.reaction == ReactionTypes.Upvote ? "liked" : "disLiked";
    const pubType = notification.publication.__typename;
    const pubId = notification.publication.id;
    const userPic = notification.profile?.picture
      ? // @ts-ignore
        notification.profile?.picture.uri ||
        // @ts-ignore
        notification.profile.picture.original.url
      : "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png";
    return (
      <div className={styles.NotificationPreviewContainer}>
        <MediaRenderer
          src={userPic}
          className={styles.profilePreviewPicture}
        ></MediaRenderer>
        <Link
          href={{
            pathname: `/profile/publication/[publicationId]-comment`,
            query: { publicationId: `${pubId}` },
          }}
        >
          {user} has {reaction} your {pubType || "publication"}.
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.NotificationPreviewContainer}>
      can't show notification
    </div>
  );
}
