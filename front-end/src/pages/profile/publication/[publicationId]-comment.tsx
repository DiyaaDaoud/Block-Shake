import FeedPost from "@/src/components/FeedPost";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "@/src/constants/contracts";
import { fetcher } from "@/src/graphql/auth-fetcher";
import {
  PublicationDocument,
  PublicationQuery,
  PublicationQueryVariables,
  PublicationsDocument,
  PublicationsQuery,
  PublicationsQueryVariables,
  usePublicationQuery,
  usePublicationsQuery,
} from "@/src/graphql/generated";
import useLensUser from "@/src/lib/auth/useLensUser";
import useCreateComment from "@/src/lib/useCreateComment";
import { Web3Button } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/CreateComment.module.css";
export default function publicationCommentsPage() {
  const router = useRouter();
  let { publicationId } = router.query;
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [publicationState, setPublicationState] = useState<PublicationQuery>();
  const [commentsState, setCommentsState] = useState<PublicationsQuery>();
  const { mutateAsync: createComment } = useCreateComment();
  const { isSignedInQuery } = useLensUser();
  let { isError, isLoading, data } = usePublicationQuery(
    {
      request: {
        publicationId: publicationId,
      },
    },
    {
      enabled: !!publicationId,
    }
  );
  console.log("publication:", data);
  publicationId = data?.publication?.id;
  let {
    isError: commentsError,
    isLoading: commentsLoading,
    data: comments,
  } = usePublicationsQuery(
    {
      request: {
        commentsOf: publicationId,
      },
    },
    {
      enabled: !!publicationId,
    }
  );
  if (!commentsLoading && !commentsError)
    console.log("comments are: ", comments);
  async function updateUI() {
    if (!publicationId) return;
    const publicationQuery = fetcher<
      PublicationQuery,
      PublicationQueryVariables
    >(PublicationDocument, {
      request: { publicationId: publicationId },
    });
    data = await publicationQuery();
    const commentsQuery = fetcher<
      PublicationsQuery,
      PublicationsQueryVariables
    >(PublicationsDocument, {
      request: {
        commentsOf: publicationId,
      },
    });
    comments = await commentsQuery();
    if (data.publication) {
      setPublicationState(data);
    }
    if (comments.publications) {
      setCommentsState(comments);
    }
  }

  useEffect(() => {
    updateUI();
  });
  if (data?.publication?.id) {
    return (
      <div className={styles.container}>
        <div className={styles.postAndAddCommentContainer}>
          <div className={styles.publicationContainer}>
            <FeedPost publication={data.publication}></FeedPost>
          </div>
          {isSignedInQuery.data && (
            <div className={styles.addCommentContainer}>
              <h3 className={styles.hint}>Add your comment ⤵️</h3>
              <div className={styles.formContainer}>
                <input
                  className={styles.chooseFileContainer}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) setImage(e.target.files[0]);
                  }}
                ></input>
                <input
                  className={styles.tilteContainer}
                  type="text"
                  placeholder="Title"
                  onChange={(e) => setTitle(e.target.value)}
                ></input>
              </div>
              <div className={styles.formContainer}>
                <textarea
                  className={styles.contentContainer}
                  placeholder="Content"
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>

                <textarea
                  className={styles.descriptionContainer}
                  placeholder="Decription"
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                <Web3Button
                  className={styles.createButton}
                  contractAddress={LENS_CONTRACT_ADDRESS}
                  contractAbi={LENS_CONTRACT_ABI}
                  action={async () => {
                    if (!publicationId || !publicationId[0]) return;
                    return await createComment({
                      publicationId,
                      image,
                      title,
                      description,
                      content,
                    });
                  }}
                >
                  Create Comment
                </Web3Button>
              </div>
            </div>
          )}
        </div>

        {commentsState?.publications?.items &&
          (commentsState?.publications?.items?.length > 0 ? (
            <div className={styles.commentsContainer}>
              <h3 className={styles.hint} style={{ paddingBottom: "16px" }}>
                Comments 💭
              </h3>
              <div className={styles.commentContainer}>
                {commentsState.publications.items.map((comment) => (
                  <FeedPost publication={comment} key={comment.id}></FeedPost>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.formContainer}>
              Be the first to Comment 💭 on this publication
            </div>
          ))}
      </div>
    );
  }
}
