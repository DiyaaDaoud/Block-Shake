import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import { Html } from "next/document";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { fetcher } from "../graphql/auth-fetcher";
import {
  ExplorePublicationsQuery,
  ReactionTypes,
  useWhoReactedPublicationQuery,
  WhoReactedPublicationQuery,
  WhoReactedResult,
  WhoReactedPublicationQueryVariables,
  WhoReactedPublicationDocument,
  DefaultProfileQuery,
  usePublicationsQuery,
  PublicationsQuery,
  PublicationsQueryVariables,
  PublicationsDocument,
  useWhoCollectedPublicationQuery,
  WhoCollectedPublicationQuery,
  WhoCollectedPublicationQueryVariables,
  WhoCollectedPublicationDocument,
  ExplorePublicationsQueryVariables,
  ExplorePublicationsDocument,
  PublicationSortCriteria,
  PublicationTypes,
  useExplorePublicationsQuery,
} from "../graphql/generated";
import useLensUser from "../lib/auth/useLensUser";
import useAddReaction from "../lib/useAddReaction";
import useRemoveReaction from "../lib/useRemoveReaction";
import styles from "../styles/FeedPost.module.css";
import ProfilePreview from "./ProfilePreview";
type Props = {
  publication: ExplorePublicationsQuery["explorePublications"]["items"][0];
};

export default function FeedPost({ publication }: Props) {
  // @ts-ignore
  // console.log("publication", publication);
  const { isSignedInQuery, profileQuery } = useLensUser();
  const { mutateAsync: addReaction } = useAddReaction();
  const { mutateAsync: removeReaction } = useRemoveReaction();
  let {
    data: whoReactedData,
    isLoading: whoReactedLoading,
    isError: whoReactedError,
  } = useWhoReactedPublicationQuery({
    request: {
      publicationId: publication.id,
    },
  });
  let {
    isError: commentsError,
    isLoading: commentsLoading,
    data: comments,
  } = usePublicationsQuery(
    {
      request: {
        commentsOf: publication.id,
      },
    },
    {
      enabled: !!publication.id,
    }
  );
  let {
    data: whoCollectedData,
    isLoading: loadingWhoCollected,
    isError: whoCollectedError,
  } = useWhoCollectedPublicationQuery({
    request: {
      publicationId: publication.id,
    },
  });
  let {
    data: mirrorsPublicationsData,
    isLoading: mirrorsLoading,
    isError: mirrorsError,
  } = useExplorePublicationsQuery(
    {
      request: {
        publicationTypes: [PublicationTypes.Mirror],
        sortCriteria: PublicationSortCriteria.Latest,
      },
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  let publicationMirrors: ExplorePublicationsQuery["explorePublications"]["items"];
  if (mirrorsPublicationsData?.explorePublications.items) {
    publicationMirrors =
      mirrorsPublicationsData?.explorePublications.items.filter((mirror) => {
        // @ts-ignore
        return mirror.mirrorOf?.id == publication.id;
      });
  }

  const [whoReactedDataState, setWhoReactedDataState] =
    useState<WhoReactedPublicationQuery>();
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [collectsCount, setCollectsCount] = useState<number>(0);
  const [mirrorsCount, setMirrorsCount] = useState<number>(0);

  const [hasReacted, setHasReacted] = useState<boolean>(false);
  const [userReaction, setUserReaction] = useState<ReactionTypes>();
  const [likeSource, setLikeSource] = useState<string>("/empty-like.png");
  const [dislikeSource, setDislikeSource] =
    useState<string>("/empty-dislike.png");
  const [upVotesCount, setUpVotesCount] = useState<number>(0);
  const [downVotesCount, setDownVotesCount] = useState<number>(0);
  const [timePosted, setTimePosted] = useState<string>();
  const [datePosted, setDatePosted] = useState<string>();

  async function updateReactions() {
    const reactionQuery = fetcher<
      WhoReactedPublicationQuery,
      WhoReactedPublicationQueryVariables
    >(WhoReactedPublicationDocument, {
      request: { publicationId: publication.id },
    });
    whoReactedData = await reactionQuery();
    if (whoReactedData?.whoReactedPublication.items) {
      setWhoReactedDataState(whoReactedData);
      // console.log("isndide updatUI : who reacted: ", whoReactedData);

      const upVotesCountState =
        whoReactedData.whoReactedPublication.items.filter((reaction) => {
          return reaction.reaction == ReactionTypes.Upvote;
        }).length;

      const downVotesCountState =
        whoReactedData.whoReactedPublication.items.filter((reaction) => {
          return reaction.reaction == ReactionTypes.Downvote;
        }).length;
      setUpVotesCount(upVotesCountState);
      setDownVotesCount(downVotesCountState);

      const hasReactedState =
        whoReactedData.whoReactedPublication.items.filter(
          (reaction) =>
            reaction.profile.id == profileQuery.data?.defaultProfile?.id
        ).length > 0;
      setHasReacted(hasReactedState);
      if (hasReactedState) {
        const userReactionState =
          whoReactedData.whoReactedPublication.items.filter(
            (reaction) =>
              reaction.profile.id == profileQuery.data?.defaultProfile?.id
          )[0].reaction;
        setUserReaction(userReactionState);
        const likeSourceState =
          userReactionState === ReactionTypes.Upvote
            ? "/filled-like.png"
            : "/empty-like.png";
        const dislikeSourceState =
          userReactionState === ReactionTypes.Downvote
            ? "/filled-dislike.png"
            : "/empty-dislike.png";

        setDislikeSource(dislikeSourceState);
        setLikeSource(likeSourceState);
      } else {
        setDislikeSource("/empty-dislike.png");
        setLikeSource("/empty-like.png");
      }
    }
  }
  async function updateComments() {
    const commentsQuery = fetcher<
      PublicationsQuery,
      PublicationsQueryVariables
    >(PublicationsDocument, {
      request: { commentsOf: publication.id },
    });
    comments = await commentsQuery();
    if (comments.publications.items) {
      const commentsCountState =
        comments.publications.pageInfo.totalCount ||
        comments.publications.items.length;
      setCommentsCount(commentsCountState);
    }
  }
  async function updateCollects() {
    const collectsQuery = fetcher<
      WhoCollectedPublicationQuery,
      WhoCollectedPublicationQueryVariables
    >(WhoCollectedPublicationDocument, {
      request: { publicationId: publication.id },
    });
    whoCollectedData = await collectsQuery();
    if (whoCollectedData.whoCollectedPublication.items) {
      const collectsCountState =
        whoCollectedData.whoCollectedPublication.pageInfo.totalCount ||
        whoCollectedData.whoCollectedPublication.items.length;
      setCollectsCount(collectsCountState);
    }
  }
  async function updateMirrors() {
    const mirrorsQuery = fetcher<
      ExplorePublicationsQuery,
      ExplorePublicationsQueryVariables
    >(ExplorePublicationsDocument, {
      request: {
        publicationTypes: [PublicationTypes.Mirror],
        sortCriteria: PublicationSortCriteria.Latest,
      },
    });
    mirrorsPublicationsData = await mirrorsQuery();
    let customPublicationMirrors;
    if (mirrorsPublicationsData.explorePublications.items) {
      customPublicationMirrors =
        mirrorsPublicationsData?.explorePublications.items.filter((mirror) => {
          // @ts-ignore
          return mirror.mirrorOf?.id == publication.id;
        });
    }
    if (customPublicationMirrors) {
      if (publicationMirrors) {
        if (customPublicationMirrors.length > publicationMirrors.length)
          setMirrorsCount(customPublicationMirrors.length);
        else {
          setMirrorsCount(publicationMirrors.length);
        }
      } else {
        publicationMirrors = customPublicationMirrors;
        setMirrorsCount(customPublicationMirrors.length);
      }
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
  useEffect(() => {
    updateReactions();
  }, [
    whoReactedDataState,
    hasReacted,
    userReaction,
    likeSource,
    dislikeSource,
    upVotesCount,
    downVotesCount,
  ]);
  useEffect(() => {
    updateComments();
  }, [comments, commentsCount]);
  useEffect(() => {
    updateCollects();
  }, [whoCollectedData, collectsCount]);
  useEffect(() => {
    updateMirrors();
  }, [mirrorsPublicationsData, mirrorsCount]);
  useEffect(() => {
    updateCreationTime();
  }, [datePosted, timePosted]);

  return (
    <div className={styles.feedPostContainer}>
      <div className={styles.feedPostHeader}>
        {/** the author profile picture */}
        {/*@ts-ignore*/}
        {publication?.profile?.picture ? (
          <MediaRenderer
            // @ts-ignore
            src={
              // @ts-ignore
              publication.profile.picture.original
                ? // @ts-ignore
                  publication.profile.picture.original.url
                : // @ts-ignore
                  publication.profile.picture.uri
            }
            alt={"profile pic"}
            className={styles.feedPostProfilePicture}
          ></MediaRenderer>
        ) : (
          <MediaRenderer
            // @ts-ignore
            src={
              "https://ipfs.io/ipfs/QmeK4BXjQUTNka1pRTmWjURDEGVXC7E8uEB8xUsD2DGz2c?filename=blank-profile-picture-ga739fc683_1280.png"
            }
            alt={"profile picture"}
            className={styles.feedPostProfilePicture}
          ></MediaRenderer>
        )}

        {/** the author name */}
        <div className={styles.nameAndDate}>
          <Link
            className={styles.feedPostProfileName}
            href={`/profile/${publication.profile.handle}`}
          >
            {publication.profile.name || publication.profile.handle}
          </Link>
          <div>
            <p className={styles.time}>
              {datePosted} at {timePosted}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.feedPostContent}>
        {/** the post name */}
        <div className={styles.feedPostContentTitle}>
          <h3>{publication.metadata.name}</h3>
        </div>

        {/** the post description */}
        <div className={styles.feedPostContentDescription}>
          <p>{publication.metadata.description}</p>
        </div>
        <div className={styles.feedPostContentContent}>
          <p>{publication.metadata.content}</p>
        </div>
        {/** the post media */}
      </div>
      <div>
        {(publication.metadata.image ||
          publication.metadata.media.length > 0) && (
          <MediaRenderer
            src={
              publication.metadata.image ||
              publication.metadata.media[0].original.url
            }
            alt={
              publication.metadata.name !== null
                ? publication.metadata.name
                : "post image"
            }
            className={styles.feedPostContentImage}
            requireInteraction={true}
          ></MediaRenderer>
        )}
      </div>
      {(loadingWhoCollected ||
        commentsLoading ||
        whoReactedLoading ||
        mirrorsLoading) && (
        <div className={styles.feedPostFooter}> Loading stats ..</div>
      )}
      {(commentsError ||
        whoCollectedError ||
        whoReactedError ||
        mirrorsError) && (
        <div className={styles.feedPostFooter}> ERROR Loading stats ..</div>
      )}
      {whoCollectedData &&
        comments &&
        whoReactedData &&
        mirrorsPublicationsData && (
          <div className={styles.feedPostFooter}>
            <div className={styles.reactionDiv}>
              <p style={{ cursor: "pointer" }}>{upVotesCount}</p>
              <img
                src={likeSource}
                className={styles.reaction}
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  if (profileQuery.data) {
                    //setClicked(!clicked);
                    if (hasReacted) {
                      if (userReaction == ReactionTypes.Upvote) {
                        await removeReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Upvote,
                        });
                        setUpVotesCount(upVotesCount - 1);
                      } else {
                        await removeReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Downvote,
                        });
                        await addReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Upvote,
                        });
                        setUpVotesCount(upVotesCount + 1);
                        setDownVotesCount(downVotesCount - 1);
                      }
                    } else {
                      await addReaction({
                        profileId: profileQuery.data?.defaultProfile?.id,
                        publicationId: publication.id,
                        reaction: ReactionTypes.Upvote,
                      });
                      setUpVotesCount(upVotesCount + 1);
                    }
                  }
                }}
              ></img>
            </div>
            <div className={styles.reactionDiv}>
              <p
                style={{ cursor: "pointer", maxWidth: "15%" }}
                onClick={() => {
                  if (!whoReactedData?.whoReactedPublication) {
                    // console.log("didn't get reactions");
                    return;
                  }
                }}
              >
                {downVotesCount}
              </p>
              <img
                src={dislikeSource}
                className={styles.reaction}
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  if (profileQuery.data) {
                    if (hasReacted) {
                      if (userReaction == ReactionTypes.Upvote) {
                        await removeReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Upvote,
                        });
                        await addReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Downvote,
                        });
                        setUpVotesCount(upVotesCount - 1);
                        setDownVotesCount(downVotesCount + 1);
                      } else {
                        await removeReaction({
                          profileId: profileQuery.data?.defaultProfile?.id,
                          publicationId: publication.id,
                          reaction: ReactionTypes.Downvote,
                        });
                        setDownVotesCount(downVotesCount - 1);
                      }
                    } else {
                      await addReaction({
                        profileId: profileQuery.data?.defaultProfile?.id,
                        publicationId: publication.id,
                        reaction: ReactionTypes.Downvote,
                      });
                      setDownVotesCount(downVotesCount + 1);
                    }
                  }
                }}
              ></img>
            </div>
            <Link
              style={{ position: "relative" }}
              href={{
                pathname: `/profile/publication/[publicationId]-collect`,
                query: { publicationId: `${publication.id}` },
              }}
            >
              {collectsCount} 👜
            </Link>

            <Link
              style={{ position: "relative" }}
              href={{
                pathname: `/profile/publication/[publicationId]-mirror`,
                query: { publicationId: `${publication.id}` },
              }}
            >
              {mirrorsCount} 🪞
            </Link>
            <Link
              style={{ position: "relative" }}
              href={{
                pathname: `/profile/publication/[publicationId]-comment`,
                query: { publicationId: `${publication.id}` },
              }}
            >
              {commentsCount} 💭
            </Link>
          </div>
        )}
    </div>
  );
}
