import { Box, Button, Checkbox, Flex } from "@chakra-ui/react";
import { TextField } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import useSetProfileMetadata from "../lib/useSetProfileMetadata";
import useLensUser from "../lib/auth/useLensUser";

const ProfileMetadata = () => {
  const [name, setName] = useState<string>("");
  const [originalName, setOriginalName] = useState<string>("");
  const [nameChanged, setNameChanged] = useState<boolean>(true);
  const [bio, setBio] = useState<string>("");
  const [originalBio, setOriginalBio] = useState<string>("");
  const [bioChanged, setBioChanged] = useState<boolean>(true);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>("");
  const [coverChanged, setCoverChanged] = useState<boolean>(true);
  const [originalCoverImageUrl, setoriginalCoverImageUrl] =
    useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { mutateAsync: setMetadata } = useSetProfileMetadata();
  const { profileQuery } = useLensUser();
  //   console.log(profileQuery.data?.defaultProfile);
  const fetchOriginalMetadat = async () => {
    if (!profileQuery.data?.defaultProfile?.metadata) return;
    let metadataPath = profileQuery.data?.defaultProfile?.metadata;
    // console.log("metadata", metadataPath);
    if (metadataPath.slice(0, 4) == "ipfs") {
      metadataPath = metadataPath.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    const jsonObj = await (await fetch(metadataPath)).json();
    if (!jsonObj) return;
    console.log("json", jsonObj);
    const name = profileQuery.data.defaultProfile.name || jsonObj.name;
    const cover_picture =
      profileQuery.data.defaultProfile.coverPicture || jsonObj.cover_picture;
    const bio = profileQuery.data.defaultProfile.bio || jsonObj.bio;
    if (name && originalName != name) setOriginalName(name);
    if (bio && originalBio != bio) setOriginalBio(bio);
    if (cover_picture && originalCoverImageUrl != cover_picture)
      setoriginalCoverImageUrl(
        cover_picture.replace("ipfs://", "https://ipfs.io/ipfs/")
      );
  };
  useEffect(() => {
    fetchOriginalMetadat();
  }, [originalCoverImageUrl, originalBio, originalName, profileQuery]);
  console.log(originalBio, originalCoverImageUrl, originalName);
  return (
    // @ts-ignore
    <Flex flexDirection="column" width="100%" alignItems="center" gap="10px">
      <Flex
        flexDirection="row"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box width="60%">
          <TextField
            inputProps={{ style: { fontSize: "small" } }}
            label="Name"
            variant="outlined"
            size="small"
            fullWidth
            disabled={nameChanged}
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></TextField>
        </Box>
        <Box justifyContent="start" width="25%">
          <Checkbox
            defaultChecked
            onChange={(e) => setNameChanged(e.target.checked)}
            colorScheme="gray"
          >
            <p style={{ fontSize: "small" }}>Keep the Name</p>
          </Checkbox>
        </Box>
      </Flex>
      <Flex
        flexDirection="row"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box width="60%">
          <TextField
            inputProps={{ style: { fontSize: "small" } }}
            label="Bio"
            variant="outlined"
            size="small"
            multiline
            fullWidth
            rows={2}
            disabled={bioChanged}
            onChange={(e) => {
              setBio(e.target.value);
            }}
          ></TextField>
        </Box>
        <Box justifyContent="start" width="25%">
          <Checkbox
            defaultChecked
            onChange={(e) => setBioChanged(e.target.checked)}
            colorScheme="gray"
          >
            <p style={{ fontSize: "small" }}>Keep the Bio</p>
          </Checkbox>
        </Box>
      </Flex>
      <Flex
        flexDirection="row"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box style={{ width: "60%" }}>
          {imagePath && (
            <img
              hidden={coverChanged}
              src={imagePath}
              alt="image"
              style={{ borderRadius: "7px" }}
            ></img>
          )}
        </Box>
        <Box justifyContent="start" width="25%">
          <Flex flexDirection="column" gap="6px">
            <Checkbox
              defaultChecked
              onChange={(e) => {
                setCoverChanged(e.target.checked);
              }}
              colorScheme="gray"
            >
              <p style={{ fontSize: "small" }}>Keep the Cover</p>
            </Checkbox>
            <Button
              bgColor="#501030"
              variant="solid"
              color="white"
              size="xs"
              hidden={coverChanged}
            >
              <label for="files">Set Cover pic</label>
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Button
        bgColor="#501030"
        variant="solid"
        color="white"
        size="xs"
        hidden={coverChanged && nameChanged && bioChanged}
        isLoading={buttonLoading}
        onClick={async () => {
          setButtonLoading(true);
          const newName = nameChanged ? originalName : name;
          const newBio = bioChanged ? originalBio : bio;
          console.log(newName, newBio, coverImage, originalCoverImageUrl);
          if (coverChanged) {
            await setMetadata({
              bio: newBio,
              cover_image: coverImage,
              name: newName,
              coverImageUri: originalCoverImageUrl,
            });
          } else {
            await setMetadata({
              bio: newBio,
              cover_image: coverImage,
              name: newName,
            });
          }
          setButtonLoading(false);
        }}
      >
        Set New Metadata
      </Button>
      <input
        hidden
        id="files"
        type="file"
        title=""
        onChange={(e) => {
          if (e.target.files) {
            setCoverImage(e.target.files[0]);
            setImagePath(URL.createObjectURL(e.target.files[0]));
          }
        }}
      ></input>
    </Flex>
  );
};

export default ProfileMetadata;
