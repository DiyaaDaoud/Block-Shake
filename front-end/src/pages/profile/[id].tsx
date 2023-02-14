import {
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
  PublicationsDocument,
  PublicationsQuery,
  PublicationsQueryVariables,
  useProfileQuery,
  usePublicationsQuery,
  PublicationTypes,
} from "@/src/graphql/generated";
import { MediaRenderer, useAddress, Web3Button } from "@thirdweb-dev/react";
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
import { readProfileQuery } from "@/src/lib/helpers";
export default function profilePage({}: Props) {
  const router = useRouter();
  const { id } = router.query;
  const address = useAddress();
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
  let customProfile = readProfileQuery(address);
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
  console.log("profileDataState", profileDataState);
  let {
    isLoading: loadingPublications,
    data: publicationsData,
    error: publicationsError,
  } = usePublicationsQuery(
    {
      request: {
        profileId: profileData?.profile?.id,
        publicationTypes: [PublicationTypes.Post],
      },
    },
    {
      enabled: !!profileData?.profile?.id,
    }
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
  async function updateProfile() {
    if (!id) return;
    const profile = fetcher<ProfileQuery, ProfileQueryVariables>(
      ProfileDocument,
      {
        request: { handle: id },
      }
    );
    profileData = await profile();
    if (
      profileData.profile &&
      (profileDataState == undefined || profileDataState !== profileData)
    ) {
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
    await fetchMetadata();
  }
  async function updatePublications() {
    if (!id) return;
    if (profileData == undefined) return;
    const publications = fetcher<PublicationsQuery, PublicationsQueryVariables>(
      PublicationsDocument,
      {
        request: {
          profileId: profileData.profile?.id,
          publicationTypes: [PublicationTypes.Post],
        },
      }
    );
    publicationsData = await publications();
    if (
      publicationsData.publications &&
      publicationsDataState !== publicationsData
    ) {
      setPublicationsDataState(publicationsData);
    }
  }
  useEffect(() => {
    updateProfile();
  }, [profileDataState, userName, usercoverImage, userbio, profileData]);
  useEffect(() => {
    updatePublications();
  }, [publicationsDataState, profileData]);
  if (profileDataState?.profile) {
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

              {customProfile?.defaultProfile?.id ===
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

              {customProfile?.defaultProfile?.id ===
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
          {customProfile?.defaultProfile?.id !==
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
              publicationsDataState?.publications.items.map((publication) => (
                <FeedPost
                  publication={publication}
                  key={publication.id}
                ></FeedPost>
              ))
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
        </div>
      </div>
    );
  }
}
