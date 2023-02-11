import ProfilePreview from "@/src/components/ProfilePreview";
import {
  SearchRequestTypes,
  useSearchProfilesQuery,
  useSearchPublicationsQuery,
} from "@/src/graphql/generated";
import { useRouter } from "next/router";
import styles from "../../styles/ProfileSearch.module.css";
export default function search() {
  const router = useRouter();
  const { target } = router.query;
  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useSearchProfilesQuery(
    {
      request: {
        type: SearchRequestTypes.Profile,
        query: target,
      },
    },
    {
      enabled: !!target,
    }
  );
  if (searchLoading)
    return (
      <div className={styles.container}>
        <h2 className={styles.hint}>Loading Related Profiles..</h2>
      </div>
    );
  if (searchError) {
    return (
      <div className={styles.container}>
        <h2 className={styles.hint}>Error Loading Related Profiles 💔</h2>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {
        // @ts-ignore
        searchData.search.items && searchData.search.items.length == 0 && (
          <div className={styles.hint}>
            <h2>Sorry 💔 we did not fine any matching profiles </h2>
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
                Thre are atleast {searchData.search.items.length} matching
                profiles 💟
              </h2>
            ) : (
              <h2 className={styles.hint}>
                {/** @ts-ignore */}
                Thre are {searchData.search.items.length} matching profiles 💟
              </h2>
            )}

            <div className={styles.profiles}>
              {/** @ts-ignore */}
              {searchData.search.items.map((profile) => {
                return (
                  <div>
                    <ProfilePreview profileId={profile.id}></ProfilePreview>{" "}
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
