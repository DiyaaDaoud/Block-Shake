import { Web3Button } from "@thirdweb-dev/react";
import { useState } from "react";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import useSetProfileImage from "../lib/useSetProfileImage";
import styles from "../styles/SetProfileImage.module.css";
export default function setProfileImage() {
  const [image, setImage] = useState<File | null>(null);
  const { mutateAsync: changeImage } = useSetProfileImage();
  const [profileImagePath, setProfileImagePath] = useState<string>("");
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h3 className={styles.hint}>select your new profile picture</h3>
        <input
          className={styles.chooseFileContainer}
          type="file"
          onChange={(e) => {
            if (e.target.files) {
              setImage(e.target.files[0]);
              setProfileImagePath(URL.createObjectURL(e.target.files[0]));
            }
          }}
        ></input>
        {profileImagePath && (
          <div className={styles.imageContainer}>
            <img src={profileImagePath} className={styles.image}></img>
          </div>
        )}
        <div className={styles.createButtonContainer}>
          <Web3Button
            className={styles.createButton}
            contractAddress={LENS_CONTRACT_ADDRESS}
            contractAbi={LENS_CONTRACT_ABI}
            action={async () => {
              if (!image) return;
              await changeImage(image);
            }}
          >
            Set Image
          </Web3Button>
        </div>
      </div>
    </div>
  );
}
