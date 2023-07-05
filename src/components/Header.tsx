import SignInButton from "./SignInButton";
import { Box } from "@chakra-ui/react";
export default function Header() {
  return (
    <>
      <Box
        boxShadow="2xl"
        width="100%"
        top="0"
        height="64px"
        display="flex"
        flexDirection="row"
        position="fixed"
        justifyContent="flex-start"
        // backdropContrast="40"
        backgroundColor="#501030"
        zIndex="9999"
      >
        <Box
          width="25%"
          marginRight="75%"
          left="0"
          display="flex"
          flexDirection="row"
          gap="8px"
          alignItems="center"
          justifyContent="center"
        >
          <SignInButton></SignInButton>
        </Box>
      </Box>
      <Box height="64px"></Box>
    </>
    // <>
    //   <div className={styles.headerContainer}>
    //     <div className={styles.leftSection}>
    //       <div className={styles.left}>
    //         <SignInButton></SignInButton>
    //       </div>
    //     </div>
    //     <div className={styles.midSection}>
    //       <SearchComponent></SearchComponent>
    //     </div>
    //     <div className={styles.rightSection}>
    //       <div className={styles.right}>
    //         <Link href={"/"}>
    //           <img src="/logo2.png" className={styles.logo}></img>
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    //   <div style={{ height: 64 }}></div>
    // </>
  );
}
