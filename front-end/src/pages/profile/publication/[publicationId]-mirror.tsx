import FeedPost from "@/src/components/FeedPost";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "@/src/constants/contracts";
import { fetcher } from "@/src/graphql/auth-fetcher";
import {
  ExplorePublicationsDocument,
  ExplorePublicationsQuery,
  ExplorePublicationsQueryVariables,
  PublicationDocument,
  PublicationQuery,
  PublicationQueryVariables,
  PublicationsDocument,
  PublicationSortCriteria,
  PublicationTypes,
  useExplorePublicationsQuery,
  usePublicationQuery,
} from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import useCreateMirror from "@/src/lib/useCreateMirror";
import { useAddress, Web3Button } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/CreateMirror.module.css";
export default function publicationMerrorsPage() {
  const address = useAddress();
  const router = useRouter();
  let { publicationId } = router.query;
  const { mutateAsync: createMirror } = useCreateMirror();
  const { isSignedInQuery } = useLensUser();
  const [publicationDataState, setPublicationDataState] =
    useState<PublicationQuery>();
  const [publicationMirrorsState, setPublicationMirrorsState] =
    useState<ExplorePublicationsQuery["explorePublications"]["items"]>();
  let {
    data: publicationData,
    isLoading: publicationLoading,
    isError: publicationError,
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
    data: mirrorsData,
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
  console.log("publicationDataState: ", publicationDataState);
  // @ts-ignore
  let publicationMirrors = mirrorsData?.explorePublications.items.filter(
    (mirror) => {
      // @ts-ignore
      return mirror.mirrorOf?.id == publicationId;
    }
  );

  async function updatePublication() {
    if (!publicationId) return;
    const publicationQuery = fetcher<
      PublicationQuery,
      PublicationQueryVariables
    >(PublicationDocument, {
      request: { publicationId: publicationId },
    });
    publicationData = await publicationQuery();
    if (publicationData.publication) {
      setPublicationDataState(publicationData);
    }
  }
  async function updateMirrors() {
    if (!publicationId) return;
    const mirrorsQuery = fetcher<
      ExplorePublicationsQuery,
      ExplorePublicationsQueryVariables
    >(ExplorePublicationsDocument, {
      request: {
        publicationTypes: [PublicationTypes.Mirror],
        sortCriteria: PublicationSortCriteria.Latest,
      },
    });
    mirrorsData = await mirrorsQuery();
    // console.log("inside updateUI:, mirrorsData", mirrorsData);
    const customPublicationMirrors =
      mirrorsData?.explorePublications.items.filter((mirror) => {
        // @ts-ignore
        return mirror.mirrorOf?.id == publicationId;
      });
    if (
      publicationMirrors &&
      customPublicationMirrors &&
      customPublicationMirrors.length > publicationMirrors.length
    ) {
      publicationMirrors = customPublicationMirrors;
      setPublicationMirrorsState(customPublicationMirrors);
    } else {
      setPublicationMirrorsState(publicationMirrors);
    }
  }

  useEffect(() => {
    updatePublication();
  }, [publicationData, publicationDataState]);
  useEffect(() => {
    updateMirrors();
  }, [publicationMirrors, publicationMirrorsState]);

  if (publicationData?.publication) {
    return (
      <div className={styles.container}>
        <div className={styles.postAndMirrorContainer}>
          <div className={styles.publicationContainer}>
            <FeedPost publication={publicationData.publication}></FeedPost>
          </div>
          {address && isSignedInQuery.data && (
            <div className={styles.formContainer}>
              <Web3Button
                className={styles.createButton}
                contractAddress={LENS_CONTRACT_ADDRESS}
                contractAbi={LENS_CONTRACT_ABI}
                action={async () => {
                  await createMirror({
                    profileId: publicationData?.publication?.profile.id,
                    publicationId: publicationId,
                  });
                }}
              >
                Mirror
              </Web3Button>
            </div>
          )}
        </div>
        <div className={styles.mirrorsContainer}>
          {publicationMirrorsState ? (
            publicationMirrorsState.length > 0 ? (
              <div className={styles.publicationContainer}>
                <h3 className={styles.hint}> Mirrors: </h3>
                {publicationMirrorsState.map((mirror) => {
                  return (
                    <FeedPost publication={mirror} key={mirror.id}></FeedPost>
                  );
                })}
              </div>
            ) : publicationDataState &&
              publicationDataState.publication &&
              publicationDataState?.publication?.stats.totalAmountOfMirrors >
                0 ? (
              <div className={styles.hint}>
                Could not load all the previous mirrors
              </div>
            ) : (
              <div className={styles.hint}>No mirrors 🪞 for this Post yet</div>
            )
          ) : (
            <div className={styles.hint}>Loading mirrors of the post</div>
          )}
        </div>
      </div>
    );
  } else {
    return <div className={styles.hint}>Loading publication</div>;
  }
}
