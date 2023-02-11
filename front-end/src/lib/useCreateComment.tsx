import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import { v4 } from "uuid";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import {
  PublicationMainFocus,
  useCreateCommentTypedDataMutation,
} from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";
type CreateCommentArgs = {
  publicationId: any;
  image: File | null;
  title: string;
  description: string;
  content: string;
};
export default function useCreateComment() {
  const { isSignedInQuery, profileQuery } = useLensUser();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { mutateAsync: requestTypedData } = useCreateCommentTypedDataMutation();
  const sdk = useSDK();
  async function createComment({
    publicationId,
    image,
    title,
    description,
    content,
  }: CreateCommentArgs) {
    await login();
    let imageIPFS;
    if (image != null) {
      imageIPFS = (await uploadToIPFS({ data: [image] }))[0];
    } else {
      imageIPFS = null;
    }

    console.log("useCreatComment: image to IPFS: ", imageIPFS);
    const ipfsHash = (
      await uploadToIPFS({
        data: [
          {
            version: "2.0.0",
            mainContentFocus: PublicationMainFocus.TextOnly,
            metadata_id: v4(),
            description: description,
            locale: "en-US",
            content: content,
            external_url: null,
            image: imageIPFS,
            imageMimeType: null,
            name: title,
            attributes: [],
            tags: [],
          },
        ],
      })
    )[0];
    console.log("useCreatComment: DATA to IPFS: ", ipfsHash);
    const typedData = await requestTypedData({
      request: {
        profileId: profileQuery.data?.defaultProfile?.id,
        collectModule: { revertCollectModule: true },
        contentURI: ipfsHash,
        publicationId: publicationId,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });
    console.log("useCreatComment: requested typed data");
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createCommentTypedData.typedData.domain,
      typedData.createCommentTypedData.typedData.types,
      typedData.createCommentTypedData.typedData.value
    );
    console.log("useCreatComment: signed data");
    const { v, r, s } = splitSignature(signatureObject.signature);
    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );
    const result = await lensHubContract.call("commentWithSig", {
      profileId: typedData.createCommentTypedData.typedData.value.profileId,
      contentURI: typedData.createCommentTypedData.typedData.value.contentURI,
      profileIdPointed:
        typedData.createCommentTypedData.typedData.value.profileIdPointed,
      pubIdPointed:
        typedData.createCommentTypedData.typedData.value.pubIdPointed,
      collectModule:
        typedData.createCommentTypedData.typedData.value.collectModule,
      collectModuleInitData:
        typedData.createCommentTypedData.typedData.value.collectModuleInitData,
      referenceModule:
        typedData.createCommentTypedData.typedData.value.referenceModule,
      referenceModuleInitData:
        typedData.createCommentTypedData.typedData.value
          .referenceModuleInitData,
      referenceModuleData:
        typedData.createCommentTypedData.typedData.value.referenceModuleData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.createCommentTypedData.typedData.value.deadline,
      },
    });
    console.log("useCreatComment: called the contract");
  }

  return useMutation(createComment);
}
