import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { ConnectWallet } from "@thirdweb-dev/react";
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
  const [sortToShow, setSortToShow] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  const [prevsortToShow, setprevSortToShow] = useState<PublicationSortCriteria>(
    PublicationSortCriteria.Latest
  );
  const { isLoading, error, data } = useExplorePublicationsQuery(
    {
      request: {
        sortCriteria: userfilter || PublicationSortCriteria.Latest,
        publicationTypes: [PublicationTypes.Post],
      },
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
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
          sortCriteria: userfilter,
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
        let newPageInfo = pubsNew.explorePublications.pageInfo;
        let newDataToshow: ExplorePublicationsQuery;
        newDataToshow = {
          __typename: "Query",
          explorePublications: { items: dataArray, pageInfo: newPageInfo },
        };
        setDataToShow(newDataToshow);
      }
      setLoadMoreButtonLoading("Show More");
      setLoadMorePressed(false);
    }
  }
  useEffect(() => {
    updatUI();
  }, [loadMorePressed, dataToShow, data, userfilter]);
  if (isLoading || (data && !dataToShow)) {
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
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Couldn't fetch posts!</AlertTitle>
        <AlertDescription>Try to refresh the page</AlertDescription>
      </Alert>
    );
  }
  // console.log("data to sow: ", dataToShow);
  return (
    <Container
      justifyContent="space-between"
      alignContent="flex-start"
      flexDirection="row"
      display="flex"
      marginTop="16px"
    >
      <Container
        width="25%"
        marginRight="75%"
        justifyContent="flex-start"
        alignItems="left"
        position="fixed"
        display="flex"
        flexDirection="column"
        left="0"
      >
        <Box>
          <RadioGroup
            // @ts-ignore
            onChange={setSortState}
            value={sortState}
            paddingBottom="10px"
          >
            <Stack direction="column">
              <Radio
                value={PublicationSortCriteria.TopCollected}
                colorScheme="gray"
              >
                Top Collected
              </Radio>
              <Radio
                value={PublicationSortCriteria.TopCommented}
                colorScheme="gray"
              >
                Top Commented
              </Radio>
              <Radio
                value={PublicationSortCriteria.TopMirrored}
                colorScheme="gray"
              >
                Top Mirrored
              </Radio>
              <Radio
                value={PublicationSortCriteria.CuratedProfiles}
                colorScheme="gray"
              >
                Curated Profiles
              </Radio>
              <Radio value={PublicationSortCriteria.Latest} colorScheme="gray">
                Latest
              </Radio>
            </Stack>
          </RadioGroup>
          <Button
            variant="solid"
            // backgroundColor="#572860"
            size="sm"
            background="#501030"
            color="white"
            onClick={async () => {
              setUserFilter(sortState);
            }}
          >
            Change Filter
          </Button>
        </Box>
      </Container>
      <Box
        width="50%"
        left="25%"
        right="25%"
        justifyContent="center"
        alignItems="center"
        display="flex"
        flexDirection="column"
        position="absolute"
        gap="5px"
        paddingBottom="10px"
      >
        {dataToShow?.explorePublications.items.map((pubication) => {
          return (
            <FeedPost
              publication={pubication}
              key={pubication.id}
              requiredDetails={false}
              mainPub={true}
            ></FeedPost>
          );
        })}
        {canLoadMore && (
          // @ts-ignore
          <Button
            variant="solid"
            backgroundColor="#501030"
            isLoading={loadMorePressed}
            size="sm"
            color="white"
            onClick={async () => {
              setLoadMorePressed(true);
            }}
          >
            Show More
          </Button>
        )}
      </Box>
    </Container>
  );
}
