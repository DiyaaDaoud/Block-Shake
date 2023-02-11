import { MediaRenderer } from "@thirdweb-dev/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Profile, useProfileQuery } from "../graphql/generated";
import styles from "../styles/ProflePreview.module.css";
type Props = {
  profileId: Profile["id"];
};
export default function ProfilePreview({ profileId }: Props) {
  const [title, setTitle] = useState<string>("");
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfileQuery({ request: { profileId: profileId } });
  function updateUI() {
    let userName = profileData?.profile?.name;
    let userHandle = profileData?.profile?.handle;
    if (userName != null && userName != undefined) {
      if (userName.length > 20) {
        let shownUserName =
          userName.slice(0, 8) +
          "..." +
          userName.slice(userName.length - 8, userName.length);
        setTitle(shownUserName);
      } else {
        setTitle(userName);
      }
    } else {
      if (userHandle != null && userHandle != undefined) {
        if (userHandle.length > 20) {
          let shownUserHandle =
            userHandle.slice(0, 8) +
            "..." +
            userHandle.slice(userHandle.length - 8, userHandle.length);
          setTitle(shownUserHandle);
        } else {
          setTitle(userHandle);
        }
      }
    }
  }
  useEffect(() => {
    updateUI();
  });
  if (profileLoading) return <div>Loading Profile Preview</div>;
  if (profileError) return <div>Error loading Profile Preview</div>;

  console.log("inside profile preview");
  return (
    <div className={styles.ProfilePreviewContainer}>
      <div className={styles.profilePreviewHeader}>
        {/*@ts-ignore*/}
        {profileData.profile?.picture ? (
          <MediaRenderer
            // @ts-ignore
            src={
              // @ts-ignore
              profileData.profile?.picture
                ? // @ts-ignore
                  profileData.profile.picture.original?.url
                : // @ts-ignore
                  profileData.profile.picture.uri
            }
            alt={"profile pic"}
            className={styles.profilePreviewPicture}
          ></MediaRenderer>
        ) : (
          <MediaRenderer
            // @ts-ignore
            src={
              "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png"
            }
            alt={"profile picture"}
            className={styles.profilePreviewPicture}
          ></MediaRenderer>
        )}
        <Link
          className={styles.profilePreviewHandle}
          href={`/profile/${profileData.profile?.handle}`}
        >
          {title}
        </Link>
      </div>
      {/* <div className={styles.profilePreviewStats}>
        {profileData.profile?.stats && (
          <p>
            <Link
              href={{
                pathname: `/profile/[id]-following`,
                query: { id: `${profileData.profile.id}` },
              }}
            >
              Following: {profileData?.profile?.stats.totalFollowing}
            </Link>{" "}
            /{" "}
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
      </div> */}
    </div>
  );
}
