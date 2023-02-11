import FeedPost from "@/src/components/FeedPost";
import ProfilePreview from "@/src/components/ProfilePreview";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "@/src/constants/contracts";
import { fetcher } from "@/src/graphql/auth-fetcher";
import {
  PublicationDocument,
  PublicationQuery,
  PublicationQueryVariables,
  usePublicationQuery,
  useWhoCollectedPublicationQuery,
  WhoCollectedPublicationDocument,
  WhoCollectedPublicationQuery,
  WhoCollectedPublicationQueryVariables,
} from "@/src/graphql/generated";
import useCollect from "@/src/lib/useCollect";
import { Web3Button } from "@thirdweb-dev/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/Collect.module.css";
export default function publicationCollectPage() {
  const [recipient, setRecipient] = useState<string>("");
  const [publicationDataState, setPublicationDataState] =
    useState<PublicationQuery>();
  const [collectorsState, setCollectorsState] =
    useState<WhoCollectedPublicationQuery>();
  const router = useRouter();
  const { publicationId } = router.query;
  const { mutateAsync: collect } = useCollect();
  let {
    isError: publicationError,
    isLoading: loadingPublication,
    data: publicationData,
  } = usePublicationQuery(
    {
      request: {
        publicationId: publicationId,
      },
    },
    {
      enabled: !!publicationId,
    }
  );
  let {
    data: whoCollectedData,
    isLoading: loadingWhoCollected,
    isError: whoCollectedError,
  } = useWhoCollectedPublicationQuery({
    request: {
      publicationId: publicationId,
    },
  });

  async function updateUI() {
    if (!publicationId) return;
    const publicationQuery = fetcher<
      PublicationQuery,
      PublicationQueryVariables
    >(PublicationDocument, {
      request: { publicationId: publicationId },
    });
    publicationData = await publicationQuery();
    const collectersQuery = fetcher<
      WhoCollectedPublicationQuery,
      WhoCollectedPublicationQueryVariables
    >(WhoCollectedPublicationDocument, {
      request: { publicationId: publicationId },
    });
    whoCollectedData = await collectersQuery();

    if (publicationData.publication) {
      setPublicationDataState(publicationData);
    }
    if (whoCollectedData.whoCollectedPublication) {
      setCollectorsState(whoCollectedData);
    }
  }

  useEffect(() => {
    updateUI();
  });
  if (publicationError) return <div>Error loading the pubilcation</div>;
  if (loadingPublication) return <div>Loading publication</div>;
  if (whoCollectedError)
    return <div>Error loading who collected this publication</div>;
  if (loadingWhoCollected)
    return <div>Loadin the users who collected this publication</div>;

  if (
    publicationDataState?.publication &&
    collectorsState?.whoCollectedPublication.items
  ) {
    if (
      publicationDataState.publication.collectModule.type ==
      "RevertCollectModule"
    ) {
      return (
        <div className={styles.container}>
          <div className={styles.postAndAddCollectContainer}>
            <div className={styles.publicationContainer}>
              <FeedPost
                publication={publicationDataState.publication}
              ></FeedPost>
            </div>
            <h2 className={styles.hint}>
              This publications can not be collected!
            </h2>
          </div>
        </div>
      );
    } else {
      if (
        publicationDataState.publication.collectModule.type ==
        "FreeCollectModule"
      ) {
        // @ts-ignore
        if (publicationDataState.publication.collectModule.followerOnly) {
          if (publicationDataState.publication.profile.isFollowedByMe) {
            return (
              <div className={styles.container}>
                <div className={styles.postAndAddCollectContainer}>
                  <div className={styles.publicationContainer}>
                    <FeedPost
                      publication={publicationDataState.publication}
                    ></FeedPost>
                  </div>
                  <h2 className={styles.hint}>
                    This publication can be collected for free by user's
                    followers only
                  </h2>
                  <h2 className={styles.hint}>You may collect it</h2>
                  <Web3Button
                    className={styles.createButton}
                    contractAddress={LENS_CONTRACT_ADDRESS}
                    contractAbi={LENS_CONTRACT_ABI}
                    action={async () => {
                      if (!publicationDataState.publication) return;
                      return await collect(publicationDataState.publication.id);
                    }}
                  >
                    Collect Now
                  </Web3Button>
                </div>
                {collectorsState.whoCollectedPublication.items.length > 0 ? (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      Publication's collectors are:
                    </h2>
                    <div className={styles.collectsContainer}>
                      {collectorsState.whoCollectedPublication.items.map(
                        (collector) => {
                          return (
                            <div>
                              <ProfilePreview
                                profileId={collector.defaultProfile?.id}
                              ></ProfilePreview>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      No one collected 👜 this publication yet
                    </h2>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className={styles.container}>
                <div className={styles.postAndAddCollectContainer}>
                  <div className={styles.publicationContainer}>
                    <FeedPost
                      publication={publicationDataState.publication}
                    ></FeedPost>
                  </div>
                  <h2 className={styles.hint}>
                    This publication can be collected for free by user's
                    followers only
                  </h2>
                  <h2 className={styles.hint}>you can follow</h2>
                  <Link
                    href={`/profile/${publicationDataState.publication.profile.handle}`}
                  >
                    {publicationDataState.publication.profile.handle}
                  </Link>
                </div>
                {collectorsState.whoCollectedPublication.items.length > 0 ? (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      Publication's collectors are:
                    </h2>
                    <div className={styles.collectsContainer}>
                      {collectorsState.whoCollectedPublication.items.map(
                        (collector) => {
                          return (
                            <div>
                              <ProfilePreview
                                profileId={collector.defaultProfile?.id}
                              ></ProfilePreview>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      No one collected 👜 this publication yet
                    </h2>
                  </div>
                )}
              </div>
            );
          }
        } else {
          return (
            <div className={styles.container}>
              <div className={styles.postAndAddCollectContainer}>
                <div className={styles.publicationContainer}>
                  <FeedPost
                    publication={publicationDataState.publication}
                  ></FeedPost>
                </div>
                <h2 className={styles.hint}>
                  This publication can be collected for free by anyone
                </h2>
                <h2 className={styles.hint}>You may collect it 💟</h2>
                <Web3Button
                  className={styles.createButton}
                  contractAddress={LENS_CONTRACT_ADDRESS}
                  contractAbi={LENS_CONTRACT_ABI}
                  action={async () => {
                    if (!publicationDataState.publication) return;
                    return await collect(publicationDataState.publication.id);
                  }}
                >
                  Collect Now
                </Web3Button>
              </div>
              {collectorsState.whoCollectedPublication.items.length > 0 ? (
                <div className={styles.collectsAndHintContainer}>
                  <h2 className={styles.hint}>Publication's collectors are:</h2>
                  <div className={styles.collectsContainer}>
                    {collectorsState.whoCollectedPublication.items.map(
                      (collector) => {
                        return (
                          <div>
                            <ProfilePreview
                              profileId={collector.defaultProfile?.id}
                            ></ProfilePreview>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.collectsAndHintContainer}>
                  <h2 className={styles.hint}>
                    No one collected 👜 this publication yet
                  </h2>
                </div>
              )}
            </div>
          );
        }
      }
      if (
        publicationDataState.publication.collectModule.type ==
        "FeeCollectModule"
      ) {
        // @ts-ignore
        if (publicationDataState.publication.collectModule.followerOnly) {
          if (publicationDataState.publication.profile.isFollowedByMe) {
            return (
              <div className={styles.container}>
                <div className={styles.postAndAddCollectContainer}>
                  <div className={styles.publicationContainer}>
                    <FeedPost
                      publication={publicationDataState.publication}
                    ></FeedPost>
                  </div>
                  <h2 className={styles.hint}>
                    This publication can be collected by user's followers only,
                    by paying{" "}
                    {
                      // @ts-ignore
                      publicationData.publication.collectModule.amount.value
                    }{" "}
                    as a fee to{" "}
                    <Link
                      href={`https://mumbai.polygonscan.com/address/${
                        // @ts-ignore
                        publicationData.publication.collectModule.recipient
                      }`}
                    >
                      this address
                    </Link>
                  </h2>
                  <h2 className={styles.hint}>You may collect it</h2>
                  <Web3Button
                    className={styles.createButton}
                    contractAddress={LENS_CONTRACT_ADDRESS}
                    contractAbi={LENS_CONTRACT_ABI}
                    action={async () => {
                      if (!publicationDataState.publication) return;
                      return await collect(publicationDataState.publication.id);
                    }}
                  >
                    Collect Now
                  </Web3Button>
                </div>
                {collectorsState.whoCollectedPublication.items.length > 0 ? (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      Publication's collectors are:
                    </h2>
                    <div className={styles.collectsContainer}>
                      {collectorsState.whoCollectedPublication.items.map(
                        (collector) => {
                          return (
                            <div>
                              <ProfilePreview
                                profileId={collector.defaultProfile?.id}
                              ></ProfilePreview>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.collectsContainer}>
                    <h2 className={styles.hint}>
                      No one collected 👜 this publication yet
                    </h2>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className={styles.container}>
                <div className={styles.postAndAddCollectContainer}>
                  <div className={styles.publicationContainer}>
                    <FeedPost
                      publication={publicationDataState.publication}
                    ></FeedPost>
                  </div>
                  <h2 className={styles.hint}>
                    This publication can be collected by user's followers only,
                    by paying{" "}
                    {
                      // @ts-ignore
                      publicationData.publication.collectModule.amount.value
                    }{" "}
                    as a fee to{" "}
                    <Link
                      href={`https://mumbai.polygonscan.com/address/${
                        // @ts-ignore
                        publicationData.publication.collectModule.recipient
                      }`}
                    >
                      this address
                    </Link>
                  </h2>
                  <h2 className={styles.hint}>you can follow</h2>
                  <Link
                    href={`/profile/${publicationDataState.publication.profile.handle}`}
                  >
                    {publicationDataState.publication.profile.handle}
                  </Link>
                </div>
                {collectorsState.whoCollectedPublication.items.length > 0 ? (
                  <div className={styles.collectsAndHintContainer}>
                    <h2 className={styles.hint}>
                      Publication's collectors are:
                    </h2>
                    <div className={styles.collectsContainer}>
                      {collectorsState.whoCollectedPublication.items.map(
                        (collector) => {
                          return (
                            <div>
                              <ProfilePreview
                                profileId={collector.defaultProfile?.id}
                              ></ProfilePreview>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.collectsContainer}>
                    <h2 className={styles.hint}>
                      No one collected 👜 this publication yet
                    </h2>
                  </div>
                )}
              </div>
            );
          }
        } else {
          return (
            <div className={styles.container}>
              <div className={styles.postAndAddCollectContainer}>
                <div className={styles.publicationContainer}>
                  <FeedPost
                    publication={publicationDataState.publication}
                  ></FeedPost>
                </div>
                <h2>
                  This publication can be collected by anyone, at{" "}
                  {
                    // @ts-ignore
                    publicationDataState.publication.collectModule.amount.value
                  }
                </h2>
                <h2 className={styles.hint}>You may collect it 💟</h2>
                <Web3Button
                  className={styles.createButton}
                  contractAddress={LENS_CONTRACT_ADDRESS}
                  contractAbi={LENS_CONTRACT_ABI}
                  action={async () => {
                    if (!publicationDataState.publication) return;
                    return await collect(publicationDataState.publication.id);
                  }}
                >
                  Collect Now
                </Web3Button>
              </div>
              {collectorsState.whoCollectedPublication.items.length > 0 ? (
                <div className={styles.collectsAndHintContainer}>
                  <h2 className={styles.hint}>Publication's collectors are:</h2>
                  <div className={styles.collectsContainer}>
                    {collectorsState.whoCollectedPublication.items.map(
                      (collector) => {
                        return (
                          <div>
                            <ProfilePreview
                              profileId={collector.defaultProfile?.id}
                            ></ProfilePreview>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.collectsContainer}>
                  <h2 className={styles.hint}>
                    No one collected 👜 this publication yet
                  </h2>
                </div>
              )}
            </div>
          );
        }
      }
    }
  }
}
