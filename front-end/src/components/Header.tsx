import SignInButton from "./SignInButton";

import styles from "../styles/Header.module.css";
import Link from "next/link";
import SearchComponent from "./SearchComponent";
export default function Header() {
  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <div className={styles.left}>
            <SignInButton></SignInButton>
          </div>
        </div>
        <div className={styles.midSection}>
          <SearchComponent></SearchComponent>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.right}>
            <Link href={"/"}>
              <img src="/logo2.png" className={styles.logo}></img>
            </Link>
          </div>
        </div>
      </div>
      <div style={{ height: 64 }}></div>
    </>
  );
}
