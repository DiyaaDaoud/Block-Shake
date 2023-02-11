import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import { ChangeEvent, useState } from "react";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import useCreateProfile from "../lib/useCreateProfile";
import styles from "../styles/CreateProfile.module.css";
export default function createProfilePage() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePath, setProfileImagePath] = useState<string>("");
  const [userHandle, setUserHandle] = useState<string>("");
  const { mutateAsync: createProfile } = useCreateProfile();
  return (
    <div className={styles.container}>
      <div className={styles.userContainer}>
        <div className={styles.formContainer}>
          <h3 className={styles.hint}>Your handle</h3>
          <input
            className={styles.tilteContainer}
            type="text"
            placeholder="type you prferred handle"
            onChange={(e) => {
              setUserHandle(e.target.value);
            }}
          ></input>
        </div>
        <div className={styles.formContainer}>
          <h3 className={styles.hint}>Select your profile image</h3>
          <input
            hidden
            id="uploadImage"
            type="File"
            onChange={(e) => {
              if (e.target.files) {
                setProfileImage(e.target.files[0]);
                setProfileImagePath(URL.createObjectURL(e.target.files[0]));
              }
            }}
          ></input>
          <button
            className={styles.chooseFileContainer}
            onClick={() => {
              return document.getElementById("uploadImage")?.click();
            }}
          >
            Upload image
          </button>
        </div>
      </div>

      {profileImagePath && (
        <div className={styles.imageContainer}>
          <img className={styles.image} src={profileImagePath}></img>
        </div>
      )}

      <div className={styles.createButtonContainer}>
        {userHandle && (
          <Web3Button
            className={styles.createButton}
            contractAddress={LENS_CONTRACT_ADDRESS}
            contractAbi={LENS_CONTRACT_ABI}
            action={async () => {
              return await createProfile({
                handle: userHandle,
                image: profileImage,
              });
            }}
          >
            Create Profile
          </Web3Button>
        )}
      </div>
    </div>
  );
}
