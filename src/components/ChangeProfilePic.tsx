import { Avatar, Box, Button, Flex } from "@chakra-ui/react";
import Image from "next/image";
import React, { useState } from "react";
import useLensUser from "../lib/auth/useLensUser";
import useSetProfileImage from "../lib/useSetProfileImage";

const ChangeProfilePic = () => {
  const [newProfilePic, setnewProfilePic] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { mutateAsync: setImage } = useSetProfileImage();
  return (
    // @ts-ignore
    <Flex flexDirection="column" width="100%" alignItems="center" gap="10px">
      <Button bgColor="#501030" variant="solid" color="white" size="xs">
        <label for="files">Select New Profile Pic</label>
      </Button>
      {imagePath != "" && (
        <img
          src={imagePath}
          alt="new image"
          style={{ maxHeight: "300px", maxWidth: "200px" }}
        ></img>
      )}
      {imagePath != "" && (
        <Button
          bgColor="#501030"
          variant="solid"
          color="white"
          size="xs"
          isLoading={buttonLoading}
          onClick={async () => {
            setButtonLoading(true);
            await setImage(newProfilePic);
            setButtonLoading(false);
          }}
        >
          Set New Profile Pic
        </Button>
      )}
      <input
        hidden
        id="files"
        type="file"
        title=""
        onChange={(e) => {
          if (e.target.files) {
            setnewProfilePic(e.target.files[0]);
            setImagePath(URL.createObjectURL(e.target.files[0]));
          }
        }}
      ></input>
    </Flex>
  );
};

export default ChangeProfilePic;
