import FeedPost from "@/src/components/FeedPost";
import ProfilePreview from "@/src/components/ProfilePreview";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "@/src/constants/contracts";
import { useFollowersQuery, useProfileQuery } from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import useFollow from "@/src/lib/useFollow";
import useUnFollow from "@/src/lib/useUnFollow";
import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Profile.module.css";
export default function followersPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedInQuery, profileQuery } = useLensUser();
  const { mutateAsync: followUser } = useFollow();
  const { mutateAsync: unfollowUser } = useUnFollow();
  const [userName, setUserName] = useState<string | null>();
  const [userbio, setUserBio] = useState<string | null>();
  const [usercoverImage, setUserCoverImage] = useState<string>();
  const {
    isLoading: loadingProfile,
    data: profileData,
    error: profileError,
  } = useProfileQuery(
    {
      request: {
        profileId: id,
      },
    },
    {
      enabled: !!id,
    }
  );
  const {
    isLoading: loadingFollowers,
    data: followersData,
    error: followersError,
  } = useFollowersQuery(
    {
      request: {
        profileId: id,
      },
    },
    { enabled: !!id }
  );
  async function fetchMetadata() {
    if (!profileData?.profile?.metadata) return;
    let metadataPath = profileData?.profile?.metadata;
    if (metadataPath.slice(0, 4) == "ipfs") {
      metadataPath = metadataPath.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const jsonObj = await (await fetch(metadataPath)).json();
    if (!jsonObj) return;
    const name = jsonObj.name;
    const cover_picture = jsonObj.cover_picture;
    const bio = jsonObj.bio;
    if (name && userName != name) setUserName(name);
    if (cover_picture && usercoverImage != cover_picture)
      setUserCoverImage(cover_picture);
    if (bio && userbio != bio) setUserBio(bio);
  }
  useEffect(() => {
    fetchMetadata();
  });
  if (loadingProfile) return <div>Loading profile</div>;
  if (profileError) return <div>Error feching the profile data</div>;
  if (loadingFollowers) return <div>Loading followers...</div>;
  if (followersError) return <div>Error fetching the followers data</div>;
  if (profileData && followersData) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileContentContainer}>
          {/**cover Image */}

          {/* @ts-ignore */}
          {profileData?.profile?.coverPicture ? (
            <MediaRenderer
              // @ts-ignore
              src={profileData.profile.coverPicture.original.url}
              alt={"user cover Image"}
              className={styles.coverImageContainer}
            ></MediaRenderer>
          ) : usercoverImage ? (
            <MediaRenderer
              // @ts-ignore
              src={usercoverImage}
              alt={"user cover image"}
              className={styles.coverImageContainer}
            ></MediaRenderer>
          ) : (
            <MediaRenderer
              // @ts-ignore
              src={
                "https://gateway.pinata.cloud/ipfs/QmcRcEpYM22FgQ8i4AhNCNW11EhTAy5S3jV79bd4X72EHH?_gl=1*14fuglz*_ga*MjExMjE2NTY3MS4xNjcxNTUyNDkx*_ga_5RMPXG14TE*MTY3NDkwMTg1NC4yLjEuMTY3NDkwMzUxNy41MS4wLjA."
              }
              alt={"default cover Image"}
              className={styles.coverImageContainer}
            ></MediaRenderer>
          )}

          {/** profile picture */}

          {/* @ts-ignore */}
          {profileData?.profile?.picture ? (
            <div>
              <MediaRenderer
                // @ts-ignore
                src={
                  // @ts-ignore
                  profileData.profile.picture.original
                    ? // @ts-ignore
                      profileData.profile.picture.original.url
                    : // @ts-ignore
                      profileData.profile.picture.uri
                }
                alt={"profile pic"}
                className={styles.profilePictureContainer}
              ></MediaRenderer>
            </div>
          ) : (
            <MediaRenderer
              // @ts-ignore
              src={
                "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png"
              }
              alt={"profile picture"}
              className={styles.profilePictureContainer}
            ></MediaRenderer>
          )}

          {/**profile name */}
          <h1 className={styles.profileName}>
            {profileData?.profile?.name || userName || "Anon User"}
          </h1>
          {/**profile handle */}
          <h3 className={styles.profileHandle}>
            {profileData?.profile?.handle}
          </h3>
          {/**profile description */}
          <p className={styles.profileDescription}>
            {profileData?.profile?.bio || userbio}
          </p>
          {profileData?.profile?.stats && (
            <p className={styles.followerCount}>
              <Link
                href={{
                  pathname: `/profile/[id]-following`,
                  query: { id: `${profileData.profile.id}` },
                }}
              >
                Following: {profileData?.profile?.stats.totalFollowing}
              </Link>
              /
              <Link
                href={{
                  pathname: `/profile/[id]-followers`,
                  query: { id: `${profileData.profile.id}` },
                }}
              >
                Followers: {profileData?.profile?.stats.totalFollowers}
              </Link>
            </p>
          )}
          {profileQuery.data?.defaultProfile?.id !== profileData?.profile?.id &&
            (profileData?.profile?.isFollowedByMe ? (
              <Web3Button
                contractAddress={LENS_CONTRACT_ADDRESS}
                contractAbi={LENS_CONTRACT_ABI}
                action={async () => {
                  await unfollowUser(profileData?.profile?.id);
                }}
              >
                UnFollow
              </Web3Button>
            ) : (
              <Web3Button
                contractAddress={LENS_CONTRACT_ADDRESS}
                contractAbi={LENS_CONTRACT_ABI}
                action={async () => {
                  await followUser(profileData?.profile?.id);
                }}
              >
                Follow
              </Web3Button>
            ))}
          <h2 style={{ marginTop: 15 }}>
            {profileData.profile?.handle} is followed by:
          </h2>
          <div className={styles.followesProfiles}>
            {followersData.followers.items.map((follower) => {
              return (
                <div>
                  <ProfilePreview
                    profileId={follower.wallet.defaultProfile?.id}
                  ></ProfilePreview>
                </div>
                // <Link
                //   href={{
                //     pathname: `/profile/[id]`,
                //     query: {
                //       id: `${follower?.wallet?.defaultProfile?.handle}`,
                //     },
                //   }}
                // >
                //   {follower.wallet.defaultProfile?.handle}
                // </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
