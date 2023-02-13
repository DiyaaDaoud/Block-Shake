import { useAddress } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import FeedPost from "../components/FeedPost";
import { fetcher } from "../graphql/auth-fetcher";
import {
  ExplorePublicationsDocument,
  ExplorePublicationsQuery,
  ExplorePublicationsQueryVariables,
  PublicationSortCriteria,
  PublicationTypes,
  useExplorePublicationsQuery,
} from "../graphql/generated";
import useLensUser from "../lib/auth/useLensUser";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [sortState, setSortState] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  const [userfilter, setUserFilter] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  const [canLoadMore, setCanLoadMore] = useState<boolean>(false);
  const [loadMorePressed, setLoadMorePressed] = useState<boolean>(false);
  const [loadMoreButtonLoading, setLoadMoreButtonLoading] =
    useState<string>("Show More");
  const [dataToShow, setDataToShow] = useState<ExplorePublicationsQuery | null>(
    null
  );
  const address = useAddress();
  const { isSignedInQuery, profileQuery } = useLensUser();
  const { isLoading, error, data } = useExplorePublicationsQuery(
    {
      request: {
        sortCriteria: userfilter
          ? userfilter
          : PublicationSortCriteria.TopCollected,
        publicationTypes: [PublicationTypes.Post],
        // noRandomize: true,
      },
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  // console.log("user filter: ", userfilter);
  const [sortToShow, setSortToShow] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  // let sortToShow: PublicationSortCriteria = PublicationSortCriteria.Latest;
  const [prevsortToShow, setprevSortToShow] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  //
  // let prevsortToShow: PublicationSortCriteria = PublicationSortCriteria.Latest;
  // console.log("sort to show: ", sortToShow);
  // console.log("prevsortToShow: ", prevsortToShow);
  // console.log("dataToShow: ", dataToShow);
  const [update, setUpdate] = useState<boolean>(false);
  async function updatUI() {
    if (dataToShow == null || (dataToShow && userfilter != prevsortToShow)) {
      // console.log("in 0 ");

      setSortToShow(userfilter);
      // console.log("in 1 ");
      const exploreQuery = fetcher<
        ExplorePublicationsQuery,
        ExplorePublicationsQueryVariables
      >(ExplorePublicationsDocument, {
        request: {
          sortCriteria: sortToShow,
          publicationTypes: [PublicationTypes.Post],
        },
      });
      const newData = await exploreQuery();
      // console.log("in 2 ");

      setDataToShow(newData);
      // console.log("in 3 ");

      setprevSortToShow(userfilter);
      // console.log("in 5 ");

      return;
      // console.log("newData: ", newData);
    }
    if (dataToShow?.explorePublications.pageInfo.next) {
      setCanLoadMore(true);
    } else {
      setCanLoadMore(false);
    }
    if (
      dataToShow?.explorePublications.pageInfo.next &&
      dataToShow.explorePublications.items.length > 0 &&
      loadMorePressed
    ) {
      const exploreQueryNext = fetcher<
        ExplorePublicationsQuery,
        ExplorePublicationsQueryVariables
      >(ExplorePublicationsDocument, {
        request: {
          sortCriteria: sortToShow,
          publicationTypes: [PublicationTypes.Post],
          // noRandomize: true,
          cursor: dataToShow.explorePublications.pageInfo.next,
        },
      });
      const pubsNew = await exploreQueryNext();
      if (pubsNew.explorePublications.items) {
        let dataArray: ExplorePublicationsQuery["explorePublications"]["items"][0][];
        let newItems: ExplorePublicationsQuery["explorePublications"]["items"][0][];
        dataArray = dataToShow.explorePublications.items;
        newItems = pubsNew.explorePublications.items;
        newItems.map((newItem) => {
          dataArray.push(newItem);
        });
        // console.log("dataArray: ", dataArray);

        let newPageInfo = pubsNew.explorePublications.pageInfo;
        let newDataToshow: ExplorePublicationsQuery;
        newDataToshow = {
          __typename: "Query",
          explorePublications: { items: dataArray, pageInfo: newPageInfo },
        };
        // console.log("newDataToshow", newDataToshow);
        setDataToShow(newDataToshow);
      }
      setLoadMoreButtonLoading("Show More");
      setLoadMorePressed(false);
    }
  }
  useEffect(() => {
    updatUI();
  }, [loadMorePressed, dataToShow, data, userfilter]);
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.hintContainer}>
          <h4 className={styles.hint}> Loading...</h4>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.hintContainer}>
          <h4 className={styles.hint}>
            Error loading top collected publications
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.sortContainer}>
          <div
            className={styles.radioInput}
            onChange={(e) => {
              // @ts-ignore
              setSortState(e.target.value);
            }}
          >
            <input
              type="radio"
              value={PublicationSortCriteria.TopCollected}
              name="publicationSort"
            />
            <p>Top Collected</p>
          </div>
          <div
            className={styles.radioInput}
            onChange={(e) => {
              // @ts-ignore
              setSortState(e.target.value);
            }}
          >
            <input
              type="radio"
              value={PublicationSortCriteria.TopCommented}
              name="publicationSort"
            />
            <p>Top Commented</p>
          </div>
          <div
            className={styles.radioInput}
            onChange={(e) => {
              // @ts-ignore
              setSortState(e.target.value);
            }}
          >
            <input
              type="radio"
              value={PublicationSortCriteria.TopMirrored}
              name="publicationSort"
            />
            <p>Top Mirrored</p>
          </div>
          <div
            className={styles.radioInput}
            onChange={(e) => {
              // @ts-ignore
              setSortState(e.target.value);
            }}
          >
            <input
              type="radio"
              value={PublicationSortCriteria.CuratedProfiles}
              name="publicationSort"
            />
            <p>Curated Profiles</p>
          </div>
          <div
            className={styles.radioInput}
            onChange={(e) => {
              // @ts-ignore
              setSortState(e.target.value);
            }}
          >
            <input
              type="radio"
              value={PublicationSortCriteria.Latest}
              name="publicationSort"
            />
            <p>Latest</p>
          </div>
          <div className={styles.sortButtonContainer}>
            <button
              className={styles.sortButton}
              onClick={() => {
                setUserFilter(sortState);
              }}
            >
              Set Filter
            </button>
          </div>
        </div>
      </div>
      {dataToShow?.explorePublications.items && (
        <div className={styles.postsContainer}>
          {dataToShow?.explorePublications.items.map((publication) =>
            publication.__typename == "Post" ? (
              <FeedPost
                publication={publication}
                key={publication.id}
              ></FeedPost>
            ) : null
          )}
          {canLoadMore && (
            <button
              className={styles.showMoreButton}
              onClick={() => {
                setLoadMorePressed(true);
                setLoadMoreButtonLoading("Loading..");
              }}
            >
              {loadMoreButtonLoading}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
