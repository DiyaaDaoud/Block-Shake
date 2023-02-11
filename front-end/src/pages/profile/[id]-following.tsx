import ProfilePreview from "@/src/components/ProfilePreview";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "@/src/constants/contracts";
import { useFollowingQuery, useProfileQuery } from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import useFollow from "@/src/lib/useFollow";
import useUnFollow from "@/src/lib/useUnFollow";
import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Profile.module.css";
export default function followersPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isSignedInQuery, profileQuery } = useLensUser();
  const { mutateAsync: followUser } = useFollow();
  const { mutateAsync: unfollowUser } = useUnFollow();
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
  console.log("profileData: ", profileData);
  const {
    isLoading: loadingFollowing,
    data: followingData,
    error: followingError,
  } = useFollowingQuery(
    {
      request: {
        address: profileData?.profile?.ownedBy,
      },
    },
    { enabled: !!profileData }
  );
  if (loadingProfile) return <div>Loading profile</div>;
  if (profileError) return <div>Error feching the profile data</div>;
  if (loadingFollowing) return <div>Loading followers...</div>;
  if (followingError) return <div>Error fetching the followers data</div>;
  if (profileData && followingData) {
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
            {profileData?.profile?.name || "Anon User"}
          </h1>
          {/**profile handle */}
          <h3 className={styles.profileHandle}>
            {profileData?.profile?.handle}
          </h3>
          {/**profile description */}
          <p className={styles.profileDescription}>
            {profileData?.profile?.bio}
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
            {profileData.profile?.handle} is following:
          </h2>
          <div className={styles.followesProfiles}>
            {followingData.following.items.map((user) => {
              return (
                <div>
                  <ProfilePreview profileId={user.profile.id}></ProfilePreview>
                </div>
                // <Link
                //   href={{
                //     pathname: `/profile/[id]`,
                //     query: { id: `${user.profile.handle}` },
                //   }}
                // >
                //   {user.profile.handle}
                // </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
