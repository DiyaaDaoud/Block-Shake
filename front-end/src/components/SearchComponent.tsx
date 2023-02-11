import Link from "next/link";
import { useState } from "react";
enum SearchType {
  profile = "Profile",
  publication = "Publication",
}
import styles from "../styles/Header.module.css";
export default function SearchComponent() {
  const [target, setTarget] = useState<string>("");
  const [searchMethod, setSearchMethod] = useState<SearchType>();
  const [textAreaPlaceholder, setTextAreaPlaceholder] = useState<string>("");
  // console.log("target", target);
  // console.log("search method: ", searchMethod);
  return (
    <div className={styles.searchCompContiner}>
      <textarea
        className={styles.searchText}
        placeholder={textAreaPlaceholder}
        defaultValue=""
        onChange={(e) => {
          setTarget(e.target.value);
        }}
      ></textarea>
      <div
        className={styles.selector}
        onChange={(e) => {
          // @ts-ignore
          setSearchMethod(e.target.value);
          // @ts-ignore
          if (e.target.value == SearchType.profile) {
            setTextAreaPlaceholder("type in a profile handle to search..");
          } else {
            setTextAreaPlaceholder(
              "type in a publication hashtag or tag to search.."
            );
          }
        }}
      >
        <input type="radio" value={SearchType.profile} name="searchMethod" />{" "}
        <p className={styles.selectOption}>Profile</p>
        <input
          className={styles.selectOption}
          type="radio"
          value={SearchType.publication}
          name="searchMethod"
        />
        <p className={styles.selectOption}>Publication</p>
      </div>
      {searchMethod == SearchType.profile ? (
        <Link
          href={{
            pathname: `/profile/[target]-searchProfiles`,
            query: { target: target },
          }}
        >
          🔎
        </Link>
      ) : searchMethod == SearchType.publication ? (
        <Link
          href={{
            pathname: `/profile/[target]-searchPublications`,
            query: { target: target },
          }}
        >
          🔎
        </Link>
      ) : (
        <p>🔎</p>
      )}
    </div>
  );
}
