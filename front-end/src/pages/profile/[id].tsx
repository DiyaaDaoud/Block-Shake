import {
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
  PublicationsDocument,
  PublicationsQuery,
  PublicationsQueryVariables,
  useProfileQuery,
  usePublicationsQuery,
} from "@/src/graphql/generated";
import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import styles from "../../styles/Profile.module.css";
import FeedPost from "@/src/components/FeedPost";
import CreatePost from "../../components/CreatePost";
import {
  LENS_CONTRACT_ADDRESS,
  LENS_CONTRACT_ABI,
} from "@/src/constants/contracts";
import useFollow from "@/src/lib/useFollow";
import Link from "next/link";
import useUnFollow from "@/src/lib/useUnFollow";
import useLensUser from "@/src/lib/auth/useLensUser";
import { useEffect, useState } from "react";
import { fetcher } from "@/src/graphql/auth-fetcher";
type Props = {};
import { Avatar } from "@mui/material";
export default function profilePage({}: Props) {
  const router = useRouter();
  const { id } = router.query;
  const { mutateAsync: followUser } = useFollow();
  const { mutateAsync: unfollowUser } = useUnFollow();
  const { isSignedInQuery, profileQuery } = useLensUser();
  const [profileDataState, setProfileDataState] = useState<ProfileQuery>();
  const [publicationsDataState, setPublicationsDataState] =
    useState<PublicationsQuery>();
  const [userName, setUserName] = useState<string | null>();
  const [userbio, setUserBio] = useState<string | null>();
  const [usercoverImage, setUserCoverImage] = useState<string>();
  const [imageIsAvatar, setImageIsAvatar] = useState<boolean>(false);
  let {
    isLoading: loadingProfile,
    data: profileData,
    error: profileError,
  } = useProfileQuery(
    {
      request: {
        handle: id,
      },
    },
    {
      enabled: !!id,
    }
  );

  let {
    isLoading: loadingPublications,
    data: publicationsData,
    error: publicationsError,
  } = usePublicationsQuery(
    {
      request: {
        profileId: profileData?.profile?.id,
      },
    },
    {
      enabled: !!profileData?.profile?.id,
    }
  );
  // if (profileError) {
  //   return <div>Error loading profile</div>;
  // }
  // if (loadingProfile) {
  //   return <div>loading profile</div>;
  // }
  // if (publicationsError) {
  //   return <div>Error loading publications</div>;
  // }
  async function fetchMetadata() {
    if (!profileData?.profile?.metadata) return;
    let metadataPath = profileData?.profile?.metadata;
    if (metadataPath.slice(0, 4) == "ipfs") {
      metadataPath = metadataPath.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const jsonObj = await (await fetch(metadataPath)).json();
    const name = jsonObj.name;
    const cover_picture = jsonObj.cover_picture;
    const bio = jsonObj.bio;
    if (name) setUserName(name);
    if (cover_picture) setUserCoverImage(cover_picture);
    if (bio) setUserBio(bio);
    // console.log("name: ", name, " bio: ", bio, " cover pic: ", cover_picture);
  }

  async function updatUI() {
    if (!id) return;
    // console.log("in 0");
    const profile = fetcher<ProfileQuery, ProfileQueryVariables>(
      ProfileDocument,
      {
        request: { handle: id },
      }
    );
    // console.log("in 1");
    profileData = await profile();
    // console.log("in 2");
    const publications = fetcher<PublicationsQuery, PublicationsQueryVariables>(
      PublicationsDocument,
      {
        request: { profileId: profileData.profile?.id },
      }
    );
    // console.log("in 3");
    publicationsData = await publications();
    // console.log("in 4");
    if (profileData.profile) {
      setProfileDataState(profileData);
      // @ts-ignore
      if (profileData.profile.picture?.original?.url) {
        if (
          // @ts-ignore
          profileData.profile.picture.original.url.slice(0, 18) ==
          "https://ui-avatars"
        ) {
          setImageIsAvatar(true);
        }
      }
    }
    if (publicationsData.publications) {
      setPublicationsDataState(publicationsData);
    }
    await fetchMetadata();
    // @ts-ignore
  }

  useEffect(() => {
    updatUI();
  });
  // console.log("profileData: ", profileData);
  if (profileData?.profile) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileContentContainer}>
          {}
          {/**cover Image */}

          {/* @ts-ignore */}
          {profileDataState?.profile?.coverPicture ? (
            <MediaRenderer
              // @ts-ignore
              src={profileDataState.profile.coverPicture.original.url}
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
          {profileDataState?.profile?.picture ? (
            <div className={styles.profilePicWithButon}>
              {imageIsAvatar ? (
                // @ts-ignore
                <Avatar
                  // @ts-ignore
                  src={profileData?.profile?.picture?.original?.url}
                  className={styles.profilePictureContainer}
                  alt={"profile pic"}
                ></Avatar>
              ) : (
                <MediaRenderer
                  // @ts-ignore
                  src={
                    // @ts-ignore
                    profileDataState.profile.picture.original
                      ? // @ts-ignore
                        profileDataState.profile.picture.original.url
                      : // @ts-ignore
                        profileDataState.profile.picture.uri
                  }
                  alt={"profile pic"}
                  className={styles.profilePictureContainer}
                ></MediaRenderer>
              )}

              {profileQuery.data?.defaultProfile?.id ===
                profileDataState.profile.id && (
                <div className={styles.editingButtons}>
                  <Link href={"/setProfileImage"}>
                    <button className={styles.setPicButton}>
                      Change Profile Image
                    </button>
                  </Link>
                  <Link href={"/setProfileMetadata"}>
                    <button className={styles.setPicButton}>
                      Change Profile Data
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.profilePicWithButon}>
              <MediaRenderer
                // @ts-ignore
                src={
                  "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png"
                }
                alt={"profile picture"}
                className={styles.profilePictureContainer}
              ></MediaRenderer>

              {profileQuery.data?.defaultProfile?.id ===
                profileDataState?.profile?.id && (
                <div>
                  <Link href={"/setProfileImage"}>
                    <button className={styles.setPicButton}>
                      Change Profile Image
                    </button>
                  </Link>
                  <Link href={"/setProfileMetadata"}>
                    <button className={styles.setPicButton}>
                      Change Profile Data
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/**profile name */}
          <h1 className={styles.profileName}>
            {profileDataState?.profile?.name || userName || "Anon User"}
          </h1>
          {/**profile handle */}
          <h3 className={styles.profileHandle}>
            {profileDataState?.profile?.handle}
          </h3>
          {/**profile description */}
          <p className={styles.profileDescription}>
            {profileDataState?.profile?.bio || userbio}
          </p>
          {profileDataState?.profile?.stats && (
            <p className={styles.followerCount}>
              <Link
                href={{
                  pathname: `/profile/[id]-following`,
                  query: { id: `${profileDataState.profile.id}` },
                }}
              >
                Following: {profileDataState?.profile?.stats.totalFollowing}
              </Link>{" "}
              /{" "}
              <Link
                href={{
                  pathname: `/profile/[id]-followers`,
                  query: { id: `${profileDataState.profile.id}` },
                }}
              >
                Followers: {profileDataState?.profile?.stats.totalFollowers}
              </Link>
            </p>
          )}
          {profileQuery.data?.defaultProfile?.id !==
            profileDataState?.profile?.id &&
            (profileDataState?.profile?.isFollowedByMe ? (
              <Web3Button
                className={styles.followButton}
                contractAddress={LENS_CONTRACT_ADDRESS}
                contractAbi={LENS_CONTRACT_ABI}
                action={async () => {
                  await unfollowUser(profileDataState?.profile?.id);
                }}
              >
                UnFollow
              </Web3Button>
            ) : (
              <Web3Button
                className={styles.followButton}
                contractAddress={LENS_CONTRACT_ADDRESS}
                contractAbi={LENS_CONTRACT_ABI}
                action={async () => {
                  await followUser(profileDataState?.profile?.id);
                }}
              >
                Follow
              </Web3Button>
            ))}

          <div className={styles.publicationsContainer}>
            {isSignedInQuery.data && (
              <div>
                <CreatePost></CreatePost>
              </div>
            )}
            {loadingPublications ? (
              <div>Loading Publications</div>
            ) : publicationsDataState?.publications?.items ? (
              publicationsDataState?.publications.items.map((publication) =>
                publication.__typename == "Post" ? (
                  <FeedPost
                    publication={publication}
                    key={publication.id}
                  ></FeedPost>
                ) : null
              )
            ) : (
              <p> No post Loaded for this profile</p>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileContentContainer}>
          <h3 className={styles.profileName}>Loading profile...</h3>
          <h3 className={styles.profileName}>
            if it took much time, please try to refresh the page
          </h3>
        </div>
      </div>
    );
  }
}
