import { Web3Button } from "@thirdweb-dev/react";
import { useState } from "react";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import useCreatePost from "../lib/useCreatePost";
import styles from "../styles/Create.module.css";

export default function Create() {
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const { mutateAsync: creatPost } = useCreatePost();

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <input
          className={styles.chooseFileContainer}
          type="file"
          onChange={(e) => {
            if (e.target.files) setImage(e.target.files[0]);
          }}
        ></input>
        <input
          className={styles.tilteContainer}
          type="text"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        ></input>
      </div>
      <div className={styles.formContainer}>
        <textarea
          className={styles.descriptionContainer}
          placeholder="Decription"
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <textarea
          className={styles.contentContainer}
          placeholder="Content"
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <Web3Button
          className={styles.createButton}
          contractAddress={LENS_CONTRACT_ADDRESS}
          contractAbi={LENS_CONTRACT_ABI}
          action={async () => {
            return await creatPost({ image, title, description, content });
          }}
        >
          Create post
        </Web3Button>
      </div>
    </div>
    // </div>
  );
}
