import { Web3Button } from "@thirdweb-dev/react";
import { useState } from "react";
import {
  LENS_PERIPHERY_ABI,
  LENS_PERIPHERY_ADDRESS,
} from "../constants/contracts";
import useSetProfileMetadata from "../lib/useSetProfileMetadata";
import styles from "../styles/SetProfileMetadat.module.css";
export default function setProfileMetadata() {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>();
  const [bio, setBio] = useState<string>("");
  const [name, setName] = useState<string>("");
  const { mutateAsync: setMetadata } = useSetProfileMetadata();
  return (
    <div className={styles.container}>
      <h4 className={styles.hint}>
        Fill in the following to edit your profile
      </h4>
      <div className={styles.forumContainer}>
        <div className={styles.inputSection}>
          <h5 className={styles.hint}>choose your Cover photo</h5>
          <input
            type="file"
            className={styles.inputButton}
            onChange={(e) => {
              if (e.target.files) {
                setCoverImage(e.target.files[0]);
                setImagePath(URL.createObjectURL(e.target.files[0]));
              }
            }}
          ></input>
          {imagePath && (
            <div className={styles.imageContainer}>
              <img src={imagePath} className={styles.image}></img>
            </div>
          )}
        </div>
        <div className={styles.inputSection}>
          <h5 className={styles.hint}>type in your Name</h5>
          <textarea
            className={styles.name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></textarea>
        </div>
        <div className={styles.inputSection}>
          <h5 className={styles.hint}>type in your Bio</h5>
          <textarea
            className={styles.bio}
            onChange={(e) => {
              setBio(e.target.value);
            }}
          ></textarea>
        </div>
      </div>
      <div>
        <Web3Button
          className={styles.setButton}
          contractAddress={LENS_PERIPHERY_ADDRESS}
          contractAbi={LENS_PERIPHERY_ABI}
          action={async () => {
            if (coverImage || bio || name)
              await setMetadata({
                cover_image: coverImage,
                name: name,
                bio: bio,
              });
          }}
        >
          Set Profile Metadata
        </Web3Button>
      </div>
    </div>
  );
}
