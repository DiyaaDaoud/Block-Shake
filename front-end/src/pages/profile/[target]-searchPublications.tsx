import FeedPost from "@/src/components/FeedPost";
import {
  SearchRequestTypes,
  useSearchPublicationsQuery,
} from "@/src/graphql/generated";
import { useRouter } from "next/router";
import styles from "../../styles/PublicationsSearch.module.css";
export default function search() {
  const router = useRouter();
  const { target } = router.query;
  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useSearchPublicationsQuery(
    {
      request: {
        type: SearchRequestTypes.Publication,
        query: target,
      },
    },
    {
      enabled: !!target,
    }
  );
  if (searchLoading)
    return (
      <div style={{ alignContent: "center", justifyContent: "center" }}>
        Loading Related Publications..
      </div>
    );
  if (searchError) {
    return (
      <div style={{ alignContent: "center", justifyContent: "center" }}>
        Error Loading Related Publications 💔
      </div>
    );
  }
  console.log("search data:", searchData);
  return (
    <div className={styles.container}>
      {
        // @ts-ignore
        searchData.search.items && searchData.search.items.length == 0 && (
          <div className={styles.hint}>
            <h2>Sorry 💔 we did not fine any matching Publication </h2>
          </div>
        )
      }
      {
        // @ts-ignore
        searchData.search.items && searchData.search.items.length > 0 && (
          <div className={styles.container}>
            {/** @ts-ignore */}
            {searchData.search.items.length >= 40 ? (
              <h2 className={styles.hint}>
                {/** @ts-ignore */}
                There are atleast {searchData.search.items.length} matching
                publications 💟
              </h2>
            ) : (
              <h2 className={styles.hint}>
                {/** @ts-ignore */}
                Thre are {searchData.search.items.length} matching publications
                💟
              </h2>
            )}

            <div className={styles.container}>
              {/** @ts-ignore */}
              {searchData.search.items.map((publication) => {
                return (
                  <div className={styles.publications}>
                    {" "}
                    <FeedPost publication={publication}></FeedPost>{" "}
                  </div>
                );
              })}
            </div>
          </div>
        )
      }
    </div>
  );
}
