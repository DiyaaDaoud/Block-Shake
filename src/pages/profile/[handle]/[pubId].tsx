import FeedPost from "@/src/components/FeedPost";
import {
  usePublicationQuery,
  usePublicationsQuery,
} from "@/src/graphql/generated";
import { Box, Container, Flex, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

const publicationPage = () => {
  const router = useRouter();
  const { handle, pubId } = router.query;
  let {
    isError: pubError,
    isLoading: pubLoading,
    data: pubData,
  } = usePublicationQuery(
    {
      request: {
        publicationId: pubId,
      },
    },
    {
      enabled: !!pubId,
    }
  );
  let {
    isError: commentsError,
    isLoading: commentsLoading,
    data: comments,
  } = usePublicationsQuery(
    {
      request: {
        commentsOf: pubId,
      },
    },
    {
      enabled: !!pubId,
    }
  );
  if (pubLoading) {
    return (
      // @ts-ignore
      <Container
        justifyContent="center"
        alignContent="center"
        flexDirection="row"
        display="flex"
      >
        <Spinner color="#571e60" marginTop="10%"></Spinner>
      </Container>
    );
  }
  console.log(comments);
  if (!pubLoading && !pubError && pubData?.publication) {
    return (
      <Container
        justifyContent="center"
        alignContent="center"
        flexDirection="column"
        display="flex"
        maxW={"2xl"}
        marginTop="1%"
        marginBottom="1%"
      >
        <FeedPost
          publication={pubData.publication}
          requiredDetails={true}
          mainPub={true}
        ></FeedPost>
        {commentsLoading && (
          <Container
            justifyContent="center"
            alignContent="center"
            display="flex"
          >
            <Spinner color="#571e60" marginTop="10%"></Spinner>
          </Container>
        )}
        {!commentsLoading &&
          !commentsError &&
          comments?.publications &&
          comments.publications.items.map((comment, index) => (
            <Box marginTop="1%">
              <FeedPost
                publication={comment}
                requiredDetails={false}
                mainPub={false}
              ></FeedPost>
            </Box>
          ))}
      </Container>
    );
  }
};

export default publicationPage;
