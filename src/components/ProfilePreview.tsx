import React, { useEffect, useState } from "react";
import { ProfileQuery } from "../graphql/generated";
import {
  Avatar,
  Box,
  Container,
  Flex,
  Heading,
  Skeleton,
} from "@chakra-ui/react";
import { readProfileQuery } from "../lib/helpers";
import { useAddress } from "@thirdweb-dev/react";
type Props = {
  profile: ProfileQuery["profile"];
};
const ProfilePreview = ({ profile }: Props) => {
  const address = useAddress();
  const [userName, setUserName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const customProfileQuery = readProfileQuery(address);
  async function fetchName() {
    if (!profile) return;
    if (profile.handle == customProfileQuery?.defaultProfile?.handle) {
      setUserName("You");
      return;
    }
    if (profile?.name && userName != profile.name) {
      setUserName(profile.name);
      return;
    }
    if (profile?.metadata && userName != undefined) {
      let metadataPath = profile.metadata;
      if (metadataPath.slice(0, 4) == "ipfs") {
        metadataPath = metadataPath.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const jsonObj = await (await fetch(metadataPath)).json();
      if (!jsonObj) return;
      const name = jsonObj.name;
      if (name) {
        setUserName(name);
      } else {
        setUserName(profile.handle);
      }
    } else {
      setUserName(profile.handle);
    }
  }
  async function updatePic() {
    if (!profile || !profile.picture) return;
    let picURL =
      // @ts-ignore
      profile.picture.original?.url ||
      // @ts-ignore
      profile.picture?.uri;
    if (picURL) {
      picURL = picURL?.replace("ipfs://", "https://ipfs.io/ipfs/");
      setProfilePic(picURL);
      return;
    }
  }
  useEffect(() => {
    fetchName();
  }, [profile]);
  useEffect(() => {
    updatePic();
  }, [profilePic]);
  return (
    // @ts-ignore
    <Flex flex="1" gap="4" alignItems="center" margin={2}>
      <Skeleton isLoaded={profilePic !== undefined}>
        <Avatar name={userName} src={profilePic} />
      </Skeleton>
      <Box>
        <Heading size="xs">{userName}</Heading>
      </Box>
    </Flex>
    // <Flex spacing="8">
    //     <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
    //       <Skeleton isLoaded={pic !== undefined}>
    //         <Avatar
    //           name={publication.profile.name || publication.profile.handle}
    //           src={pic}
    //         />
    //       </Skeleton>
    //       <Flex/>
    //       <Flex/>
  );
};

export default ProfilePreview;
