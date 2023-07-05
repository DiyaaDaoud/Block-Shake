import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Text,
  Image,
  CardFooter,
  Button,
  Skeleton,
  Divider,
  AspectRatio,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiLinkExternal } from "react-icons/bi";
import { BiChat, BiLike, BiShare, BiAngry, BiCollection } from "react-icons/bi";
import {
  ExplorePublicationsQuery,
  ReactionTypes,
  WhoReactedPublicationDocument,
  WhoReactedPublicationQuery,
  WhoReactedPublicationQueryVariables,
} from "../graphql/generated";
import { useEffect, useState } from "react";
import { fetcher } from "../graphql/auth-fetcher";
import { MediaRenderer, useAddress } from "@thirdweb-dev/react";
import { readProfileQuery } from "../lib/helpers";
import CreateComment from "./CreateComment";
import useCreateMirror from "../lib/useCreateMirror";
import useAddReaction from "../lib/useAddReaction";
import useRemoveReaction from "../lib/useRemoveReaction";
import useCreateCollect from "../lib/useCreateCollect";
import Link from "next/link";
import { WhoCollectedPublicationQuery } from "../graphql/generated";
import { WhoCollectedPublicationDocument } from "../graphql/generated";
import ProfilePreview from "./ProfilePreview";
type Props = {
  publication: ExplorePublicationsQuery["explorePublications"]["items"][0];
  requiredDetails: boolean;
  mainPub: boolean;
};
export default function FeedPost({
  publication,
  requiredDetails,
  mainPub,
}: Props) {
  const [userName, setUserName] = useState<string | null>(null);
  const [pic, setPic] = useState<string>();
  const [timePosted, setTimePosted] = useState<string>();
  const [datePosted, setDatePosted] = useState<string>();
  const [postMedia, setPostMedia] = useState<string>();
  const [upVotesCount, setUpVotesCount] = useState<number>(0);
  const [upVotes, setUpVotes] =
    useState<WhoReactedPublicationQuery["whoReactedPublication"]["items"]>();
  const [downVotesCount, setDownVotesCount] = useState<number>(0);
  const [downVotes, setDownVotes] =
    useState<WhoReactedPublicationQuery["whoReactedPublication"]["items"]>();
  const [hasReacted, setHasReacted] = useState<boolean>(false);
  const [userReaction, setUserReaction] = useState<ReactionTypes>();
  const [whoCollected, setWhoCollected] =
    useState<
      WhoCollectedPublicationQuery["whoCollectedPublication"]["items"]
    >();
  const [commentPressed, setCommentPressed] = useState<boolean>(false);
  const [mirrorPressed, setMirrorPressed] = useState<boolean>(false);
  const [collectPressed, setCollectPressed] = useState<boolean>(false);
  const [likeReactionPressed, setLikeReactionPressed] =
    useState<boolean>(false);
  const [dislikeReactionPressed, setDislikeReactionPressed] =
    useState<boolean>(false);

  const {
    isOpen: commentIsOppen,
    onOpen: commentOnOppen,
    onClose: commentOnClose,
  } = useDisclosure();
  const {
    isOpen: mirrorIsOppen,
    onOpen: mirrorOnOppen,
    onClose: mirrorOnClose,
  } = useDisclosure();
  const {
    isOpen: collectIsOppen,
    onOpen: collectOnOppen,
    onClose: collectOnClose,
  } = useDisclosure();
  const {
    isOpen: whoLikedIsOppen,
    onOpen: whoLikedOnOppen,
    onClose: whoLikedOnClose,
  } = useDisclosure();
  const {
    isOpen: whoDislikedIsOppen,
    onOpen: whoDislikedOnOppen,
    onClose: whoDislikedOnClose,
  } = useDisclosure();
  const {
    onOpen: whoCollectedOnOppen,
    isOpen: whoCollectedIsOppen,
    onClose: whoCollectedOnClose,
  } = useDisclosure();
  const address = useAddress();
  const customProfileQuery = readProfileQuery(address);
  const { mutateAsync: mirror } = useCreateMirror();
  const { mutateAsync: collect } = useCreateCollect();
  const { mutateAsync: addReaction } = useAddReaction();
  const { mutateAsync: removeReaction } = useRemoveReaction();
  async function updateWhoCollected() {
    const whoCollectedQuery = fetcher<
      WhoCollectedPublicationQuery,
      WhoReactedPublicationQueryVariables
    >(WhoCollectedPublicationDocument, {
      request: {
        publicationId: publication.id,
      },
    });
    const whoCollectedData = await whoCollectedQuery();
    if (whoCollectedData.whoCollectedPublication.items) {
      setWhoCollected(whoCollectedData.whoCollectedPublication.items);
    }
  }
  async function updateReactions() {
    const reactionQuery = fetcher<
      WhoReactedPublicationQuery,
      WhoReactedPublicationQueryVariables
    >(WhoReactedPublicationDocument, {
      request: { publicationId: publication.id },
    });
    const whoReactedData = await reactionQuery();
    if (whoReactedData?.whoReactedPublication.items) {
      const upVotesState = whoReactedData.whoReactedPublication.items.filter(
        (reaction) => {
          return reaction.reaction == ReactionTypes.Upvote;
        }
      );
      const upVotesCountState = upVotesState.length;
      const downVotesState = whoReactedData.whoReactedPublication.items.filter(
        (reaction) => {
          return reaction.reaction == ReactionTypes.Downvote;
        }
      );
      const downVotesCountState = downVotesState.length;
      setUpVotes(upVotesState);
      setDownVotes(downVotesState);
      setUpVotesCount(upVotesCountState);
      setDownVotesCount(downVotesCountState);
      if (customProfileQuery?.defaultProfile?.id) {
        const hasReactedState =
          whoReactedData.whoReactedPublication.items.filter(
            (reaction) =>
              reaction.profile.id == customProfileQuery.defaultProfile?.id
          ).length > 0;
        setHasReacted(hasReactedState);
        if (hasReactedState) {
          const userReactionState =
            whoReactedData.whoReactedPublication.items.filter(
              (reaction) =>
                reaction.profile.id == customProfileQuery.defaultProfile?.id
            )[0].reaction;
          setUserReaction(userReactionState);
        }
      } else {
        setHasReacted(false);
      }
    }
  }
  async function fetchName() {
    if (publication.profile.name && userName != publication.profile.name) {
      setUserName(publication.profile.name);
      return;
    }
    if (publication.profile.metadata && userName != undefined) {
      let metadataPath = publication.profile.metadata;
      if (metadataPath.slice(0, 4) == "ipfs") {
        metadataPath = metadataPath.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const jsonObj = await (await fetch(metadataPath)).json();
      if (!jsonObj) return;
      const name = jsonObj.name;
      if (name) {
        setUserName(name);
      } else {
        setUserName(publication.profile.handle);
      }
    } else {
      setUserName(publication.profile.handle);
    }
  }
  let picURL: string | null = null;
  async function updatePic() {
    if (!publication.profile.picture) return;
    picURL =
      // @ts-ignore
      publication.profile.picture?.original?.url ||
      // @ts-ignore
      publication.profile.picture?.uri;
    if (picURL) {
      picURL = picURL?.replace("ipfs://", "https://ipfs.io/ipfs/");
      setPic(picURL);
      return;
    }
  }
  async function updateCreationTime() {
    if (timePosted == undefined || datePosted == undefined) {
      const timePostedString = publication.createdAt;
      if (timePostedString) {
        const date = timePostedString.slice(0, 10);
        const time = timePostedString.slice(11, 19);
        // console.log("date: ", date, " time: ", time);
        setTimePosted(time);
        setDatePosted(date);
      }
    }
  }
  async function updatePostMedia() {
    if (
      postMedia == undefined &&
      (publication.metadata.image || publication.metadata.media[0].original.url)
    ) {
      let postMediaURL: string =
        publication.metadata.image ||
        publication.metadata.media[0].original.url;
      postMediaURL = postMediaURL.replace("ipfs://", "https://ipfs.io/ipfs/");
      setPostMedia(postMediaURL);
    }
  }
  useEffect(() => {
    updatePic();
  }, [publication, pic, userName, picURL, address]);
  useEffect(() => {
    fetchName();
  }, [publication, userName]);
  useEffect(() => {
    updateCreationTime();
  }, [publication, timePosted, datePosted]);
  useEffect(() => {
    updatePostMedia();
  }, [publication, postMedia]);
  useEffect(() => {
    updateReactions();
  }, [
    address,
    publication,
    upVotesCount,
    downVotesCount,
    hasReacted,
    userReaction,
  ]);
  useEffect(() => {
    updateWhoCollected();
  }, [whoCollected]);

  return (
    <Box
      display="flex"
      alignItems="end"
      justifyContent="end"
      flexDirection="column"
      width="full"
    >
      <Modal
        blockScrollOnMount={false}
        isOpen={commentIsOppen}
        onClose={commentOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>Comment on {userName}'s Publication</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%">
            <CreateComment publicationId={publication.id}></CreateComment>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={mirrorIsOppen}
        onClose={mirrorOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>Mirror {userName}'s Publication</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%" display="flex" justifyContent="center">
            <Button
              bgColor="#501030"
              variant="solid"
              color="white"
              size="md"
              isLoading={mirrorPressed}
              onClick={async () => {
                setMirrorPressed(true);
                await mirror({
                  profileId: customProfileQuery?.defaultProfile?.id,
                  publicationId: publication.id,
                });
                setMirrorPressed(false);
                mirrorOnClose();
              }}
            >
              Mirror
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={collectIsOppen}
        onClose={collectOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>Collect {userName}'s Publication NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%" display="flex" justifyContent="center">
            <Button
              bgColor="#501030"
              variant="solid"
              color="white"
              size="md"
              isLoading={collectPressed}
              onClick={async () => {
                setCollectPressed(true);
                await collect({ publicationId: publication.id });
                setCollectPressed(false);
                collectOnClose();
              }}
            >
              Collect
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={whoLikedIsOppen}
        onClose={whoLikedOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>People who liked this publication</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%">
            {upVotes?.map((upvote, index) => (
              <>
                <ProfilePreview profile={upvote.profile} />
                {index != upVotes.length - 1 && (
                  <Divider color="gray" borderColor="gray" width={"100%"} />
                )}
              </>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={whoDislikedIsOppen}
        onClose={whoDislikedOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>People who disliked this publication</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%">
            {downVotes?.map((downvote, index) => (
              <>
                <ProfilePreview profile={downvote.profile} />
                {index != downVotes.length - 1 && (
                  <Divider color="gray" borderColor="gray" width={"100%"} />
                )}
              </>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        blockScrollOnMount={false}
        isOpen={whoCollectedIsOppen}
        onClose={whoCollectedOnClose}
      >
        <ModalOverlay />
        <ModalContent maxWidth="45%" marginTop="10%">
          <ModalHeader>People who collected this publication</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxW="100%">
            {whoCollected?.map((collector, index) => (
              <>
                <ProfilePreview profile={collector.defaultProfile} />
                {index != whoCollected.length - 1 && (
                  <Divider color="gray" borderColor="gray" width={"100%"} />
                )}
              </>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/** @ts-ignore */}
      <Flex flexDirection="row" width="100%" justifyContent="space-between">
        {publication.__typename === "Comment" && !requiredDetails && (
          <Box
            borderRadius="50%"
            height="15px"
            width="15px"
            bgColor="#571e60"
            position="relative"
            marginLeft="2%"
            marginTop="1%"
          ></Box>
        )}
        <Card
          width={`${mainPub ? "100%" : "90%"}`}
          boxShadow="dark-lg"
          className="w-full"
        >
          <CardHeader>
            {/** @ts-ignore */}
            <Flex spacing="8">
              <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                <Skeleton isLoaded={pic !== undefined}>
                  <Avatar
                    name={
                      publication.profile.name || publication.profile.handle
                    }
                    src={pic}
                  />
                </Skeleton>

                <Box paddingTop="3">
                  <Heading size="sm">{userName}</Heading>
                  {datePosted && timePosted ? (
                    <Text fontSize="2xs">
                      {datePosted} at {timePosted}
                    </Text>
                  ) : (
                    <Text> </Text>
                  )}
                </Box>
              </Flex>
              {!requiredDetails && (
                <Link
                  href={`/profile/${publication.profile.handle}/${publication.id}`}
                >
                  <IconButton
                    variant="ghost"
                    colorScheme="gray"
                    aria-label="open publication"
                    icon={<BiLinkExternal />}
                  />
                </Link>
              )}
            </Flex>
          </CardHeader>
          <CardBody paddingLeft="5%" paddingTop="0">
            <Text fontWeight="bold">{publication.metadata.name}</Text>
            <Text fontSize="sm">{publication.metadata.description}</Text>
            <Text fontSize="sm">{publication.metadata.content}</Text>
          </CardBody>

          {postMedia && (
            <Box
              paddingLeft="4%"
              paddingRight="4%"
              height="100%"
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                style={{
                  objectFit: "fill",
                  maxWidth: "100%",
                  borderRadius: "7px",
                  paddingBottom: "2px",
                  maxHeight: "300px",
                }}
                src={postMedia}
              ></Image>
            </Box>
          )}
          {requiredDetails && (
            <>
              <Divider color="gray" width={"94%"} marginLeft={"3%"}></Divider>
              <CardFooter
                flexDirection="row"
                justifyItems="start"
                alignItems="center"
                maxWidth="100%"
                gap="8"
                height="40px"
                paddingLeft={"5%"}
              >
                <Flex
                  flexDirection="row"
                  alignItems="center"
                  gap="2"
                  onClick={whoLikedOnOppen}
                  cursor={"pointer"}
                >
                  <p style={{ fontSize: "small", fontWeight: "bold" }}>
                    {upVotesCount}
                  </p>
                  <p style={{ fontSize: "small" }}>Likes</p>
                </Flex>
                <Flex
                  flexDirection="row"
                  alignItems="center"
                  gap="2"
                  onClick={whoDislikedOnOppen}
                  cursor={"pointer"}
                >
                  <p style={{ fontSize: "small", fontWeight: "bold" }}>
                    {downVotesCount}
                  </p>
                  <p style={{ fontSize: "small" }}>Dislikes</p>
                </Flex>
                <Flex flexDirection="row" alignItems="center" gap="2">
                  <p style={{ fontSize: "small", fontWeight: "bold" }}>
                    {publication.stats.totalAmountOfMirrors}
                  </p>
                  <p style={{ fontSize: "small" }}>Mirrors</p>
                </Flex>
                <Flex
                  flexDirection="row"
                  alignItems="center"
                  gap="2"
                  onClick={whoCollectedOnOppen}
                  cursor={"pointer"}
                >
                  <p style={{ fontSize: "small", fontWeight: "bold" }}>
                    {publication.stats.totalAmountOfCollects}
                  </p>
                  <p style={{ fontSize: "small" }}>Collects</p>
                </Flex>
              </CardFooter>
            </>
          )}
          <Divider color="gray" width={"94%"} marginLeft={"3%"}></Divider>
          <CardFooter
            flexDirection="row"
            justifyItems="center"
            alignItems="center"
            maxWidth="100%"
            height="40px"
            width="95%"
            marginLeft="2.5%"
          >
            <Button
              flex="1"
              variant="ghost"
              size="md"
              color={
                hasReacted && userReaction == ReactionTypes.Upvote
                  ? "green"
                  : "black"
              }
              leftIcon={<BiLike />}
              isLoading={likeReactionPressed}
              onClick={async () => {
                if (!address || !customProfileQuery?.defaultProfile?.id) return;
                setLikeReactionPressed(true);
                if (hasReacted) {
                  if (userReaction == ReactionTypes.Upvote) {
                    await removeReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Upvote,
                    });
                  } else {
                    await removeReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Downvote,
                    });
                    await addReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Upvote,
                    });
                  }
                } else {
                  await addReaction({
                    profileId: customProfileQuery?.defaultProfile?.id,
                    publicationId: publication.id,
                    reaction: ReactionTypes.Upvote,
                  });
                }
                setLikeReactionPressed(false);
              }}
            >
              {!requiredDetails && (
                <p style={{ fontWeight: "normal", fontSize: "14px" }}>
                  {upVotesCount}
                </p>
              )}
            </Button>
            <Button
              flex="1.1"
              variant="ghost"
              size="md"
              color={
                hasReacted && userReaction == ReactionTypes.Downvote
                  ? "red"
                  : "black"
              }
              leftIcon={<BiAngry />}
              isLoading={dislikeReactionPressed}
              onClick={async () => {
                if (!address || !customProfileQuery?.defaultProfile?.id) return;
                setDislikeReactionPressed(true);
                if (hasReacted) {
                  if (userReaction == ReactionTypes.Upvote) {
                    await removeReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Upvote,
                    });
                    await addReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Downvote,
                    });
                  } else {
                    await removeReaction({
                      profileId: customProfileQuery?.defaultProfile?.id,
                      publicationId: publication.id,
                      reaction: ReactionTypes.Downvote,
                    });
                  }
                } else {
                  await addReaction({
                    profileId: customProfileQuery?.defaultProfile?.id,
                    publicationId: publication.id,
                    reaction: ReactionTypes.Downvote,
                  });
                }
                setDislikeReactionPressed(false);
              }}
            >
              {!requiredDetails && (
                <p style={{ fontWeight: "normal", fontSize: "14px" }}>
                  {downVotesCount}
                </p>
              )}
            </Button>
            <Button
              flex="1.4"
              variant="ghost"
              size="md"
              leftIcon={<BiChat />}
              onClick={() => {
                if (!address || !customProfileQuery?.defaultProfile?.id) return;
                commentOnOppen();
              }}
            >
              {!requiredDetails && (
                <p style={{ fontWeight: "normal", fontSize: "14px" }}>
                  {publication.stats.totalAmountOfComments}
                </p>
              )}
            </Button>
            <Button
              flex="1"
              variant="ghost"
              size="md"
              leftIcon={<BiShare />}
              onClick={() => {
                if (!address || !customProfileQuery?.defaultProfile?.id) return;
                mirrorOnOppen();
              }}
            >
              {!requiredDetails && (
                <p style={{ fontWeight: "normal", fontSize: "14px" }}>
                  {publication.stats.totalAmountOfMirrors}
                </p>
              )}
            </Button>
            <Button
              flex="1"
              variant="ghost"
              size="md"
              leftIcon={<BiCollection />}
              onClick={() => {
                if (!address || !customProfileQuery?.defaultProfile?.id) return;
                collectOnOppen();
              }}
            >
              {!requiredDetails && (
                <p style={{ fontWeight: "normal", fontSize: "14px" }}>
                  {publication.stats.totalAmountOfCollects}
                </p>
              )}
            </Button>
          </CardFooter>

          {/* {address && customProfileQuery?.defaultProfile?.id && commentPressed && (
          <CardFooter width="100%" display="flex" padding="0">
            <CreateComment publicationId={publication.id}></CreateComment>
          </CardFooter>
        )} */}
        </Card>
      </Flex>
    </Box>
  );
}
