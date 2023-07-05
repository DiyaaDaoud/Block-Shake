import ChangeProfilePic from "@/src/components/ChangeProfilePic";
import CreatePost from "@/src/components/CreatePost";
import FeedPost from "@/src/components/FeedPost";
import ProfileMetadata from "@/src/components/ProfileMetadata";
import ProfilePreview from "@/src/components/ProfilePreview";
import {
  PublicationTypes,
  useFollowersQuery,
  useFollowingQuery,
  useProfileQuery,
  usePublicationsQuery,
} from "@/src/graphql/generated";
import { readAccessToken } from "@/src/lib/auth/helpers";
import { readProfileQuery } from "@/src/lib/helpers";
import useDisableDispatcher from "@/src/lib/useDisableDispatcher";
import useFollow from "@/src/lib/useFollow";
import useSetDispatcher from "@/src/lib/useSetDispatcher";
import useSetProfileImage from "@/src/lib/useSetProfileImage";
import useUnfollow from "@/src/lib/useUnFollow";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Divider,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { TextField } from "@mui/material";
import { useAddress } from "@thirdweb-dev/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
export default function proilePage() {
  const router = useRouter();
  const { handle } = router.query;
  const address = useAddress();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const { mutateAsync: setDispatcher } = useSetDispatcher();
  const { mutateAsync: disableDispatcher } = useDisableDispatcher();
  const { mutateAsync: setProfileImage } = useSetProfileImage();
  const { mutateAsync: follow } = useFollow();
  const { mutateAsync: unfollow } = useUnfollow();

  const [pic, setPic] = useState<string>();
  const [cover, setCover] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const [userBio, setUserBio] = useState<string>();
  const [hasFollowed, setHasFollowed] = useState<boolean | null>(null);
  const [buttonLoad, setButtonLoad] = useState<boolean>(false);
  const [followPressed, setFollowPressed] = useState<boolean>(false);
  let customProfileQuery = readProfileQuery(address);
  let accessToken = readAccessToken();
  let {
    isLoading: loadingProfile,
    data: profileData,
    error: profileError,
  } = useProfileQuery(
    {
      request: {
        handle: handle,
      },
    },
    {
      enabled: !!handle,
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
        publicationTypes: [PublicationTypes.Post],
      },
    },
    {
      enabled: !!profileData?.profile?.id,
    }
  );
  const {
    isLoading: loadingFollowers,
    data: followersData,
    error: followersError,
  } = useFollowersQuery(
    {
      request: {
        profileId: profileData?.profile?.id,
      },
    },
    { enabled: !!profileData?.profile?.id }
  );
  const {
    isLoading: loadingFollowing,
    data: followingData,
    error: followingError,
  } = useFollowingQuery(
    {
      request: {
        address: profileData?.profile?.ownedBy,
      },
    },
    { enabled: !!profileData }
  );
  const {
    onOpen: metadataOnOppen,
    isOpen: metadataIsOppen,
    onClose: metadataOnClose,
  } = useDisclosure();
  const {
    onOpen: followersOnOppen,
    isOpen: followersIsOppen,
    onClose: followersOnClose,
  } = useDisclosure();
  const {
    onOpen: followingOnOppen,
    isOpen: followingIsOppen,
    onClose: followingOnClose,
  } = useDisclosure();
  const {
    onOpen: profilePicOnOppen,
    isOpen: profilePicIsOppen,
    onClose: profilePicOnClose,
  } = useDisclosure();
  const {
    onOpen: changeProfilePicOnOppen,
    isOpen: changeProfilePicIsOppen,
    onClose: changeProfilePicOnClose,
  } = useDisclosure();
  async function updateUserAddress() {
    if (address) {
      if (userAddress != address) {
        setUserAddress(address);
      }
    } else {
      setUserAddress(null);
    }
  }
  async function updateMetaData() {
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
    if (bio && userBio != bio) setUserBio(bio);
    if (cover_picture && cover != cover_picture)
      setCover(cover_picture.replace("ipfs://", "https://ipfs.io/ipfs/"));
  }
  async function updatePic() {
    if (!profileData?.profile?.picture) return;
    let picURL: string =
      // @ts-ignore
      profileData.profile.picture.original.url ||
      // @ts-ignore
      profileData.profile.picture.uri;
    if (picURL) {
      picURL = picURL?.replace("ipfs://", "https://ipfs.io/ipfs/");
      setPic(picURL);
      return;
    }
  }
  async function updateHasFollowed() {
    if (!profileData?.profile || !customProfileQuery?.defaultProfile) return;
    if (profileData.profile.isFollowedByMe) {
      setHasFollowed(true);
    } else {
      setHasFollowed(false);
    }
  }
  useEffect(() => {
    updateUserAddress();
  }, [address, userAddress]);
  useEffect(() => {
    updateMetaData();
  }, [profileData, cover, userName, userBio]);
  useEffect(() => {
    updatePic();
  }, [profileData, pic]);
  useEffect(() => {
    updateHasFollowed();
  }, [profileData, hasFollowed]);
  if (loadingProfile) {
    return (
      // @ts-ignore
      <Spinner
        color="#501030"
        speed="1.5s"
        marginLeft="50%"
        marginTop="10%"
      ></Spinner>
    );
  }
  if (profileError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Couldn't fetch profile</AlertTitle>
        <AlertDescription>Try to refresh the page</AlertDescription>
      </Alert>
    );
  }
  if (profileData?.profile) {
    return (
      <Box width="70%" marginLeft="20%" marginRight="20%">
        <Modal
          blockScrollOnMount={false}
          isOpen={metadataIsOppen}
          onClose={metadataOnClose}
        >
          <ModalOverlay />
          <ModalContent maxWidth="45%" marginTop="10%">
            <ModalHeader>Set your Metadata</ModalHeader>
            <ModalCloseButton />
            <ModalBody maxW="100%">
              <ProfileMetadata></ProfileMetadata>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          blockScrollOnMount={false}
          isOpen={followersIsOppen}
          onClose={followersOnClose}
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent maxWidth="35%" marginTop="7%">
            <ModalHeader>
              People Who Follow {userName != "" ? userName : handle}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody maxW="100%">
              {followersData?.followers.items.map((follower, index) => (
                <>
                  <ProfilePreview profile={follower.wallet.defaultProfile} />
                  {index != followersData.followers.items.length - 1 && (
                    <Divider color="gray" borderColor="gray" width={"100%"} />
                  )}
                </>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          blockScrollOnMount={false}
          isOpen={followingIsOppen}
          onClose={followingOnClose}
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent maxWidth="35%" marginTop="7%">
            <ModalHeader>
              {userName != "" ? userName : handle} Follows:
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody maxW="100%">
              {followingData?.following.items.map((following, index) => (
                <>
                  <ProfilePreview profile={following.profile} />
                  {index != followingData?.following.items.length - 1 && (
                    <Divider color="gray" borderColor="gray" width={"100%"} />
                  )}
                </>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          blockScrollOnMount={false}
          isOpen={profilePicIsOppen}
          onClose={profilePicOnClose}
          scrollBehavior="inside"
        >
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent
            maxWidth="35%"
            marginTop="7%"
            flex="flex"
            justifyContent="center"
            alignItems="center"
            background={""}
          >
            <ModalBody maxW="80%" maxH="80%">
              <Image
                src={pic}
                alt="profile pic"
                width="100%"
                borderRadius="50%"
                height="75%"
              ></Image>
            </ModalBody>
            {userAddress === customProfileQuery?.defaultProfile?.ownedBy && (
              <ModalFooter
                flex="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  bgColor="#501030"
                  variant="solid"
                  color="white"
                  size="xs"
                  isLoading={buttonLoad}
                  onClick={() => {
                    profilePicOnClose();
                    changeProfilePicOnOppen();
                  }}
                >
                  Change Profile Pic
                </Button>
              </ModalFooter>
            )}
          </ModalContent>
        </Modal>
        <Modal
          blockScrollOnMount={false}
          isOpen={changeProfilePicIsOppen}
          onClose={changeProfilePicOnClose}
          scrollBehavior="inside"
        >
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent
            maxWidth="35%"
            marginTop="7%"
            background={""}
            // background={"WindowFrame"}
          >
            <ModalHeader style={{ color: "white" }}>
              Select Your New Profile Pic
            </ModalHeader>
            <ModalBody maxW="100%" maxH="100%">
              <ChangeProfilePic></ChangeProfilePic>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Box
          marginTop="5px"
          boxShadow="dark-lg"
          width="100%"
          display="flex"
          // border="1px dashed"
          flexDirection="column"
          height="100%"
        >
          <Box
            display="flex"
            flexDirection="column"
            maxHeight="350px"
            width="100%"
            //   border="1px solid"
          >
            <Box marginTop="0" width="100%" height="300px" display="flex">
              <Image
                src={cover || "/Default-Cover.png"}
                width="100%"
                borderRadius="7px"
              ></Image>
            </Box>
            <Box
              position="absolute"
              marginTop="250px"
              width="60%"
              height="160px"
              display="flex"
              flexDirection="row"
              gap="1%"
              // border="1px solid red"
              alignItems="center"
              justifyContent={"flex-start"}
              paddingTop="2%"
            >
              <Skeleton isLoaded={pic !== undefined}>
                <Avatar
                  src={pic}
                  size="2xl"
                  marginLeft="60%"
                  //   marginTop="2%"
                  boxShadow="dark-lg"
                  border="solid white"
                  onClick={profilePicOnOppen}
                  cursor="pointer"
                ></Avatar>
              </Skeleton>
              <Box
                paddingTop="3%"
                height="100%"
                width="70%"
                display="flex"
                flexDir="row"
                paddingLeft="10%"
              >
                <Box
                  display="flex"
                  flexDir="row"
                  gap="1%"
                  alignItems="center"
                  width="50%"
                  // border="1px solid"
                  paddingTop="2%"
                  height="100%"
                >
                  <Box
                    display="flex"
                    flexDir="column"
                    flexWrap={"nowrap"}
                    width="100%"
                    alignItems="center"
                    paddingTop="6%"
                  >
                    <Heading size="md" marginBottom="5%">
                      {userName || "Anon user"} {"  "}
                      <Text
                        as="i"
                        color="gray.500"
                        marginBottom="5%"
                        fontSize="sm
                    "
                      >
                        {profileData.profile.handle}
                      </Text>
                    </Heading>
                    {userAddress &&
                      accessToken &&
                      (profileData.profile.id !==
                      customProfileQuery?.defaultProfile?.id ? (
                        <Button
                          bgColor="#501030"
                          variant="solid"
                          color="white"
                          size="xs"
                          isLoading={followPressed}
                          onClick={async () => {
                            setFollowPressed(true);
                            if (hasFollowed) {
                              await unfollow(profileData?.profile?.id);
                              // setHasFollowed(false);
                            } else {
                              await follow(profileData?.profile?.id);
                              // setHasFollowed(true);
                            }
                            setFollowPressed(false);
                          }}
                        >
                          {hasFollowed ? "Unfollow" : "follow"}
                        </Button>
                      ) : (
                        <Button
                          bgColor="#501030"
                          variant="solid"
                          color="white"
                          size="xs"
                          onClick={metadataOnOppen}
                        >
                          Set Profile Metadata
                        </Button>
                      ))}
                  </Box>
                  <Divider
                    orientation="vertical"
                    border="1px solid"
                    // paddingTop="1%"
                  ></Divider>
                </Box>
                {userBio ? (
                  <Box
                    // border="1px solid"
                    width="50%"
                    display="flex"
                    flexDir="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="3%"
                    paddingTop="2%"
                  >
                    <Heading size="md">Bio</Heading>
                    <Text fontSize="sm">{userBio} </Text>
                  </Box>
                ) : (
                  <Box
                    // border="1px solid"
                    width="50%"
                    display="flex"
                    flexDir="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="3%"
                  >
                    <Heading size="md">No Bio</Heading>
                    {/* <Text fontSize="sm">{userBio || "No Bio!"} </Text> */}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box marginTop="18%" display="flex" flexDir="row" width="100%">
          <Box
            width="30%"
            display="flex"
            flexDir="column"
            // border="1px solid"
            paddingRight="2%"
            alignItems="center"
            gap="10px"
          >
            {profileData.profile.id == customProfileQuery?.defaultProfile?.id &&
              (profileData.profile.dispatcher?.canUseRelay ? (
                <Button
                  bgColor="#501030"
                  variant="solid"
                  color="white"
                  size="xs"
                  isLoading={buttonLoad}
                  onClick={async () => {
                    setButtonLoad(true);
                    await disableDispatcher(profileData?.profile?.id);
                    setButtonLoad(false);
                  }}
                >
                  Disable Dispatcher
                </Button>
              ) : (
                <Button
                  bgColor="#501030"
                  variant="solid"
                  color="white"
                  size="xs"
                  isLoading={buttonLoad}
                  onClick={async () => {
                    setButtonLoad(true);
                    await setDispatcher(profileData?.profile?.id);
                    setButtonLoad(false);
                  }}
                >
                  Set Dispatcher
                </Button>
              ))}
            {followersData?.followers.items &&
              followingData?.following.items && (
                <Box
                  width="100%"
                  display="flex"
                  flexDir="column"
                  gap="15px"
                  alignItems="left"
                  boxShadow="dark-lg"
                  borderRadius="7px"
                  padding="3%"
                >
                  <Heading size="sm">Connections</Heading>
                  <Box
                    width="100%"
                    display="flex"
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    {/* <Link
                      href={{
                        pathname: `/profile/[id]-followers`,
                        query: `${profileData.profile.id}`,
                      }}
                    > */}
                    {/** @ts-ignore */}
                    <Button
                      variant="ghost"
                      color="#501030"
                      size="sm"
                      onClick={followersOnOppen}
                    >
                      Followers
                    </Button>
                    {/* </Link> */}

                    <AvatarGroup max={3} size="sm" gap="6px" flexWrap="wrap">
                      {followersData.followers.items.map((follower) => {
                        let picURL: string =
                          // @ts-ignore
                          follower.wallet.defaultProfile?.picture?.original
                            .url ||
                          // @ts-ignore
                          follower.wallet.defaultProfile?.picture?.uri;
                        if (picURL) {
                          picURL = picURL.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          );
                        }
                        return (
                          <Avatar
                            size="sm"
                            name={follower.wallet.defaultProfile?.handle}
                            src={picURL}
                          ></Avatar>
                        );
                      })}
                    </AvatarGroup>
                  </Box>
                  <Box
                    width="100%"
                    display="flex"
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    {/* <Link
                      href={{
                        pathname: `/profile/[id]-followers`,
                        query: `${profileData.profile.id}`,
                      }}
                    > */}
                    <Button
                      variant="ghost"
                      color="#501030"
                      size="sm"
                      onClick={followingOnOppen}
                    >
                      Following
                    </Button>
                    {/* </Link> */}
                    <AvatarGroup max={3} size="sm" gap="6px" flexWrap="wrap">
                      {followingData.following.items.map((following) => {
                        let picURL: string =
                          // @ts-ignore
                          following.profile.picture?.original.url ||
                          // @ts-ignore
                          following.profile.picture?.uri;
                        if (picURL) {
                          picURL = picURL.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          );
                        }
                        return (
                          <Avatar
                            size="sm"
                            name={following.profile.handle}
                            // @ts-ignore
                            src={picURL}
                          ></Avatar>
                        );
                      })}
                    </AvatarGroup>
                  </Box>
                </Box>
              )}
          </Box>
          <Box
            width="70%"
            display="flex"
            flexDir="column"
            // border="1px solid"
            alignItems="center"
          >
            {address &&
              accessToken &&
              customProfileQuery?.defaultProfile?.id ==
                profileData.profile.id &&
              customProfileQuery?.defaultProfile?.dispatcher?.canUseRelay && (
                <CreatePost></CreatePost>
              )}
            {loadingPublications ? (
              <Spinner color="#501030" speed="1.5s"></Spinner>
            ) : publicationsError ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Couldn't fetch publications</AlertTitle>
                <AlertDescription>Try to refresh the page</AlertDescription>
              </Alert>
            ) : publicationsData?.publications.items ? (
              publicationsData?.publications.items.length > 0 ? (
                publicationsData.publications.items.map((publication) => {
                  return (
                    <Box marginBottom="2%" width="100%">
                      <FeedPost
                        publication={publication}
                        requiredDetails={false}
                        mainPub={true}
                        key={publication.id}
                      ></FeedPost>
                    </Box>
                  );
                })
              ) : (
                <Text as="b">No posts yet</Text>
              )
            ) : (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Couldn't fetch publications</AlertTitle>
                <AlertDescription>Try to refresh the page</AlertDescription>
              </Alert>
            )}
          </Box>
          {/* <Divider border="1px solid"></Divider> */}
        </Box>
      </Box>
    );
  }
}
